import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/user_profile.dart';
import '../services/app_state_service.dart';
import 'auth_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _nameCtrl = TextEditingController();
  DietaryPreference _diet = DietaryPreference.vegetarian;
  FitnessGoal _goal = FitnessGoal.weightMaintenance;
  bool _loaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loaded) {
      final p = context.read<AppStateService>().profile;
      if (p != null) {
        _nameCtrl.text = p.fullName;
        _diet = p.dietaryPreference;
        _goal = p.fitnessGoal;
        _loaded = true;
      }
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppStateService>();
    final profile = state.profile;
    if (profile == null) return const SizedBox.shrink();

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
      children: [
        const Text(
          'Settings & Preferences',
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _nameCtrl,
                  decoration: const InputDecoration(labelText: 'Full Name'),
                ),
                const SizedBox(height: 16),
                const Text('Dietary Preference', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                SegmentedButton<DietaryPreference>(
                  segments: const [
                    ButtonSegment(value: DietaryPreference.vegetarian, label: Text('Veg')),
                    ButtonSegment(value: DietaryPreference.vegan, label: Text('Vegan')),
                    ButtonSegment(value: DietaryPreference.nonVegetarian, label: Text('Non-Veg')),
                  ],
                  selected: {_diet},
                  onSelectionChanged: (s) => setState(() => _diet = s.first),
                ),
                const SizedBox(height: 16),
                const Text('Fitness Goal', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                SegmentedButton<FitnessGoal>(
                  segments: const [
                    ButtonSegment(value: FitnessGoal.weightLoss, label: Text('Loss')),
                    ButtonSegment(value: FitnessGoal.weightMaintenance, label: Text('Maintain')),
                    ButtonSegment(value: FitnessGoal.weightGain, label: Text('Gain')),
                  ],
                  selected: {_goal},
                  onSelectionChanged: (s) => setState(() => _goal = s.first),
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: () async {
                    await state.saveProfile(
                      profile.copyWith(
                        fullName: _nameCtrl.text.trim().isEmpty
                            ? profile.fullName
                            : _nameCtrl.text.trim(),
                        dietaryPreference: _diet,
                        fitnessGoal: _goal,
                      ),
                    );
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Profile & preferences saved!')),
                      );
                    }
                  },
                  style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                  child: const Text('Save Changes'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        OutlinedButton.icon(
          onPressed: () async {
            await state.logout();
            if (!context.mounted) return;
            Navigator.of(context).pushReplacement(
              MaterialPageRoute(builder: (_) => const AuthScreen()),
            );
          },
          icon: const Icon(Icons.logout_rounded, color: Color(0xFFB91C1C)),
          label: const Text(
            'Logout',
            style: TextStyle(color: Color(0xFFB91C1C)),
          ),
          style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
        ),
      ],
    );
  }
}
