import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/app_state_service.dart';
import '../services/meal_recommendation_engine.dart';
import '../services/nutrition_calculator.dart';
import '../widgets/calorie_ring_card.dart';
import '../widgets/meal_card.dart';

class HomeDashboardScreen extends StatelessWidget {
  final ValueChanged<int> onNavigateTab;

  const HomeDashboardScreen({super.key, required this.onNavigateTab});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateService>();
    final profile = state.profile;
    if (profile == null) {
      return const Center(child: CircularProgressIndicator());
    }

    final plan = NutritionCalculator.calculateCalories(
      age: profile.age,
      gender: profile.gender,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      activityLevel: profile.activityLevel,
      fitnessGoal: profile.fitnessGoal,
    );

    final dayLogs = state.currentDayLogs;
    final consumedCal = dayLogs.fold<int>(0, (s, e) => s + e.calories);
    final consumedPro = dayLogs.fold<int>(0, (s, e) => s + e.proteinG);
    final consumedCarbs = dayLogs.fold<int>(0, (s, e) => s + e.carbsG);
    final consumedFat = dayLogs.fold<int>(0, (s, e) => s + e.fatG);

    final topMeals = MealRecommendationEngine.recommend(profile).take(4).toList();

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        Text(
          'Welcome back, ${profile.fullName.split(' ').first}',
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: Color(0xFF14231A),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Goal: ${profile.fitnessGoal.name} · Diet: ${profile.dietaryPreference.name}',
          style: const TextStyle(fontSize: 13, color: Color(0xFF526458)),
        ),
        const SizedBox(height: 18),
        CalorieRingCard(
          consumedCalories: consumedCal,
          targetCalories: plan.targetCalories,
          proteinG: consumedPro,
          proteinTargetG: plan.proteinTargetG,
          carbsG: consumedCarbs,
          carbsTargetG: plan.carbsTargetG,
          fatG: consumedFat,
          fatTargetG: plan.fatTargetG,
        ),
        const SizedBox(height: 16),
        Card(
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            leading: const CircleAvatar(
              backgroundColor: Color(0xFFE6F4EC),
              child: Icon(Icons.monitor_weight_rounded, color: Color(0xFF1B6B40)),
            ),
            title: Text(
              'BMI ${profile.bmi.toStringAsFixed(1)} · ${profile.bmiCategory}',
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
            subtitle: Text(
              '${profile.heightCm.toStringAsFixed(0)} cm · ${profile.weightKg.toStringAsFixed(1)} kg',
            ),
            trailing: TextButton(
              onPressed: () => onNavigateTab(3),
              child: const Text('Calculate'),
            ),
          ),
        ),
        const SizedBox(height: 22),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Recommended Meals',
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w700,
                color: Color(0xFF14231A),
              ),
            ),
            TextButton(
              onPressed: () => onNavigateTab(1),
              child: const Text('See All'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...topMeals.map(
          (rec) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: MealCard(
              recommendation: rec,
              onAdd: () {
                state.addMealLog(rec.meal, rec.suggestedSlot);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Added ${rec.meal.name} to ${rec.suggestedSlot.name}')),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
