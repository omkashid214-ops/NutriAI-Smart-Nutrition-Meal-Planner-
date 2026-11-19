import { MEALS_DATASET } from '../data/mealsDataset';
import {
  ActivityLevel,
  BmiCategory,
  BmiResult,
  CaloriePlan,
  DailyNutritionTotals,
  DietaryPreference,
  FitnessGoal,
  Gender,
  MealItem,
  MealLogEntry,
  MealSlot,
  RecommendedMeal,
  UserProfile,
} from '../types/nutrition';

export const ACTIVITY_MULTIPLIERS: Record<
  ActivityLevel,
  { factor: number; label: string; description: string }
> = {
  sedentary: {
    factor: 1.2,
    label: 'Sedentary',
    description: 'Desk study or office work, little to no structured exercise',
  },
  light: {
    factor: 1.375,
    label: 'Lightly Active',
    description: 'Light walks or sports 1–3 days per week',
  },
  moderate: {
    factor: 1.55,
    label: 'Moderately Active',
    description: 'Moderate workouts or brisk activity 3–5 days per week',
  },
  active: {
    factor: 1.725,
    label: 'Very Active',
    description: 'Hard training or sports 6–7 days per week',
  },
  very_active: {
    factor: 1.9,
    label: 'Extra Active',
    description: 'Intense daily athletic training or physical labor',
  },
};

export const GOAL_LABELS: Record<
  FitnessGoal,
  { label: string; shortLabel: string; delta: number; summary: string }
> = {
  weight_loss: {
    label: 'Weight Loss',
    shortLabel: 'Lose Weight',
    delta: -450,
    summary: 'Sustainable calorie deficit with high protein to preserve lean muscle.',
  },
  weight_maintenance: {
    label: 'Weight Maintenance',
    shortLabel: 'Maintain',
    delta: 0,
    summary: 'Balanced macronutrients matched to your daily energy expenditure.',
  },
  weight_gain: {
    label: 'Weight Gain',
    shortLabel: 'Gain Weight',
    delta: 400,
    summary: 'Clean calorie surplus with complex carbs and protein for healthy mass gain.',
  },
};

export const DIET_LABELS: Record<DietaryPreference, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  non_vegetarian: 'Non-Vegetarian',
};

export const SLOT_LABELS: Record<MealSlot, { label: string; timeHint: string; ratio: number }> = {
  breakfast: { label: 'Breakfast', timeHint: '7:00 – 9:30 AM', ratio: 0.25 },
  lunch: { label: 'Lunch', timeHint: '12:30 – 2:30 PM', ratio: 0.35 },
  dinner: { label: 'Dinner', timeHint: '7:00 – 9:00 PM', ratio: 0.28 },
  snacks: { label: 'Snacks', timeHint: '4:00 – 5:30 PM', ratio: 0.12 },
};

/**
 * Calculate BMI using metric height (cm) and weight (kg) with WHO classifications.
 */
export function calculateBMI(heightCm: number, weightKg: number): BmiResult {
  const safeHeightCm = Math.max(80, Math.min(260, heightCm));
  const safeWeightKg = Math.max(20, Math.min(300, weightKg));
  const heightM = safeHeightCm / 100;
  const rawBmi = safeWeightKg / (heightM * heightM);
  const bmi = Math.round(rawBmi * 10) / 10;

  const healthyMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
  const healthyMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

  let category: BmiCategory = 'Normal';
  let summary = 'Within the healthy weight range for your height.';
  let guidance =
    'Maintain a balanced plate with lean proteins, whole grains, colorful vegetables, and regular physical movement.';

  if (bmi < 18.5) {
    category = 'Underweight';
    summary = 'Below the standard healthy BMI threshold (18.5).';
    guidance =
      'Focus on nutrient-dense calorie surpluses with nuts, whole grains, dairy or plant proteins, and resistance exercise.';
  } else if (bmi < 25) {
    category = 'Normal';
    summary = 'Within the optimal healthy BMI range (18.5 – 24.9).';
    guidance =
      'Keep steady meal timing, adequate daily protein, hydration, and 150+ minutes of weekly moderate exercise.';
  } else if (bmi < 30) {
    category = 'Overweight';
    summary = 'Above the standard range (25.0 – 29.9).';
    guidance =
      'Aim for a moderate 350–500 kcal daily deficit emphasizing high-fiber vegetables, lean protein, and portion awareness.';
  } else {
    category = 'Obese';
    summary = 'In the elevated health risk band (30.0 or higher).';
    guidance =
      'Prioritize sustainable whole-food meals, high satiety protein and fiber, daily walking, and consult a healthcare professional for tailored guidance.';
  }

  return {
    bmi,
    category,
    healthyMinKg,
    healthyMaxKg,
    summary,
    guidance,
  };
}

