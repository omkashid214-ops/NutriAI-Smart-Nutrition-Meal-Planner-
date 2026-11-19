import 'package:flutter/material.dart';

class CalorieRingCard extends StatelessWidget {
  final int consumedCalories;
  final int targetCalories;
  final int proteinG;
  final int proteinTargetG;
  final int carbsG;
  final int carbsTargetG;
  final int fatG;
  final int fatTargetG;

  const CalorieRingCard({
    super.key,
    required this.consumedCalories,
    required this.targetCalories,
    required this.proteinG,
    required this.proteinTargetG,
    required this.carbsG,
    required this.carbsTargetG,
    required this.fatG,
    required this.fatTargetG,
  });

  @override
  Widget build(BuildContext context) {
    final progress = (consumedCalories / targetCalories.clamp(1, 9999)).clamp(0.0, 1.0);
    final remaining = (targetCalories - consumedCalories).clamp(0, 9999);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Row(
              children: [
                SizedBox(
                  width: 96,
                  height: 96,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 9,
                        backgroundColor: const Color(0xFFEAF0E7),
                        color: const Color(0xFF1B6B40),
                      ),
                      Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '$consumedCalories',
                              style: const TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 18,
                              ),
                            ),
                            const Text(
                              'kcal',
                              style: TextStyle(fontSize: 11, color: Color(0xFF526458)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Daily Calorie Target',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '$remaining kcal remaining of $targetCalories kcal',
                        style: const TextStyle(fontSize: 13, color: Color(0xFF526458)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            _MacroBar(label: 'Protein', current: proteinG, target: proteinTargetG),
            const SizedBox(height: 10),
            _MacroBar(label: 'Carbs', current: carbsG, target: carbsTargetG),
            const SizedBox(height: 10),
            _MacroBar(label: 'Fats', current: fatG, target: fatTargetG),
          ],
        ),
      ),
    );
  }
}

class _MacroBar extends StatelessWidget {
  final String label;
  final int current;
  final int target;

  const _MacroBar({
    required this.label,
    required this.current,
    required this.target,
  });

  @override
  Widget build(BuildContext context) {
    final pct = (current / target.clamp(1, 999)).clamp(0.0, 1.0);
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            Text('${current}g / ${target}g', style: const TextStyle(fontSize: 12)),
          ],
        ),
        const SizedBox(height: 5),
        LinearProgressIndicator(
          value: pct,
          minHeight: 7,
          borderRadius: BorderRadius.circular(99),
          backgroundColor: const Color(0xFFECF1EA),
          color: const Color(0xFF1B6B40),
        ),
      ],
    );
  }
}
