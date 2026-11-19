import '../models/meal.dart';
import '../models/user_profile.dart';

class BmiResult {
  final double bmi;
  final String category;
  final double healthyMinKg;
  final double healthyMaxKg;
  final String guidance;

  const BmiResult({
    required this.bmi,
    required this.category,
    required this.healthyMinKg,
    required this.healthyMaxKg,
    required this.guidance,
  });
}

class CaloriePlan {
  final int bmr;
  final int tdee;
  final int targetCalories;
  final int proteinTargetG;
  final int carbsTargetG;
  final int fatTargetG;
  final Map<MealSlot, int> slotBudgets;

  const CaloriePlan({
    required this.bmr,
    required this.tdee,
    required this.targetCalories,
    required this.proteinTargetG,
    required this.carbsTargetG,
    required this.fatTargetG,
    required this.slotBudgets,
  });
}

class NutritionCalculator {
  static double activityFactor(ActivityLevel level) {
    switch (level) {
      case ActivityLevel.sedentary:
        return 1.2;
      case ActivityLevel.light:
        return 1.375;
      case ActivityLevel.moderate:
        return 1.55;
      case ActivityLevel.active:
        return 1.725;
      case ActivityLevel.veryActive:
        return 1.9;
    }
  }

  static BmiResult calculateBmi(double heightCm, double weightKg) {
    final safeH = heightCm.clamp(80.0, 260.0);
    final safeW = weightKg.clamp(20.0, 300.0);
    final heightM = safeH / 100.0;
    final bmi = double.parse((safeW / (heightM * heightM)).toStringAsFixed(1));
    final minKg = double.parse((18.5 * heightM * heightM).toStringAsFixed(1));
    final maxKg = double.parse((24.9 * heightM * heightM).toStringAsFixed(1));

    if (bmi < 18.5) {
      return BmiResult(
        bmi: bmi,
        category: 'Underweight',
        healthyMinKg: minKg,
        healthyMaxKg: maxKg,
        guidance: 'Add nutrient-dense calorie surpluses with whole grains, nuts, and lean protein.',
      );
    } else if (bmi < 25.0) {
      return BmiResult(
        bmi: bmi,
        category: 'Normal',
        healthyMinKg: minKg,
        healthyMaxKg: maxKg,
        guidance: 'Within the healthy WHO range. Maintain balanced macros and steady physical activity.',
      );
    } else if (bmi < 30.0) {
      return BmiResult(
        bmi: bmi,
        category: 'Overweight',
        healthyMinKg: minKg,
        healthyMaxKg: maxKg,
        guidance: 'Target a gentle 400–500 kcal daily deficit focusing on high-protein, high-fiber foods.',
      );
    }
    return BmiResult(
      bmi: bmi,
      category: 'Obese',
      healthyMinKg: minKg,
      healthyMaxKg: maxKg,
      guidance: 'Focus on sustainable whole-food portions, daily walking, and medical nutrition guidance.',
    );
  }

  static CaloriePlan calculateCalories({
    required int age,
    required Gender gender,
    required double heightCm,
    required double weightKg,
    required ActivityLevel activityLevel,
    required FitnessGoal fitnessGoal,
  }) {
    final offset = gender == Gender.male
        ? 5.0
        : gender == Gender.female
            ? -161.0
            : -78.0;
    final bmr = (10 * weightKg + 6.25 * heightCm - 5 * age + offset).round();
    final tdee = (bmr * activityFactor(activityLevel)).round();

    final delta = fitnessGoal == FitnessGoal.weightLoss
        ? -450
        : fitnessGoal == FitnessGoal.weightGain
            ? 400
            : 0;

    final minFloor = gender == Gender.female ? 1200 : 1400;
    final target = (tdee + delta).clamp(minFloor, 5500);

    final proteinPct = fitnessGoal == FitnessGoal.weightLoss
        ? 0.34
        : fitnessGoal == FitnessGoal.weightGain
            ? 0.26
            : 0.28;
    final carbsPct = fitnessGoal == FitnessGoal.weightLoss
        ? 0.38
        : fitnessGoal == FitnessGoal.weightGain
            ? 0.50
            : 0.45;
    final fatPct = 1.0 - proteinPct - carbsPct;

    return CaloriePlan(
      bmr: bmr,
      tdee: tdee,
      targetCalories: target,
      proteinTargetG: ((target * proteinPct) / 4).round(),
      carbsTargetG: ((target * carbsPct) / 4).round(),
      fatTargetG: ((target * fatPct) / 9).round(),
      slotBudgets: {
        MealSlot.breakfast: (target * 0.25).round(),
        MealSlot.lunch: (target * 0.35).round(),
        MealSlot.dinner: (target * 0.28).round(),
        MealSlot.snacks: (target * 0.12).round(),
      },
    );
  }
}
