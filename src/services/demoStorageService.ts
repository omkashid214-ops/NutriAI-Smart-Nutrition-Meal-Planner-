import { MEALS_DATASET } from '../data/mealsDataset';
import { MealItem, MealLogEntry, MealSlot, UserProfile } from '../types/nutrition';
import { buildDefaultUserProfile, getTodayDateKey } from './nutritionEngine';

const PROFILE_KEY = 'nutriai_demo_profile_v1';
const LOGS_KEY = 'nutriai_demo_logs_v1';
const DEMO_FLAG_KEY = 'nutriai_demo_active_v1';

export function isDemoModeActive(): boolean {
  try {
    return localStorage.getItem(DEMO_FLAG_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDemoModeActive(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(DEMO_FLAG_KEY, 'true');
    } else {
      localStorage.removeItem(DEMO_FLAG_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function loadDemoProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch {
    // Fallback to default
  }
  const initial = buildDefaultUserProfile('demo_user_01', 'Aarav Sharma', 'aarav.demo@nutriai.app');
  saveDemoProfile(initial);
  return initial;
}

export function saveDemoProfile(profile: UserProfile): UserProfile {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage errors
  }
  return profile;
}

function seedInitialDemoLogs(): MealLogEntry[] {
  const today = getTodayDateKey();
  const breakfast = MEALS_DATASET.find((m) => m.id === 'meal_oats_berry_almond') ?? MEALS_DATASET[0];
  const lunch = MEALS_DATASET.find((m) => m.id === 'meal_veg_paneer_quinoa_bowl') ?? MEALS_DATASET[6];
  const snack = MEALS_DATASET.find((m) => m.id === 'meal_vegan_green_protein_smoothie') ?? MEALS_DATASET[17];

  return [
    {
      id: 'demo_log_breakfast_1',
      userId: 'demo_user_01',
      dateKey: today,
      mealSlot: 'breakfast',
      mealId: breakfast.id,
      mealName: breakfast.name,
      dietType: breakfast.dietType,
      imageKey: breakfast.imageKey,
      servings: 1,
      calories: breakfast.calories,
      proteinG: breakfast.proteinG,
      carbsG: breakfast.carbsG,
      fatG: breakfast.fatG,
    },
    {
      id: 'demo_log_lunch_1',
      userId: 'demo_user_01',
      dateKey: today,
      mealSlot: 'lunch',
      mealId: lunch.id,
      mealName: lunch.name,
      dietType: lunch.dietType,
      imageKey: lunch.imageKey,
      servings: 1,
      calories: lunch.calories,
      proteinG: lunch.proteinG,
      carbsG: lunch.carbsG,
      fatG: lunch.fatG,
    },
    {
      id: 'demo_log_snack_1',
      userId: 'demo_user_01',
      dateKey: today,
      mealSlot: 'snacks',
      mealId: snack.id,
      mealName: snack.name,
      dietType: snack.dietType,
      imageKey: snack.imageKey,
      servings: 1,
      calories: snack.calories,
      proteinG: snack.proteinG,
      carbsG: snack.carbsG,
      fatG: snack.fatG,
    },
  ];
}

export function loadAllDemoLogs(): MealLogEntry[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (raw) {
      return JSON.parse(raw) as MealLogEntry[];
    }
  } catch {
    // Fallback
  }
  const seeded = seedInitialDemoLogs();
  saveAllDemoLogs(seeded);
  return seeded;
}

export function saveAllDemoLogs(logs: MealLogEntry[]): void {
  try {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  } catch {
    // Ignore
  }
}

export function createDemoMealLog(
  dateKey: string,
  mealSlot: MealSlot,
  meal: MealItem,
  servings = 1
): MealLogEntry {
  const safeServings = Math.max(0.25, Math.min(10, Math.round(servings * 4) / 4));
  const entry: MealLogEntry = {
    id: `demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: 'demo_user_01',
    dateKey,
    mealSlot,
    mealId: meal.id,
    mealName: meal.name,
    dietType: meal.dietType,
    imageKey: meal.imageKey,
    servings: safeServings,
    calories: Math.round(meal.calories * safeServings),
    proteinG: Math.round(meal.proteinG * safeServings),
    carbsG: Math.round(meal.carbsG * safeServings),
    fatG: Math.round(meal.fatG * safeServings),
  };
  const all = loadAllDemoLogs();
  saveAllDemoLogs([...all, entry]);
  return entry;
}

export function updateDemoMealLogServings(
  logId: string,
  baseMeal: MealItem | undefined,
  newServings: number
): MealLogEntry[] {
  const safeServings = Math.max(0.25, Math.min(10, Math.round(newServings * 4) / 4));
  const all = loadAllDemoLogs();
  const next = all.map((item) => {
    if (item.id !== logId) return item;
    const unitCal = baseMeal ? baseMeal.calories : item.calories / Math.max(0.25, item.servings);
    const unitPro = baseMeal ? baseMeal.proteinG : item.proteinG / Math.max(0.25, item.servings);
    const unitCarb = baseMeal ? baseMeal.carbsG : item.carbsG / Math.max(0.25, item.servings);
    const unitFat = baseMeal ? baseMeal.fatG : item.fatG / Math.max(0.25, item.servings);
    return {
      ...item,
      servings: safeServings,
      calories: Math.round(unitCal * safeServings),
      proteinG: Math.round(unitPro * safeServings),
      carbsG: Math.round(unitCarb * safeServings),
      fatG: Math.round(unitFat * safeServings),
    };
  });
  saveAllDemoLogs(next);
  return next;
}

export function deleteDemoMealLog(logId: string): MealLogEntry[] {
  const next = loadAllDemoLogs().filter((item) => item.id !== logId);
  saveAllDemoLogs(next);
  return next;
}
