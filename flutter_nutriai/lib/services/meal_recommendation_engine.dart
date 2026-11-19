import '../data/sample_meals.dart';
import '../models/meal.dart';
import '../models/user_profile.dart';
import 'nutrition_calculator.dart';

/// 100% Free Rule-Based AI Meal Recommendation Engine (Zero Paid APIs)
class MealRecommendationEngine {
  static bool isCompatible(DietaryPreference mealDiet, DietaryPreference userDiet) {
    if (userDiet == DietaryPreference.vegan) {
      return mealDiet == DietaryPreference.vegan;
    }
    if (userDiet == DietaryPreference.vegetarian) {
      return mealDiet == DietaryPreference.vegetarian ||
          mealDiet == DietaryPreference.vegan;
    }
    return true;
  }

  static List<RecommendedMeal> recommend(
    UserProfile profile, {
    MealSlot? slotFilter,
    DietaryPreference? dietOverride,
  }) {
    final activeDiet = dietOverride ?? profile.dietaryPreference;
    final plan = NutritionCalculator.calculateCalories(
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel,
      fitnessGoal: profile.fitnessGoal,
    );

    final compatible = kSampleMeals.where((meal) {
      if (!isCompatible(meal.dietType, activeDiet)) return false;
      if (slotFilter != null && !meal.mealSlots.contains(slotFilter)) return false;
      return true;
    }).toList();

    final results = compatible.map((meal) {
      var score = 55;
      final reasons = <String>[];

      if (meal.dietType == activeDiet) score += 12;
      if (meal.goalSuitability.contains(profile.fitnessGoal)) {
        score += 20;
        reasons.add(
          profile.fitnessGoal == FitnessGoal.weightLoss
              ? 'Calorie-conscious cut choice'
              : profile.fitnessGoal == FitnessGoal.weightGain
                  ? 'Calorie-dense mass builder'
                  : 'Balanced macro profile',
        );
      }

      final proteinRatio = (meal.proteinG * 4) / meal.calories.clamp(1, 5000);
      if (profile.fitnessGoal == FitnessGoal.weightLoss && proteinRatio >= 0.25) {
        score += 12;
        reasons.add('High protein density');
      } else if (profile.fitnessGoal == FitnessGoal.weightGain && meal.calories >= 480) {
        score += 12;
        reasons.add('${meal.proteinG}g protein');
      }

      final slot = slotFilter ?? meal.mealSlots.first;
      final budget = plan.slotBudgets[slot] ?? 500;
      final diffRatio = (meal.calories - budget).abs() / budget.clamp(1, 3000);
      if (diffRatio <= 0.2) {
        score += 10;
        reasons.add('Fits ${slot.name} calorie budget');
      }

      return RecommendedMeal(
        meal: meal,
        matchScore: score.clamp(60, 99),
        reason: reasons.isEmpty ? '${meal.proteinG}g protein · ${meal.fiberG}g fiber' : reasons.take(2).join(' · '),
        suggestedSlot: slot,
      );
    }).toList();

    results.sort((a, b) => b.matchScore.compareTo(a.matchScore));
    return results;
  }
}
