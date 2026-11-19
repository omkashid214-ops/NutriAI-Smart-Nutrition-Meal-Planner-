import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/meal.dart';
import '../models/user_profile.dart';
import '../services/app_state_service.dart';
import '../services/meal_recommendation_engine.dart';
import '../widgets/meal_card.dart';

class MealRecommendationsScreen extends StatefulWidget {
  const MealRecommendationsScreen({super.key});

  @override
  State<MealRecommendationsScreen> createState() =>
      _MealRecommendationsScreenState();
}

class _MealRecommendationsScreenState extends State<MealRecommendationsScreen> {
  MealSlot? _selectedSlot;
  DietaryPreference? _dietOverride;

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateService>();
    final profile = state.profile;
    if (profile == null) return const SizedBox.shrink();

    final meals = MealRecommendationEngine.recommend(
      profile,
      slotFilter: _selectedSlot,
      dietOverride: _dietOverride,
    );

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        const Text(
          'AI Meal Recommendations',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 4),
        const Text(
          'Free rule-based engine tailored to your diet, goal, and calorie budget.',
          style: TextStyle(fontSize: 13, color: Color(0xFF526458)),
        ),
        const SizedBox(height: 16),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              ChoiceChip(
                label: const Text('All Slots'),
                selected: _selectedSlot == null,
                onSelected: (_) => setState(() => _selectedSlot = null),
              ),
              const SizedBox(width: 8),
              ...MealSlot.values.map(
                (slot) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(slot.name[0].toUpperCase() + slot.name.substring(1)),
                    selected: _selectedSlot == slot,
                    onSelected: (_) => setState(() => _selectedSlot = slot),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        SegmentedButton<DietaryPreference>(
          segments: const [
            ButtonSegment(value: DietaryPreference.vegetarian, label: Text('Veg')),
            ButtonSegment(value: DietaryPreference.vegan, label: Text('Vegan')),
            ButtonSegment(value: DietaryPreference.nonVegetarian, label: Text('Non-Veg')),
          ],
          selected: {_dietOverride ?? profile.dietaryPreference},
          onSelectionChanged: (s) => setState(() => _dietOverride = s.first),
        ),
        const SizedBox(height: 16),
        ...meals.map(
          (rec) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: MealCard(
              recommendation: rec,
              onAdd: () {
                state.addMealLog(rec.meal, _selectedSlot ?? rec.suggestedSlot);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Added ${rec.meal.name} to Meal Planner')),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}
