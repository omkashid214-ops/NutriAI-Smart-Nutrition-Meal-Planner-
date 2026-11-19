import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/user_profile.dart';
import '../services/app_state_service.dart';
import '../services/nutrition_calculator.dart';

class CalculatorsScreen extends StatefulWidget {
  const CalculatorsScreen({super.key});

  @override
  State<CalculatorsScreen> createState() => _CalculatorsScreenState();
}

class _CalculatorsScreenState extends State<CalculatorsScreen> {
  double _heightCm = 172;
  double _weightKg = 68;
  int _age = 22;
  Gender _gender = Gender.male;
  ActivityLevel _activity = ActivityLevel.moderate;
  FitnessGoal _goal = FitnessGoal.weightMaintenance;
  bool _syncedFromProfile = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_syncedFromProfile) {
      final p = context.read<AppStateService>().profile;
      if (p != null) {
        _heightCm = p.heightCm;
        _weightKg = p.weightKg;
        _age = p.age;
        _gender = p.gender;
        _activity = p.activityLevel;
        _goal = p.fitnessGoal;
        _syncedFromProfile = true;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final bmi = NutritionCalculator.calculateBmi(_heightCm, _weightKg);
    final cal = NutritionCalculator.calculateCalories(
      age: _age,
      gender: _gender,
      heightCm: _heightCm,
      weightKg: _weightKg,
      activityLevel: _activity,
      fitnessGoal: _goal,
    );

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        const Text(
          'BMI & Calorie Calculator',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'BMI: ${bmi.bmi.toStringAsFixed(1)} (${bmi.category})',
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1B6B40),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Healthy range: ${bmi.healthyMinKg} – ${bmi.healthyMaxKg} kg',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                Text(bmi.guidance, style: const TextStyle(fontSize: 13, color: Color(0xFF526458))),
                const SizedBox(height: 16),
                Text('Height: ${_heightCm.toStringAsFixed(0)} cm'),
                Slider(
                  min: 120,
                  max: 220,
                  value: _heightCm,
                  onChanged: (v) => setState(() => _heightCm = v),
                ),
                Text('Weight: ${_weightKg.toStringAsFixed(1)} kg'),
                Slider(
                  min: 30,
                  max: 160,
                  value: _weightKg,
                  onChanged: (v) => setState(() => _weightKg = v),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          color: const Color(0xFF14532D),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Daily Calorie Requirement',
                  style: TextStyle(color: Color(0xFFC7E2CF), fontSize: 13),
                ),
                const SizedBox(height: 4),
                Text(
                  '${cal.targetCalories} kcal / day',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'BMR: ${cal.bmr} kcal · Maintenance TDEE: ${cal.tdee} kcal',
                  style: const TextStyle(color: Color(0xFFD1E7D8), fontSize: 13),
                ),
                const SizedBox(height: 10),
                Text(
                  'Protein ${cal.proteinTargetG}g · Carbs ${cal.carbsTargetG}g · Fat ${cal.fatTargetG}g',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: () async {
            final state = context.read<AppStateService>();
            if (state.profile != null) {
              await state.saveProfile(
                state.profile!.copyWith(
                  age: _age,
                  gender: _gender,
                  heightCm: _heightCm,
                  weightKg: _weightKg,
                  activityLevel: _activity,
                  fitnessGoal: _goal,
                ),
              );
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Updated profile BMI and calorie targets!')),
                );
              }
            }
          },
          style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
          child: const Text('Save Targets to My Profile'),
        ),
      ],
    );
  }
}
