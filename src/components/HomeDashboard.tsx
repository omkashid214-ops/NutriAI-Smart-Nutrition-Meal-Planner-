import React, { useMemo } from 'react';
import { ArrowRight, Plus, Scale, UtensilsCrossed } from 'lucide-react';
import {
  MealItem,
  MealLogEntry,
  MealSlot,
  UserProfile,
} from '../types/nutrition';
import {
  DIET_LABELS,
  GOAL_LABELS,
  SLOT_LABELS,
  calculateBMI,
  calculateCaloriePlan,
  formatReadableDate,
  getRecommendedMeals,
  sumDailyNutrition,
} from '../services/nutritionEngine';
import { FoodImage } from './FoodImage';

interface HomeDashboardProps {
  profile: UserProfile;
  todayDateKey: string;
  todayLogs: MealLogEntry[];
  onQuickAddMeal: (meal: MealItem, slot: MealSlot) => Promise<void> | void;
  onNavigate: (tab: 'home' | 'meals' | 'planner' | 'calculators' | 'settings') => void;
  addingMealId: string | null;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  todayDateKey,
  todayLogs,
  onQuickAddMeal,
  onNavigate,
  addingMealId,
}) => {
  const bmi = useMemo(
    () => calculateBMI(profile.heightCm, profile.weightKg),
    [profile.heightCm, profile.weightKg]
  );
  const caloriePlan = useMemo(() => calculateCaloriePlan(profile), [profile]);
  const totals = useMemo(() => sumDailyNutrition(todayLogs), [todayLogs]);

  const remainingCalories = Math.max(0, caloriePlan.targetCalories - totals.calories);
  const caloriePct = Math.min(
    100,
    Math.round((totals.calories / Math.max(1, caloriePlan.targetCalories)) * 100)
  );
  const isOverBudget = totals.calories > caloriePlan.targetCalories;

  const topRecommendations = useMemo(
    () =>
      getRecommendedMeals(profile, {
        remainingCalories,
        limit: 4,
      }),
    [profile, remainingCalories]
  );

  // SVG Ring Math
  const ringRadius = 62;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - caloriePct / 100);

  const firstName = profile.fullName.trim().split(/\s+/)[0] || 'there';

  const bmiColorClass =
    bmi.category === 'Normal'
      ? 'text-[#1B6B40]'
      : bmi.category === 'Underweight'
      ? 'text-[#2563EB]'
      : bmi.category === 'Overweight'
      ? 'text-[#B45309]'
      : 'text-[#B91C1C]';

  const macroBars = [
    {
      label: 'Protein',
      consumed: totals.proteinG,
      target: caloriePlan.proteinTargetG,
      barColor: 'bg-[#1B6B40]',
    },
    {
      label: 'Carbohydrates',
      consumed: totals.carbsG,
      target: caloriePlan.carbsTargetG,
      barColor: 'bg-[#3B825B]',
    },
    {
      label: 'Healthy Fats',
      consumed: totals.fatG,
      target: caloriePlan.fatTargetG,
      barColor: 'bg-[#C4822B]',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#526458] mb-1">
            {formatReadableDate(todayDateKey)} · {DIET_LABELS[profile.dietaryPreference]} ·{' '}
            {GOAL_LABELS[profile.fitnessGoal].label}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14231A] tracking-tight">
            Good day, {firstName}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('planner')}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-[#1B6B40] text-white text-sm font-medium hover:bg-[#14532D] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Open Meal Planner</span>
        </button>
      </div>

      {/* Focal Anchor Row: Daily Calorie Summary + BMI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dominant Focal Card: Calorie Ring + Macros */}
        <section className="lg:col-span-8 bg-white border border-[#E2E8DF] rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            {/* Circular Progress Ring */}
            <div className="relative w-40 h-40 shrink-0 mx-auto sm:mx-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 150 150" aria-hidden="true">
                <circle
                  cx="75"
                  cy="75"
                  r={ringRadius}
                  fill="none"
                  stroke="#EAF0E7"
                  strokeWidth="12"
                />
                <circle
                  cx="75"
                  cy="75"
                  r={ringRadius}
                  fill="none"
                  stroke={isOverBudget ? '#B45309' : '#1B6B40'}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-[stroke-dashoffset] duration-500 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-2xl font-semibold tabular-nums text-[#14231A]">
                  {totals.calories}
                </span>
                <span className="text-xs text-[#526458]">
                  of {caloriePlan.targetCalories} kcal
                </span>
              </div>
            </div>

            {/* Calorie Breakdown Numbers */}
            <div className="flex-1 space-y-5">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#14231A]">
                  Daily Energy Budget
                </h2>
                <p className="text-sm text-[#526458] mt-0.5">
                  {isOverBudget
                    ? `${totals.calories - caloriePlan.targetCalories} kcal above today's target`
                    : `${remainingCalories} kcal remaining for today's meals`}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[#EDF2EB]">
                <div>
                  <span className="text-xs text-[#65786B] block">Target</span>
                  <span className="font-mono text-lg font-semibold tabular-nums text-[#14231A]">
                    {caloriePlan.targetCalories}
                  </span>
                  <span className="text-xs text-[#65786B] ml-1">kcal</span>
                </div>
                <div>
                  <span className="text-xs text-[#65786B] block">Consumed</span>
                  <span className="font-mono text-lg font-semibold tabular-nums text-[#1B6B40]">
                    {totals.calories}
                  </span>
                  <span className="text-xs text-[#65786B] ml-1">kcal</span>
                </div>
                <div>
                  <span className="text-xs text-[#65786B] block">Logged</span>
                  <span className="font-mono text-lg font-semibold tabular-nums text-[#14231A]">
                    {totals.entryCount}
                  </span>
                  <span className="text-xs text-[#65786B] ml-1">
                    {totals.entryCount === 1 ? 'meal' : 'meals'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Macro Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-7 pt-6 border-t border-[#EDF2EB]">
            {macroBars.map((macro) => {
              const pct = Math.min(
                100,
                Math.round((macro.consumed / Math.max(1, macro.target)) * 100)
              );
              return (
                <div key={macro.label}>
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#2A3B30]">{macro.label}</span>
                    <span className="font-mono tabular-nums text-[#526458]">
                      {macro.consumed}g / {macro.target}g
                    </span>
                  </div>
                  <div className="h-2 bg-[#ECF1EA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${macro.barColor} transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Secondary Card: BMI Summary & Hydration */}
        <section className="lg:col-span-4 bg-white border border-[#E2E8DF] rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-[#14231A]">BMI Summary</h2>
              <Scale className="w-5 h-5 text-[#1B6B40]" />
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="font-mono text-4xl font-semibold tabular-nums text-[#14231A]">
                {bmi.bmi.toFixed(1)}
              </span>
              <span className={`text-sm font-semibold ${bmiColorClass}`}>{bmi.category}</span>
            </div>

            <p className="text-xs text-[#526458] leading-relaxed mb-5">{bmi.summary}</p>

            {/* Compact WHO Spectrum */}
            <div className="mb-5">
              <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden mb-1.5">
                <div className="bg-[#60A5FA]" />
                <div className="bg-[#1B6B40]" />
                <div className="bg-[#D97706]" />
                <div className="bg-[#DC2626]" />
              </div>
              <div className="flex justify-between font-mono text-[11px] tabular-nums text-[#65786B]">
                <span>18.5</span>
                <span>25.0</span>
                <span>30.0</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#EDF2EB] text-xs">
              <div className="flex justify-between">
                <span className="text-[#526458]">Healthy Weight Range</span>
                <span className="font-mono tabular-nums font-medium text-[#14231A]">
                  {bmi.healthyMinKg} – {bmi.healthyMaxKg} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526458]">Current Height &amp; Weight</span>
                <span className="font-mono tabular-nums font-medium text-[#14231A]">
                  {profile.heightCm} cm · {profile.weightKg} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#526458]">Daily Hydration Target</span>
                <span className="font-mono tabular-nums font-medium text-[#14231A]">
                  {caloriePlan.waterLiters} L / day
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('calculators')}
            className="mt-6 w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#F2F7F2] text-[#14532D] text-sm font-medium hover:bg-[#E6F4EC] transition-colors flex items-center justify-center gap-2"
          >
            <span>Open BMI &amp; Calorie Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>

      {/* Personalized Recommended Meals */}
      <section>
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#14231A]">
              Recommended for Your Goal
            </h2>
            <p className="text-sm text-[#526458] mt-0.5">
              Curated for {DIET_LABELS[profile.dietaryPreference]} ·{' '}
              {GOAL_LABELS[profile.fitnessGoal].label}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('meals')}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-2 text-sm font-medium text-[#1B6B40] hover:text-[#14532D] whitespace-nowrap shrink-0"
          >
            <span>Browse all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topRecommendations.map(({ meal, reason, suggestedSlot }) => {
            const isAdding = addingMealId === meal.id;
            return (
              <article
                key={meal.id}
                className="bg-white border border-[#E2E8DF] rounded-3xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <FoodImage imageKey={meal.imageKey} alt={meal.name} className="w-full h-40" />
                  <div className="p-4">
                    <div className="text-xs text-[#526458] mb-1 truncate">
                      {DIET_LABELS[meal.dietType]} · {SLOT_LABELS[suggestedSlot].label} ·{' '}
                      {meal.prepMinutes} min
                    </div>
                    <h3 className="font-display text-base font-semibold text-[#14231A] leading-snug mb-1.5 line-clamp-2">
                      {meal.name}
                    </h3>
                    <p className="text-xs text-[#1B6B40] mb-3 line-clamp-1">{reason}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#EDF2EB] font-mono text-xs tabular-nums">
                      <span className="font-semibold text-[#14231A]">{meal.calories} kcal</span>
                      <span className="text-[#526458]">
                        P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    type="button"
                    disabled={isAdding}
                    onClick={() => onQuickAddMeal(meal, suggestedSlot)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#F2F7F2] text-[#14532D] text-xs font-semibold hover:bg-[#1B6B40] hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>
                      {isAdding
                        ? 'Adding...'
                        : `Add to ${SLOT_LABELS[suggestedSlot].label}`}
                    </span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
