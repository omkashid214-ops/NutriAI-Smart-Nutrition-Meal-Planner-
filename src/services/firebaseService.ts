import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  Unsubscribe,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MealItem, MealLogEntry, MealSlot, UserProfile } from '../types/nutrition';
import { calculateBMI, calculateCaloriePlan } from './nutritionEngine';

// Initialize Firebase App, Firestore (with explicit firestoreDatabaseId), and Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on startup
async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

// --- Auth Helpers ---

export function subscribeToAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function registerWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(result.user, { displayName: fullName.trim().slice(0, 80) });
  try {
    await sendEmailVerification(result.user);
  } catch {
    // Verification email sending is best-effort
  }
  return result.user;
}

export async function logoutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

// --- Sanitization matching firebase-blueprint.json & firestore.rules ---

function sanitizeProfileFields(profile: UserProfile) {
  const age = Math.round(Math.max(10, Math.min(120, Number(profile.age) || 22)));
  const heightCm = Math.round(Math.max(80, Math.min(260, Number(profile.heightCm) || 170)) * 10) / 10;
  const weightKg = Math.round(Math.max(20, Math.min(300, Number(profile.weightKg) || 68)) * 10) / 10;

  const bmiResult = calculateBMI(heightCm, weightKg);
  const caloriePlan = calculateCaloriePlan({
    age,
    gender: profile.gender,
    heightCm,
    weightKg,
    activityLevel: profile.activityLevel,
    fitnessGoal: profile.fitnessGoal,
  });

  return {
    uid: profile.uid,
    fullName: (profile.fullName || 'NutriAI Member').trim().slice(0, 80),
    email: (profile.email || 'user@nutriai.app').trim().slice(0, 160),
    age,
    gender: profile.gender,
    heightCm,
    weightKg,
    activityLevel: profile.activityLevel,
    dietaryPreference: profile.dietaryPreference,
    fitnessGoal: profile.fitnessGoal,
    bmi: bmiResult.bmi,
    bmiCategory: bmiResult.category,
    dailyCalorieTarget: caloriePlan.targetCalories,
  };
}

// --- Firestore CRUD for UserProfile ---

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<UserProfile> {
  const path = `users/${profile.uid}`;
  const clean = sanitizeProfileFields(profile);
  const ref = doc(db, 'users', profile.uid);

  try {
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        fullName: clean.fullName,
        age: clean.age,
        gender: clean.gender,
        heightCm: clean.heightCm,
        weightKg: clean.weightKg,
        activityLevel: clean.activityLevel,
        dietaryPreference: clean.dietaryPreference,
        fitnessGoal: clean.fitnessGoal,
        bmi: clean.bmi,
        bmiCategory: clean.bmiCategory,
        dailyCalorieTarget: clean.dailyCalorieTarget,
        updatedAt: serverTimestamp(),
      });
    }
    return clean;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToUserProfile(
  uid: string,
  onData: (profile: UserProfile | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${uid}`;
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      onData(snap.exists() ? (snap.data() as UserProfile) : null);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.GET, path);
        } catch (wrapped) {
          onError(wrapped as Error);
        }
      } else {
        handleFirestoreError(error, OperationType.GET, path);
      }
    }
  );
}

// --- Firestore CRUD for MealLogEntry ---

export function generateSafeLogId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `log_${Date.now()}_${rand}`;
}

export function subscribeToMealLogs(
  uid: string,
  dateKey: string,
  onData: (entries: MealLogEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${uid}/mealLogs`;
  const q = query(
    collection(db, 'users', uid, 'mealLogs'),
    where('userId', '==', uid),
    where('dateKey', '==', dateKey)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MealLogEntry[] = snapshot.docs.map((d) => d.data() as MealLogEntry);
      onData(items);
    },
    (error) => {
      if (onError) {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrapped) {
          onError(wrapped as Error);
        }
      } else {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    }
  );
}

export async function addMealLogToFirestore(
  uid: string,
  dateKey: string,
  mealSlot: MealSlot,
  meal: MealItem,
  servings = 1
): Promise<MealLogEntry> {
  const safeServings = Math.max(0.25, Math.min(10, Math.round(servings * 4) / 4));
  const id = generateSafeLogId();
  const path = `users/${uid}/mealLogs/${id}`;

  const payload = {
    id,
    userId: uid,
    dateKey,
    mealSlot,
    mealId: meal.id,
    mealName: meal.name.trim().slice(0, 120),
    dietType: meal.dietType,
    imageKey: meal.imageKey,
    servings: safeServings,
    calories: Math.min(5000, Math.round(meal.calories * safeServings)),
    proteinG: Math.min(300, Math.round(meal.proteinG * safeServings)),
    carbsG: Math.min(500, Math.round(meal.carbsG * safeServings)),
    fatG: Math.min(300, Math.round(meal.fatG * safeServings)),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'users', uid, 'mealLogs', id), payload);
    return payload as MealLogEntry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMealLogServingsInFirestore(
  uid: string,
  entry: MealLogEntry,
  baseMeal: MealItem | undefined,
  newServings: number
): Promise<void> {
  const safeServings = Math.max(0.25, Math.min(10, Math.round(newServings * 4) / 4));
  const path = `users/${uid}/mealLogs/${entry.id}`;

  const unitCal = baseMeal ? baseMeal.calories : entry.calories / Math.max(0.25, entry.servings);
  const unitPro = baseMeal ? baseMeal.proteinG : entry.proteinG / Math.max(0.25, entry.servings);
  const unitCarb = baseMeal ? baseMeal.carbsG : entry.carbsG / Math.max(0.25, entry.servings);
  const unitFat = baseMeal ? baseMeal.fatG : entry.fatG / Math.max(0.25, entry.servings);

  try {
    await updateDoc(doc(db, 'users', uid, 'mealLogs', entry.id), {
      servings: safeServings,
      calories: Math.min(5000, Math.round(unitCal * safeServings)),
      proteinG: Math.min(300, Math.round(unitPro * safeServings)),
      carbsG: Math.min(500, Math.round(unitCarb * safeServings)),
      fatG: Math.min(300, Math.round(unitFat * safeServings)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMealLogFromFirestore(
  uid: string,
  logId: string
): Promise<void> {
  const path = `users/${uid}/mealLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'mealLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
