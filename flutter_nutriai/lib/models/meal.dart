import 'user_profile.dart';

enum MealSlot { breakfast, lunch, dinner, snacks }

class MealItem {
  final String id;
  final String name;
  final String description;
  final List<MealSlot> mealSlots;
  final DietaryPreference dietType;
  final String imageUrl;
  final int calories;
  final int proteinG;
  final int carbsG;
  final int fatG;
  final int fiberG;
  final int prepMinutes;
  final String servingLabel;
  final List<String> ingredients;
  final List<FitnessGoal> goalSuitability;

  const MealItem({
    required this.id,
    required this.name,
    required this.description,
    required this.mealSlots,
    required this.dietType,
    required this.imageUrl,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
    required this.fiberG,
    required this.prepMinutes,
    required this.servingLabel,
    required this.ingredients,
    required this.goalSuitability,
  });
}

class RecommendedMeal {
  final MealItem meal;
  final int matchScore;
  final String reason;
  final MealSlot suggestedSlot;

  const RecommendedMeal({
    required this.meal,
    required this.matchScore,
    required this.reason,
    required this.suggestedSlot,
  });
}
