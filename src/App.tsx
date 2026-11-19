/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Calculator,
  CalendarDays,
  CheckCircle2,
  Home,
  Leaf,
  Settings,
  UtensilsCrossed,
} from 'lucide-react';
import { AuthScreen } from './components/AuthScreen';
import { CalculatorsView } from './components/CalculatorsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeDashboard } from './components/HomeDashboard';
import { MealPlannerView } from './components/MealPlannerView';
import { ProfileForm } from './components/ProfileForm';
import { RecommendationsView } from './components/RecommendationsView';
import { SettingsView } from './components/SettingsView';
import { SplashScreen } from './components/SplashScreen';
import { getMealById } from './data/mealsDataset';
import {
  createDemoMealLog,
  deleteDemoMealLog,
  isDemoModeActive,
  loadAllDemoLogs,
  loadDemoProfile,
  saveDemoProfile,
  setDemoModeActive,
  updateDemoMealLogServings,
} from './services/demoStorageService';
import {
  addMealLogToFirestore,
  deleteMealLogFromFirestore,
  logoutFirebaseUser,
  saveUserProfile,
  subscribeToAuth,
  subscribeToMealLogs,
  subscribeToUserProfile,
  updateMealLogServingsInFirestore,
} from './services/firebaseService';
import {
  SLOT_LABELS,
  buildDefaultUserProfile,
  calculateCaloriePlan,
  generateSmartDailyPlan,
  getTodayDateKey,
  sumDailyNutrition,
} from './services/nutritionEngine';
import { MealItem, MealLogEntry, MealSlot, UserProfile } from './types/nutrition';

type NavTab = 'home' | 'meals' | 'planner' | 'calculators' | 'settings';

function NutriAIAppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [demoMode, setDemoMode] = useState<boolean>(() => isDemoModeActive());

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => getTodayDateKey(0));
  const [dayLogs, setDayLogs] = useState<MealLogEntry[]>([]);
  const [allDemoLogs, setAllDemoLogs] = useState<MealLogEntry[]>([]);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [savingProfile, setSavingProfile] = useState(false);
  const [addingMealId, setAddingMealId] = useState<string | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    window.setTimeout(() => {
      setToastMsg((prev) => (prev === message ? null : prev));
    }, 2600);
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (user) {
        setDemoMode(false);
        setDemoModeActive(false);
      }
    });
    return () => unsub();
  }, []);

  // Load Demo Mode state when active
  useEffect(() => {
    if (!demoMode) return;
    const loadedProfile = loadDemoProfile();
    const loadedLogs = loadAllDemoLogs();
    setProfile(loadedProfile);
    setAllDemoLogs(loadedLogs);
    setNeedsOnboarding(false);
    setProfileLoading(false);
  }, [demoMode]);

  // Filter Demo Logs for selected date
  useEffect(() => {
    if (!demoMode) return;
    setDayLogs(allDemoLogs.filter((entry) => entry.dateKey === selectedDateKey));
  }, [demoMode, allDemoLogs, selectedDateKey]);

  // Subscribe to Firebase Firestore User Profile when authenticated with verified email
  useEffect(() => {
    if (!authReady || demoMode || !firebaseUser) return;

    if (!firebaseUser.emailVerified) {
      // Unverified email/password sign-in: keep usable locally until verified
      const localFallback = buildDefaultUserProfile(
        firebaseUser.uid,
        firebaseUser.displayName || 'NutriAI Member',
        firebaseUser.email || 'user@nutriai.app'
      );
      setProfile(localFallback);
      setNeedsOnboarding(false);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    const unsubProfile = subscribeToUserProfile(
      firebaseUser.uid,
      (loaded) => {
        if (loaded) {
          setProfile(loaded);
          setNeedsOnboarding(false);
        } else {
          // Brand-new Firebase user: prompt onboarding form to create profile document first
          const starter = buildDefaultUserProfile(
            firebaseUser.uid,
            firebaseUser.displayName || 'NutriAI Member',
            firebaseUser.email || 'user@nutriai.app'
          );
          setProfile(starter);
          setNeedsOnboarding(true);
        }
        setProfileLoading(false);
      },
      (err) => {
        setRuntimeError(err.message);
        setProfileLoading(false);
      }
    );

    return () => unsubProfile();
  }, [authReady, demoMode, firebaseUser]);

  // Subscribe to Firebase Firestore Meal Logs for selected date (only once profile exists)
  useEffect(() => {
    if (!authReady || demoMode || !firebaseUser || !firebaseUser.emailVerified || needsOnboarding) {
      return;
    }

    const unsubLogs = subscribeToMealLogs(
      firebaseUser.uid,
      selectedDateKey,
      (entries) => {
        setDayLogs(entries);
      },
      (err) => {
        setRuntimeError(err.message);
      }
    );

    return () => unsubLogs();
  }, [authReady, demoMode, firebaseUser, selectedDateKey, needsOnboarding]);

  const handleStartDemo = useCallback(() => {
    setDemoModeActive(true);
    setDemoMode(true);
    setActiveTab('home');
  }, []);

  const handleSaveProfile = useCallback(
    async (updated: UserProfile) => {
      setSavingProfile(true);
      try {
        if (demoMode || !firebaseUser || !firebaseUser.emailVerified) {
          const saved = saveDemoProfile(updated);
          setProfile(saved);
          setNeedsOnboarding(false);
          showToast('Profile and nutrition targets updated.');
        } else {
          const saved = await saveUserProfile(updated);
          setProfile(saved);
          setNeedsOnboarding(false);
          showToast('Profile synced to Firebase Firestore.');
        }
      } catch (err: unknown) {
        setRuntimeError(err instanceof Error ? err.message : 'Failed to save profile.');
      } finally {
        setSavingProfile(false);
      }
    },
    [demoMode, firebaseUser, showToast]
  );

  const handleAddMeal = useCallback(
    async (meal: MealItem, slot: MealSlot) => {
      if (!profile) return;
      setAddingMealId(meal.id);
      try {
        if (demoMode || !firebaseUser || !firebaseUser.emailVerified) {
          createDemoMealLog(selectedDateKey, slot, meal, 1);
          setAllDemoLogs(loadAllDemoLogs());
        } else {
          await addMealLogToFirestore(firebaseUser.uid, selectedDateKey, slot, meal, 1);
        }
        showToast(`Added ${meal.name} to ${SLOT_LABELS[slot].label}.`);
      } catch (err: unknown) {
        setRuntimeError(err instanceof Error ? err.message : 'Failed to add meal.');
      } finally {
        setAddingMealId(null);
      }
    },
    [profile, demoMode, firebaseUser, selectedDateKey, showToast]
  );

  const handleUpdateServings = useCallback(
    async (entry: MealLogEntry, newServings: number) => {
      const baseMeal = getMealById(entry.mealId);
      try {
        if (demoMode || !firebaseUser || !firebaseUser.emailVerified) {
          const next = updateDemoMealLogServings(entry.id, baseMeal, newServings);
          setAllDemoLogs(next);
        } else {
          await updateMealLogServingsInFirestore(firebaseUser.uid, entry, baseMeal, newServings);
        }
      } catch (err: unknown) {
        setRuntimeError(err instanceof Error ? err.message : 'Failed to update serving.');
      }
    },
    [demoMode, firebaseUser]
  );

  const handleRemoveLog = useCallback(
    async (logId: string) => {
      try {
        if (demoMode || !firebaseUser || !firebaseUser.emailVerified) {
          const next = deleteDemoMealLog(logId);
          setAllDemoLogs(next);
        } else {
          await deleteMealLogFromFirestore(firebaseUser.uid, logId);
        }
        showToast('Meal removed from plan.');
      } catch (err: unknown) {
        setRuntimeError(err instanceof Error ? err.message : 'Failed to remove meal.');
      }
    },
    [demoMode, firebaseUser, showToast]
  );

  const handleAutoFillDay = useCallback(async () => {
    if (!profile) return;
    setAutoFilling(true);
    try {
      const smartPlan = generateSmartDailyPlan(profile);
      for (const item of smartPlan) {
        const alreadyHasSlot = dayLogs.some((l) => l.mealSlot === item.slot);
        if (!alreadyHasSlot) {
          if (demoMode || !firebaseUser || !firebaseUser.emailVerified) {
            createDemoMealLog(selectedDateKey, item.slot, item.meal, 1);
          } else {
            await addMealLogToFirestore(firebaseUser.uid, selectedDateKey, item.slot, item.meal, 1);
          }
        }
      }
      if (demoMode || !firebaseUser || !firebaseUser.emailVerified) {
        setAllDemoLogs(loadAllDemoLogs());
      }
      showToast('Smart daily meal plan generated for empty slots.');
    } catch (err: unknown) {
      setRuntimeError(err instanceof Error ? err.message : 'Failed to generate daily plan.');
    } finally {
      setAutoFilling(false);
    }
  }, [profile, dayLogs, demoMode, firebaseUser, selectedDateKey, showToast]);

  const handleLogout = useCallback(async () => {
    setDemoModeActive(false);
    setDemoMode(false);
    if (firebaseUser) {
      await logoutFirebaseUser();
    }
    setProfile(null);
    setDayLogs([]);
    setNeedsOnboarding(false);
    setActiveTab('home');
  }, [firebaseUser]);

  const remainingCalories = useMemo(() => {
    if (!profile) return 0;
    const plan = calculateCaloriePlan(profile);
    const totals = sumDailyNutrition(dayLogs);
    return Math.max(0, plan.targetCalories - totals.calories);
  }, [profile, dayLogs]);

  // Splash Screen
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Wait for auth check
  if (!authReady && !demoMode) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center">
        <div className="text-sm text-[#526458]">Checking session...</div>
      </div>
    );
  }

  // Unauthenticated -> Auth Screen
  if (!demoMode && !firebaseUser) {
    return <AuthScreen onStartDemo={handleStartDemo} />;
  }

  // Loading profile
  if (profileLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] flex items-center justify-center">
        <div className="text-sm text-[#526458]">Loading your NutriAI profile...</div>
      </div>
    );
  }

  // First-time Firebase Onboarding (ensures parent /users/{uid} doc is created)
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-[#F7F8F4] py-8 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white border border-[#E2E8DF] rounded-3xl p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#14532D] text-[#E6F4EC] flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-display text-xl font-bold text-[#14231A]">NutriAI</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14231A] mb-2">
            Complete Your Nutrition Profile
          </h1>
          <p className="text-sm text-[#526458] mb-6">
            Enter your biometrics, diet preference, and fitness goal so NutriAI can calculate your
            BMI, daily calorie budget, and personalized meal recommendations.
          </p>
          <ProfileForm
            initialProfile={profile}
            submitLabel="Create My Nutrition Plan"
            onSave={handleSaveProfile}
            saving={savingProfile}
          />
        </div>
      </div>
    );
  }

  const navItems: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'planner', label: 'Planner', icon: CalendarDays },
    { id: 'calculators', label: 'BMI & Kcal', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8F4] text-[#14231A] flex flex-col">
      {/* Desktop Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E4EAE2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-[#14532D] whitespace-nowrap shrink-0"
          >
            <Leaf className="w-5 h-5 stroke-[2.3]" />
            <span>NutriAI</span>
          </button>

          {/* Zone 2: Clean single-line text nav links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  activeTab === item.id
                    ? 'text-[#14532D] border-[#1B6B40] font-semibold'
                    : 'text-[#526458] border-transparent hover:text-[#14231A]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Single primary contextual CTA */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'planner' ? 'meals' : 'planner')}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1B6B40] text-white text-xs sm:text-sm font-medium hover:bg-[#14532D] transition-colors whitespace-nowrap shrink-0"
            >
              {activeTab === 'planner' ? 'Explore Meals' : 'Meal Planner'}
            </button>
          </div>
        </div>
      </header>

      {/* Optional Runtime Error Banner */}
      {runtimeError && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center justify-between gap-3">
            <span className="break-words">{runtimeError}</span>
            <button
              type="button"
              onClick={() => setRuntimeError(null)}
              className="font-semibold underline shrink-0"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-12">
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            todayDateKey={selectedDateKey}
            todayLogs={dayLogs}
            onQuickAddMeal={handleAddMeal}
            onNavigate={(tab) => setActiveTab(tab)}
            addingMealId={addingMealId}
          />
        )}

        {activeTab === 'meals' && (
          <RecommendationsView
            profile={profile}
            remainingCalories={remainingCalories}
            onAddMeal={handleAddMeal}
            addingMealId={addingMealId}
          />
        )}

        {activeTab === 'planner' && (
          <MealPlannerView
            profile={profile}
            selectedDateKey={selectedDateKey}
            onChangeDate={setSelectedDateKey}
            logs={dayLogs}
            onAddMeal={handleAddMeal}
            onUpdateServings={handleUpdateServings}
            onRemoveLog={handleRemoveLog}
            onAutoFillDay={handleAutoFillDay}
            autoFilling={autoFilling}
          />
        )}

        {activeTab === 'calculators' && (
          <CalculatorsView profile={profile} onApplyToProfile={handleSaveProfile} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            isDemoMode={demoMode || !firebaseUser?.emailVerified}
            onSaveProfile={handleSaveProfile}
            savingProfile={savingProfile}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Material Design 3 Thumb-Zone Ergonomics) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8DF] pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? 'text-[#1B6B40]' : 'text-[#5E7164]'
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full transition-colors ${
                    active ? 'bg-[#E6F4EC]' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Subtle Feedback Toast */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[#14231A] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2.5 text-xs sm:text-sm max-w-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NutriAIAppContent />
    </ErrorBoundary>
  );
}
