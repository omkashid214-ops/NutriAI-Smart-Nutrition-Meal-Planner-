import 'meal.dart';
import 'user_profile.dart';

class MealPlanEntry {
  final String id;
  final String userId;
  final String dateKey;
  final MealSlot mealSlot;
  final String mealId;
  final String mealName;
  final DietaryPreference dietType;
  final double servings;
  final int calories;
  final int proteinG;
  final int carbsG;
  final int fatG;

  const MealPlanEntry({
    required this.id,
    required this.userId,
    required this.dateKey,
    required this.mealSlot,
    required this.mealId,
    required this.mealName,
    required this.dietType,
    required this.servings,
    required this.calories,
    required this.proteinG,
    required this.carbsG,
    required this.fatG,
  });

  Map<String, dynamic> toMap() => {
        'id': id,
        'userId': userId,
        'dateKey': dateKey,
        'mealSlot': mealSlot.name,
        'mealId': mealId,
        'mealName': mealName,
        'dietType': dietType.name,
        'servings': servings,
        'calories': calories,
        'proteinG': proteinG,
        'carbsG': carbsG,
        'fatG': fatG,
      };

  factory MealPlanEntry.fromMap(Map<String, dynamic> map) {
    return MealPlanEntry(
      id: (map['id'] as String?) ?? '',
      userId: (map['userId'] as String?) ?? '',
      dateKey: (map['dateKey'] as String?) ?? '',
      mealSlot: MealSlot.values.firstWhere(
        (s) => s.name == map['mealSlot'],
        orElse: () => MealSlot.lunch,
      ),
      mealId: (map['mealId'] as String?) ?? '',
      mealName: (map['mealName'] as String?) ?? 'Meal',
      dietType: DietaryPreference.values.firstWhere(
        (d) => d.name == map['dietType'],
        orElse: () => DietaryPreference.vegetarian,
      ),
      servings: ((map['servings'] as num?) ?? 1.0).toDouble(),
      calories: ((map['calories'] as num?) ?? 0).toInt(),
      proteinG: ((map['proteinG'] as num?) ?? 0).toInt(),
      carbsG: ((map['carbsG'] as num?) ?? 0).toInt(),
      fatG: ((map['fatG'] as num?) ?? 0).toInt(),
    );
  }
}
