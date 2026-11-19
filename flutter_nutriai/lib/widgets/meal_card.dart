import 'package:flutter/material.dart';

import '../models/meal.dart';

class MealCard extends StatelessWidget {
  final RecommendedMeal recommendation;
  final VoidCallback onAdd;

  const MealCard({
    super.key,
    required this.recommendation,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    final meal = recommendation.meal;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${meal.dietType.name} · ${meal.prepMinutes} min · ${meal.servingLabel}',
              style: const TextStyle(fontSize: 12, color: Color(0xFF526458)),
            ),
            const SizedBox(height: 6),
            Text(
              meal.name,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 4),
            Text(
              recommendation.reason,
              style: const TextStyle(fontSize: 12, color: Color(0xFF1B6B40), fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${meal.calories} kcal · P ${meal.proteinG}g · C ${meal.carbsG}g · F ${meal.fatG}g',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
                FilledButton.tonal(
                  onPressed: onAdd,
                  child: const Text('Add'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
