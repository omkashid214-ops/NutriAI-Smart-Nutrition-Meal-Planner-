import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/meal.dart';
import '../services/app_state_service.dart';
import '../services/meal_recommendation_engine.dart';

class MealPlannerScreen extends StatelessWidget {
  const MealPlannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateService>();
    final profile = state.profile;
    if (profile == null) return const SizedBox.shrink();

    final logs = state.currentDayLogs;
    final totalCal = logs.fold<int>(0, (s, e) => s + e.calories);
    final totalPro = logs.fold<int>(0, (s, e) => s + e.proteinG);
    final totalCarbs = logs.fold<int>(0, (s, e) => s + e.carbsG);
    final totalFat = logs.fold<int>(0, (s, e) => s + e.fatG);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        const Text(
          'Daily Meal Planner',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        Text(
          'Date: ${state.selectedDateKey} · Daily Target: ${profile.dailyCalorieTarget} kcal',
          style: const TextStyle(fontSize: 13, color: Color(0xFF526458)),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _MetricCol(label: 'Calories', value: '$totalCal kcal'),
                _MetricCol(label: 'Protein', value: '${totalPro}g'),
                _MetricCol(label: 'Carbs', value: '${totalCarbs}g'),
                _MetricCol(label: 'Fat', value: '${totalFat}g'),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        ...MealSlot.values.map((slot) {
          final slotLogs = logs.where((e) => e.mealSlot == slot).toList();
          final title = slot.name[0].toUpperCase() + slot.name.substring(1);

          return Padding(
            padding: const EdgeInsets.only(bottom: 14),
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                        ),
                        TextButton.icon(
                          onPressed: () {
                            final recs = MealRecommendationEngine.recommend(
                              profile,
                              slotFilter: slot,
                            );
                            if (recs.isNotEmpty) {
                              state.addMealLog(recs.first.meal, slot);
                            }
                          },
                          icon: const Icon(Icons.add, size: 18),
                          label: const Text('Quick Add'),
                        ),
                      ],
                    ),
                    if (slotLogs.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8),
                        child: Text(
                          'No meals logged yet.',
                          style: TextStyle(color: Color(0xFF65786B), fontSize: 13),
                        ),
                      )
                    else
                      ...slotLogs.map(
                        (entry) => ListTile(
                          contentPadding: EdgeInsets.zero,
                          title: Text(entry.mealName, style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text(
                            '${entry.calories} kcal · P ${entry.proteinG}g · C ${entry.carbsG}g · F ${entry.fatG}g',
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.delete_outline, color: Color(0xFFB91C1C)),
                            onPressed: () => state.removeMealLog(entry.id),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        }),
      ],
    );
  }
}

class _MetricCol extends StatelessWidget {
  final String label;
  final String value;

  const _MetricCol({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF526458))),
      ],
    );
  }
}
