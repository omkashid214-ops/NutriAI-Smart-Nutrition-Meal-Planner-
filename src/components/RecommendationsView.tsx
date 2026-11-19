import React, { useMemo, useState } from 'react';
import { Check, Clock, Plus, Search, X } from 'lucide-react';
import {
  DietaryPreference,
  MealItem,
  MealSlot,
  RecommendedMeal,
  UserProfile,
} from '../types/nutrition';
import {
  DIET_LABELS,
  GOAL_LABELS,
  SLOT_LABELS,
  getRecommendedMeals,
} from '../services/nutritionEngine';
import { FoodImage } from './FoodImage';

interface RecommendationsViewProps {
  profile: UserProfile;
  remainingCalories: number;
  onAddMeal: (meal: MealItem, slot: MealSlot) => Promise<void> | void;
  addingMealId: string | null;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  profile,
  remainingCalories,
  onAddMeal,
  addingMealId,
}) => {
  const [slotFilter, setSlotFilter] = useState<MealSlot | 'all'>('all');
  const [dietFilter, setDietFilter] = useState<DietaryPreference | 'profile'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<RecommendedMeal | null>(null);
  const [chosenSlot, setChosenSlot] = useState<MealSlot>('lunch');
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);

  const recommendations = useMemo(
    () =>
      getRecommendedMeals(profile, {
        slotFilter,
        dietOverride: dietFilter,
        remainingCalories,
        searchQuery,
      }),
    [profile, slotFilter, dietFilter, remainingCalories, searchQuery]
  );

  const handleOpenDetail = (rec: RecommendedMeal) => {
    setSelectedMeal(rec);
    setChosenSlot(rec.suggestedSlot);
  };

  const handleConfirmAdd = async (meal: MealItem, slot: MealSlot) => {
    await onAddMeal(meal, slot);
    setAddedFeedbackId(meal.id);
    setTimeout(() => setAddedFeedbackId(null), 1600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#14231A] tracking-tight">
            Smart Meal Recommendations
          </h1>
          <p className="text-sm text-[#526458] mt-1">
            Rule-based recommendations matched to {DIET_LABELS[profile.dietaryPreference]} ·{' '}
            {GOAL_LABELS[profile.fitnessGoal].label} · {profile.dailyCalorieTarget} kcal/day
          </p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-[#E2E8DF] rounded-3xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#65786B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search meals or ingredients (e.g., paneer, oats, salmon, tofu)..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D8E1D5] bg-[#FAFBF9] text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#1B6B40]/30 focus:border-[#1B6B40]"
            />
          </div>

          {/* Diet Filter Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-[#F1F5EE] rounded-xl overflow-x-auto">
            {(
              [
                { id: 'profile', label: `My Diet (${DIET_LABELS[profile.dietaryPreference]})` },
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'vegan', label: 'Vegan' },
                { id: 'non_vegetarian', label: 'Non-Veg' },
              ] as Array<{ id: DietaryPreference | 'profile'; label: string }>
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDietFilter(opt.id)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  dietFilter === opt.id
                    ? 'bg-white text-[#14231A] shadow-xs'
                    : 'text-[#526458] hover:text-[#14231A]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Slot Filter Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          {(
            [
              { id: 'all', label: 'All Meals' },
              { id: 'breakfast', label: 'Breakfast' },
              { id: 'lunch', label: 'Lunch' },
              { id: 'dinner', label: 'Dinner' },
              { id: 'snacks', label: 'Snacks' },
            ] as Array<{ id: MealSlot | 'all'; label: string }>
          ).map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSlotFilter(slot.id)}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-colors border ${
                slotFilter === slot.id
                  ? 'bg-[#1B6B40] border-[#1B6B40] text-white'
                  : 'bg-[#FAFBF9] border-[#DDE5DA] text-[#374B3E] hover:border-[#1B6B40]/50'
              }`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      {recommendations.length === 0 ? (
        <div className="bg-white border border-[#E2E8DF] rounded-3xl p-10 text-center">
          <h3 className="font-display text-lg font-semibold text-[#14231A] mb-1">
            No matching meals found
          </h3>
          <p className="text-sm text-[#526458] mb-4">
            Try clearing your search term or switching the meal time filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSlotFilter('all');
              setDietFilter('profile');
            }}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1B6B40] text-white text-sm font-medium hover:bg-[#14532D]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const { meal, reason, suggestedSlot } = rec;
            const isAdding = addingMealId === meal.id;
            const justAdded = addedFeedbackId === meal.id;

            return (
              <article
                key={meal.id}
                className="bg-white border border-[#E2E8DF] rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(rec)}
                    className="block w-full text-left group focus:outline-none"
                  >
                    <div className="overflow-hidden">
                      <FoodImage
                        imageKey={meal.imageKey}
                        alt={meal.name}
                        className="w-full h-48 transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="p-5 pb-3">
                      <div className="text-xs text-[#526458] mb-1.5">
                        {DIET_LABELS[meal.dietType]} · {meal.servingLabel} · {meal.prepMinutes} min
                      </div>
                      <h2 className="font-display text-lg font-semibold text-[#14231A] group-hover:text-[#1B6B40] transition-colors mb-1.5">
                        {meal.name}
                      </h2>
                      <p className="text-xs text-[#526458] leading-relaxed line-clamp-2 mb-3">
                        {meal.description}
                      </p>
                      <p className="text-xs font-medium text-[#1B6B40]">{reason}</p>
                    </div>
                  </button>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-[#EDF2EB] space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center font-mono tabular-nums">
                    <div className="py-1.5 rounded-xl bg-[#F7F9F5]">
                      <div className="text-xs font-semibold text-[#14231A]">{meal.calories}</div>
                      <div className="text-[10px] text-[#65786B] font-sans">kcal</div>
                    </div>
                    <div className="py-1.5 rounded-xl bg-[#F7F9F5]">
                      <div className="text-xs font-semibold text-[#1B6B40]">{meal.proteinG}g</div>
                      <div className="text-[10px] text-[#65786B] font-sans">Protein</div>
                    </div>
                    <div className="py-1.5 rounded-xl bg-[#F7F9F5]">
                      <div className="text-xs font-semibold text-[#14231A]">{meal.carbsG}g</div>
                      <div className="text-[10px] text-[#65786B] font-sans">Carbs</div>
                    </div>
                    <div className="py-1.5 rounded-xl bg-[#F7F9F5]">
                      <div className="text-xs font-semibold text-[#14231A]">{meal.fatG}g</div>
                      <div className="text-[10px] text-[#65786B] font-sans">Fat</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConfirmAdd(meal, suggestedSlot)}
                      disabled={isAdding}
                      className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-[#1B6B40] text-white text-xs font-medium hover:bg-[#14532D] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                    >
                      {justAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to {SLOT_LABELS[suggestedSlot].label}</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>
                            {isAdding
                              ? 'Adding...'
                              : `Add to ${SLOT_LABELS[suggestedSlot].label}`}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(rec)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D8E1D5] text-xs font-medium text-[#2A3B30] hover:bg-[#F2F7F2] transition-colors whitespace-nowrap"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Meal Details Bottom Sheet / Modal */}
      {selectedMeal && (
        <div
          className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setSelectedMeal(null)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <FoodImage
                imageKey={selectedMeal.meal.imageKey}
                alt={selectedMeal.meal.name}
                className="w-full h-56"
              />
              <button
                type="button"
                onClick={() => setSelectedMeal(null)}
                aria-label="Close meal details"
                className="absolute top-4 right-4 min-w-[44px] min-h-[44px] rounded-full bg-white/95 text-[#14231A] flex items-center justify-center shadow-sm hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#526458] mb-1">
                  <span>{DIET_LABELS[selectedMeal.meal.dietType]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedMeal.meal.prepMinutes} min
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedMeal.meal.servingLabel}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-[#14231A]">
                  {selectedMeal.meal.name}
                </h3>
                <p className="text-sm text-[#526458] mt-1.5 leading-relaxed">
                  {selectedMeal.meal.description}
                </p>
                <p className="text-xs font-medium text-[#1B6B40] mt-2">
                  Why recommended: {selectedMeal.reason}
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center font-mono tabular-nums p-3 rounded-2xl bg-[#F5F8F3]">
                <div>
                  <div className="text-sm font-semibold text-[#14231A]">
                    {selectedMeal.meal.calories}
                  </div>
                  <div className="text-[11px] font-sans text-[#526458]">kcal</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#1B6B40]">
                    {selectedMeal.meal.proteinG}g
                  </div>
                  <div className="text-[11px] font-sans text-[#526458]">Protein</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#14231A]">
                    {selectedMeal.meal.carbsG}g
                  </div>
                  <div className="text-[11px] font-sans text-[#526458]">Carbs</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#14231A]">
                    {selectedMeal.meal.fatG}g
                  </div>
                  <div className="text-[11px] font-sans text-[#526458]">Fat</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#14231A]">
                    {selectedMeal.meal.fiberG}g
                  </div>
                  <div className="text-[11px] font-sans text-[#526458]">Fiber</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#2A3B30] mb-2">Key Ingredients</h4>
                <p className="text-sm text-[#526458] leading-relaxed">
                  {selectedMeal.meal.ingredients.join(' · ')}
                </p>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#2A3B30] mb-2">
                  Choose Meal Slot
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealSlot[]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setChosenSlot(slot)}
                      className={`min-h-[42px] rounded-xl text-xs font-medium border transition-colors ${
                        chosenSlot === slot
                          ? 'bg-[#E6F4EC] border-[#1B6B40] text-[#14532D]'
                          : 'bg-white border-[#D8E1D5] text-[#526458]'
                      }`}
                    >
                      {SLOT_LABELS[slot].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#E6ECE3] bg-[#FAFBF9]">
              <button
                type="button"
                onClick={async () => {
                  await handleConfirmAdd(selectedMeal.meal, chosenSlot);
                  setSelectedMeal(null);
                }}
                className="w-full min-h-[48px] rounded-xl bg-[#1B6B40] text-white text-sm font-semibold hover:bg-[#14532D] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add to {SLOT_LABELS[chosenSlot].label} Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