/**
 * Calculate BMR (Mifflin-St Jeor), TDEE, daily calorie target, and macro gram budgets.
 */
export function calculateCaloriePlan(params: {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
}): CaloriePlan {
  const age = Math.max(10, Math.min(120, params.age));
  const heightCm = Math.max(80, Math.min(260, params.heightCm));
  const weightKg = Math.max(20, Math.min(300, params.weightKg));

  // Mifflin-St Jeor equation
  const genderOffset =
    params.gender === 'male' ? 5 : params.gender === 'female' ? -161 : -78;
  const bmr = Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + genderOffset);

  const multiplier = ACTIVITY_MULTIPLIERS[params.activityLevel]?.factor ?? 1.55;
  const tdee = Math.round(bmr * multiplier);

  const calorieDelta = GOAL_LABELS[params.fitnessGoal]?.delta ?? 0;
  const minSafeCalories = params.gender === 'female' ? 1200 : 1400;
  const targetCalories = Math.max(minSafeCalories, Math.min(5500, tdee + calorieDelta));

  // Macro ratios tailored by fitness goal
  let proteinPct = 0.28;
  let carbsPct = 0.45;
  let fatPct = 0.27;

  if (params.fitnessGoal === 'weight_loss') {
    proteinPct = 0.34;
    carbsPct = 0.38;
    fatPct = 0.28;
  } else if (params.fitnessGoal === 'weight_gain') {
    proteinPct = 0.26;
    carbsPct = 0.50;
    fatPct = 0.24;
  }

  const proteinTargetG = Math.round((targetCalories * proteinPct) / 4);
  const carbsTargetG = Math.round((targetCalories * carbsPct) / 4);
  const fatTargetG = Math.round((targetCalories * fatPct) / 9);
  const waterLiters = Math.round(weightKg * 0.035 * 10) / 10;

  return {
    bmr,
    tdee,
    targetCalories,
    calorieDelta,
    proteinTargetG,
    carbsTargetG,
    fatTargetG,
    waterLiters: Math.max(1.8, Math.min(4.5, waterLiters)),
    slotBudgets: {
      breakfast: Math.round(targetCalories * SLOT_LABELS.breakfast.ratio),
      lunch: Math.round(targetCalories * SLOT_LABELS.lunch.ratio),
      dinner: Math.round(targetCalories * SLOT_LABELS.dinner.ratio),
      snacks: Math.round(targetCalories * SLOT_LABELS.snacks.ratio),
    },
  };
}

/**
 * Diet compatibility rule:
 * - Vegan users ONLY receive vegan meals
 * - Vegetarian users receive vegetarian + vegan meals
 * - Non-Vegetarian users receive all meals (with priority boost for non-veg protein options)
 */
export function isMealCompatibleWithDiet(
  mealDiet: DietaryPreference,
  userDiet: DietaryPreference
): boolean {
  if (userDiet === 'vegan') return mealDiet === 'vegan';
  if (userDiet === 'vegetarian') return mealDiet === 'vegetarian' || mealDiet === 'vegan';
  return true;
}

/**
 * Free Rule-Based AI Meal Recommendation Engine (Zero Paid APIs).
 * Scores every compatible meal on dietary fit, fitness goal alignment,
 * protein-to-calorie density, fiber satiety, and target slot calorie fit.
 */
