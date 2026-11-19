import React, { useMemo, useState } from 'react';
import { Calendar, Minus, Plus, Search, Trash2, Wand2, X } from 'lucide-react';
import {
  MealItem,
  MealLogEntry,
  MealSlot,
  UserProfile,
} from '../types/nutrition';
import {
  DIET_LABELS,
  SLOT_LABELS,
  calculateCaloriePlan,
  formatReadableDate,
  getRecommendedMeals,
  getTodayDateKey,
  sumDailyNutrition,
} from '../services/nutritionEngine';
import { FoodImage } from './FoodImage';

interface MealPlannerViewProps {
  profile: UserProfile;
  selectedDateKey: string;
  onChangeDate: (dateKey: string) => void;
  logs: MealLogEntry[];
  onAddMeal: (meal: MealItem, slot: MealSlot) => Promise<void> | void;
  onUpdateServings: (entry: MealLogEntry, newServings: number) => Promise<void> | void;
  onRemoveLog: (logId: string) => Promise<void> | void;
  onAutoFillDay: () => Promise<void> | void;
  autoFilling: boolean;
}

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  profile,
  selectedDateKey,
  onChangeDate,
  logs,
  onAddMeal,
  onUpdateServings,
  onRemoveLog,
  onAutoFillDay,
  autoFilling,
}) => {
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const caloriePlan = useMemo(() => calculateCaloriePlan(profile), [profile]);
  const totals = useMemo(() => sumDailyNutrition(logs), [logs]);

  const dateOptions = useMemo(() => {
    return [-1, 0, 1, 2, 3, 4].map((offset) => {
      const key = getTodayDateKey(offset);
      const [y, m, d] = key.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return {
        key,
        weekday: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: dt.getDate(),
        isToday: offset === 0,
      };
    });
  }, []);

  const pickerMeals = useMemo(() => {
    if (!pickerSlot) return [];
    return getRecommendedMeals(profile, {
      slotFilter: pickerSlot,
      searchQuery: pickerQuery,
    });
  }, [profile, pickerSlot, pickerQuery]);

  const remaining = caloriePlan.targetCalories - totals.calories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14231A] tracking-tight">
            Daily Meal Planner
          </h1>
          <p className="text-sm text-[#526458] mt-1">
            Plan Breakfast, Lunch, Dinner, and Snacks for {formatReadableDate(selectedDateKey)}
          </p>
        </div>

        <button
          type="button"
          onClick={onAutoFillDay}
          disabled={autoFilling}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1B6B40] text-white text-sm font-medium hover:bg-[#14532D] transition-colors disabled:opacity-60 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Wand2 className="w-4 h-4" />
          <span>{autoFilling ? 'Generating Plan...' : 'Auto-Fill Smart Day'}</span>
        </button>
      </div>

      {/* Horizontal Date Selector */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <Calendar className="w-4 h-4 text-[#1B6B40] shrink-0 mr-1" />
          {dateOptions.map((item) => {
            const active = item.key === selectedDateKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChangeDate(item.key)}
                className={`min-w-[60px] min-h-[54px] px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center transition-colors shrink-0 ${
                  active
                    ? 'bg-[#14532D] text-white'
                    : 'bg-[#F5F8F3] text-[#374B3E] hover:bg-[#E6F4EC]'
                }`}
              >
                <span className="text-[11px] opacity-80">
                  {item.isToday ? 'Today' : item.weekday}
                </span>
                <span className="font-mono text-sm font-semibold tabular-nums">
                  {item.dayNum}
                </span>
              </button>
            );
          })}
        </div>

        {/* Daily Nutrition Totals Bar */}
        <div className="grid grid-cols-4 gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EDF2EB] font-mono tabular-nums">
          <div>
            <span className="font-sans text-[11px] text-[#65786B] block">Calories</span>
            <span className="text-sm font-semibold text-[#14231A]">
              {totals.calories}
              <span className="text-xs font-normal text-[#65786B]">
                /{caloriePlan.targetCalories}
              </span>
            </span>
          </div>
          <div>
            <span className="font-sans text-[11px] text-[#65786B] block">Protein</span>
            <span className="text-sm font-semibold text-[#1B6B40]">
              {totals.proteinG}g
              <span className="text-xs font-normal text-[#65786B]">
                /{caloriePlan.proteinTargetG}g
              </span>
            </span>
          </div>
          <div>
            <span className="font-sans text-[11px] text-[#65786B] block">Carbs</span>
            <span className="text-sm font-semibold text-[#14231A]">
              {totals.carbsG}g
              <span className="text-xs font-normal text-[#65786B]">
                /{caloriePlan.carbsTargetG}g
              </span>
            </span>
          </div>
          <div>
            <span className="font-sans text-[11px] text-[#65786B] block">Fat</span>
            <span className="text-sm font-semibold text-[#14231A]">
              {totals.fatG}g
              <span className="text-xs font-normal text-[#65786B]">
                /{caloriePlan.fatTargetG}g
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Remaining Budget Hint */}
      <div className="flex items-center justify-between px-1 text-xs text-[#526458]">
        <span>
          {remaining >= 0
            ? `${remaining} kcal remaining in your daily budget`
            : `${Math.abs(remaining)} kcal over your daily target`}
        </span>
        <span className="font-mono tabular-nums">
          {Math.round((totals.calories / Math.max(1, caloriePlan.targetCalories)) * 100)}% of target
        </span>
      </div>

      {/* 4 Meal Slot Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SLOTS.map((slot) => {
          const slotEntries = logs.filter((l) => l.mealSlot === slot);
          const slotCalories = slotEntries.reduce((sum, e) => sum + e.calories, 0);
          const slotBudget = caloriePlan.slotBudgets[slot];

          return (
            <section
              key={slot}
              className="bg-white border border-[#E2E8DF] rounded-3xl p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#EDF2EB]">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-[#14231A]">
                      {SLOT_LABELS[slot].label}
                    </h2>
                    <p className="text-xs text-[#65786B]">
                      {SLOT_LABELS[slot].timeHint} · Recommended ~{slotBudget} kcal
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold tabular-nums text-[#14231A]">
                      {slotCalories} kcal
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerSlot(slot);
                        setPickerQuery('');
                      }}
                      className="inline-flex items-center gap-1 min-h-[40px] px-3 py-1.5 rounded-xl bg-[#F2F7F2] text-[#14532D] text-xs font-semibold hover:bg-[#1B6B40] hover:text-white transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {slotEntries.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-[#65786B] mb-3">
                      No meals added for {SLOT_LABELS[slot].label.toLowerCase()} yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerSlot(slot);
                        setPickerQuery('');
                      }}
                      className="min-h-[40px] px-4 py-2 rounded-xl border border-[#D4DFD1] text-xs font-medium text-[#1B6B40] hover:bg-[#F2F7F2] transition-colors"
                    >
                      Pick a recommended {SLOT_LABELS[slot].label.toLowerCase()}
                    </button>
                  </div>
                ) : (
                  <ul className="divide-y divide-[#EEF3EC] mt-2">
                    {slotEntries.map((entry) => (
                      <li key={entry.id} className="py-3.5 flex items-center gap-3.5">
                        <FoodImage
                          imageKey={entry.imageKey}
                          alt={entry.mealName}
                          className="w-16 h-16 rounded-2xl shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-[#14231A] truncate">
                            {entry.mealName}
                          </h3>
                          <p className="text-xs text-[#65786B] mt-0.5 font-mono tabular-nums">
                            {entry.calories} kcal · P {entry.proteinG}g · C {entry.carbsG}g · F{' '}
                            {entry.fatG}g
                          </p>
                        </div>

                        {/* Serving Controls + Remove */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            aria-label="Decrease serving"
                            onClick={() =>
                              entry.servings > 0.5
                                ? onUpdateServings(entry, entry.servings - 0.5)
                                : onRemoveLog(entry.id)
                            }
                            className="min-w-[36px] min-h-[36px] rounded-lg border border-[#DCE4D9] flex items-center justify-center text-[#374B3E] hover:bg-[#F2F7F2]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs tabular-nums w-8 text-center text-[#14231A]">
                            {entry.servings}x
                          </span>
                          <button
                            type="button"
                            aria-label="Increase serving"
                            onClick={() =>
                              onUpdateServings(entry, Math.min(5, entry.servings + 0.5))
                            }
                            className="min-w-[36px] min-h-[36px] rounded-lg border border-[#DCE4D9] flex items-center justify-center text-[#374B3E] hover:bg-[#F2F7F2]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${entry.mealName}`}
                            onClick={() => onRemoveLog(entry.id)}
                            className="min-w-[36px] min-h-[36px] rounded-lg text-[#8A5A5A] hover:bg-[#FEF2F2] hover:text-[#B91C1C] flex items-center justify-center ml-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add Meal Picker Drawer / Modal */}
      {pickerSlot && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setPickerSlot(null)}
        >
          <div
            className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E6ECE3] flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#14231A]">
                  Add to {SLOT_LABELS[pickerSlot].label}
                </h3>
                <p className="text-xs text-[#526458]">
                  Showing {DIET_LABELS[profile.dietaryPreference]} meals sorted for your goal
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerSlot(null)}
                aria-label="Close meal picker"
                className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-[#526458] hover:bg-[#F1F5EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-[#EDF2EB]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#65786B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={pickerQuery}
                  onChange={(e) => setPickerQuery(e.target.value)}
                  placeholder={`Search ${SLOT_LABELS[pickerSlot].label.toLowerCase()} options...`}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto divide-y divide-[#EEF3EC]">
              {pickerMeals.map(({ meal, reason }) => (
                <div key={meal.id} className="py-3 flex items-center gap-3.5">
                  <FoodImage
                    imageKey={meal.imageKey}
                    alt={meal.name}
                    className="w-16 h-16 rounded-2xl shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-[#14231A] truncate">{meal.name}</h4>
                    <p className="text-xs text-[#1B6B40] truncate">{reason}</p>
                    <p className="font-mono text-xs tabular-nums text-[#526458] mt-0.5">
                      {meal.calories} kcal · P {meal.proteinG}g · C {meal.carbsG}g · F {meal.fatG}g
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await onAddMeal(meal, pickerSlot);
                      setPickerSlot(null);
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1B6B40] text-white text-xs font-medium hover:bg-[#14532D] transition-colors whitespace-nowrap shrink-0"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
