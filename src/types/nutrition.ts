export type Gender = 'male' | 'female' | 'other';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type DietaryPreference = 'vegetarian' | 'vegan' | 'non_vegetarian';

export type FitnessGoal =
  | 'weight_loss'
  | 'weight_maintenance'
  | 'weight_gain';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type BmiCategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

export type FoodImageKey =
  | 'breakfast_oats'
  | 'veg_paneer_bowl'
  | 'vegan_buddha_bowl'
  | 'nonveg_chicken_bowl'
  | 'nonveg_salmon_plate'
  | 'healthy_snack_smoothie';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  dietaryPreference: DietaryPreference;
  fitnessGoal: FitnessGoal;
  bmi: number;
  bmiCategory: BmiCategory;
  dailyCalorieTarget: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MealItem {
  id: string;
  name: string;
  description: string;
  mealSlots: MealSlot[];
  dietType: DietaryPreference;
  imageKey: FoodImageKey;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  prepMinutes: number;
  servingLabel: string;
  ingredients: string[];
  goalSuitability: FitnessGoal[];
}

export interface RecommendedMeal {
  meal: MealItem;
  matchScore: number;
  reason: string;
  suggestedSlot: MealSlot;
}

export interface MealLogEntry {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  mealSlot: MealSlot;
  mealId: string;
  mealName: string;
  dietType: DietaryPreference;
  imageKey: FoodImageKey;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  healthyMinKg: number;
  healthyMaxKg: number;
  summary: string;
  guidance: string;
}

export interface CaloriePlan {
  bmr: number;
  tdee: number;
  targetCalories: number;
  calorieDelta: number;
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
  waterLiters: number;
  slotBudgets: Record<MealSlot, number>;
}

export interface DailyNutritionTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  entryCount: number;
}