export function getRecommendedMeals(
  profile: UserProfile,
  options?: {
    slotFilter?: MealSlot | 'all';
    dietOverride?: DietaryPreference | 'profile';
    remainingCalories?: number;
    searchQuery?: string;
    limit?: number;
  }
): RecommendedMeal[] {
  const caloriePlan = calculateCaloriePlan(profile);
  const activeDiet =
    options?.dietOverride && options.dietOverride !== 'profile'
      ? options.dietOverride
      : profile.dietaryPreference;
  const slotFilter = options?.slotFilter ?? 'all';
  const query = (options?.searchQuery ?? '').trim().toLowerCase();

  const compatible = MEALS_DATASET.filter((meal) => {
    if (!isMealCompatibleWithDiet(meal.dietType, activeDiet)) return false;
    if (slotFilter !== 'all' && !meal.mealSlots.includes(slotFilter)) return false;
    if (query) {
      const haystack = `${meal.name} ${meal.description} ${meal.ingredients.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  const scored: RecommendedMeal[] = compatible.map((meal) => {
    let score = 50;
    const reasons: string[] = [];

    // 1. Direct diet preference match boost
    if (meal.dietType === activeDiet) {
      score += 12;
    }

    // 2. Fitness goal suitability rule
    if (meal.goalSuitability.includes(profile.fitnessGoal)) {
      score += 20;
      if (profile.fitnessGoal === 'weight_loss') {
        reasons.push('Calorie-conscious cut option');
      } else if (profile.fitnessGoal === 'weight_gain') {
        reasons.push('Calorie-dense muscle builder');
      } else {
        reasons.push('Balanced macro profile');
      }
    }

    // 3. Macro density heuristics
    const proteinRatio = (meal.proteinG * 4) / Math.max(1, meal.calories);
    if (profile.fitnessGoal === 'weight_loss') {
      if (proteinRatio >= 0.25) {
        score += 14;
        reasons.push('High protein density');
      }
      if (meal.fiberG >= 8) {
        score += 8;
        reasons.push('High fiber satiety');
      }
      if (meal.calories <= 420) {
        score += 8;
      } else if (meal.calories > 560) {
        score -= 12;
      }
    } else if (profile.fitnessGoal === 'weight_gain') {
      if (meal.calories >= 480) {
        score += 14;
      }
      if (meal.proteinG >= 24) {
        score += 10;
        reasons.push(`${meal.proteinG}g protein`);
      }
      if (meal.carbsG >= 50) {
        score += 8;
      }
    } else {
      // Weight maintenance
      if (proteinRatio >= 0.2 && proteinRatio <= 0.38) {
        score += 12;
      }
      if (meal.fiberG >= 7) {
        score += 7;
      }
    }

    // 4. Slot calorie budget proximity rule
    const suggestedSlot: MealSlot =
      slotFilter !== 'all' ? slotFilter : meal.mealSlots[0];
    const slotBudget = caloriePlan.slotBudgets[suggestedSlot];
    const diffRatio = Math.abs(meal.calories - slotBudget) / Math.max(1, slotBudget);
    if (diffRatio <= 0.18) {
      score += 12;
      reasons.push(`Fits ${SLOT_LABELS[suggestedSlot].label.toLowerCase()} target`);
    } else if (diffRatio <= 0.35) {
      score += 5;
    } else {
      score -= 6;
    }

    // 5. Remaining daily calorie awareness
    if (typeof options?.remainingCalories === 'number' && options.remainingCalories > 0) {
      if (meal.calories <= options.remainingCalories + 60) {
        score += 6;
      }
    }

    const clampedScore = Math.max(60, Math.min(99, Math.round(score)));
    const reason =
      reasons.slice(0, 2).join(' · ') ||
      `${DIET_LABELS[meal.dietType]} · ${meal.proteinG}g protein`;

    return {
      meal,
      matchScore: clampedScore,
      reason,
      suggestedSlot,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return options?.limit ? scored.slice(0, options.limit) : scored;
}

/**
 * Auto-select a balanced 4-slot daily meal plan tailored to the user's profile.
 */
export function generateSmartDailyPlan(profile: UserProfile): Array<{
  slot: MealSlot;
  meal: MealItem;
}> {
  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const usedIds = new Set<string>();
  const plan: Array<{ slot: MealSlot; meal: MealItem }> = [];

  for (const slot of slots) {
    const candidates = getRecommendedMeals(profile, { slotFilter: slot });
    const pick = candidates.find((c) => !usedIds.has(c.meal.id)) ?? candidates[0];
    if (pick) {
      usedIds.add(pick.meal.id);
      plan.push({ slot, meal: pick.meal });
    }
  }
  return plan;
}

export function sumDailyNutrition(entries: MealLogEntry[]): DailyNutritionTotals {
  return entries.reduce<DailyNutritionTotals>(
    (acc, item) => ({
      calories: Math.round(acc.calories + item.calories),
      proteinG: Math.round(acc.proteinG + item.proteinG),
      carbsG: Math.round(acc.carbsG + item.carbsG),
      fatG: Math.round(acc.fatG + item.fatG),
      entryCount: acc.entryCount + 1,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, entryCount: 0 }
  );
}

export function getTodayDateKey(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatReadableDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  if (!y || !m || !d) return dateKey;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function buildDefaultUserProfile(
  uid: string,
  fullName: string,
  email: string
): UserProfile {
  const heightCm = 172;
  const weightKg = 68;
  const age = 22;
  const gender: Gender = 'male';
  const activityLevel: ActivityLevel = 'moderate';
  const dietaryPreference: DietaryPreference = 'vegetarian';
  const fitnessGoal: FitnessGoal = 'weight_maintenance';

  const bmiRes = calculateBMI(heightCm, weightKg);
  const calPlan = calculateCaloriePlan({
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    fitnessGoal,
  });

  return {
    uid,
    fullName: fullName.trim().slice(0, 80) || 'NutriAI Member',
    email: email.trim().slice(0, 160) || 'demo@nutriai.app',
    age,
    gender,
    heightCm,
    weightKg,
    activityLevel,
    dietaryPreference,
    fitnessGoal,
    bmi: bmiRes.bmi,
    bmiCategory: bmiRes.category,
    dailyCalorieTarget: calPlan.targetCalories,
  };
}
