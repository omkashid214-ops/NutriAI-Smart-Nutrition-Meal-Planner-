import 'dart:convert';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/meal.dart';
import '../models/meal_plan_entry.dart';
import '../models/user_profile.dart';
import 'nutrition_calculator.dart';

/// Unified App State managing Firebase Auth + Firestore with seamless Local Demo Mode fallback.
class AppStateService extends ChangeNotifier {
  final bool firebaseAvailable;

  bool isInitialized = false;
  bool isDemoMode = false;
  bool isAuthenticated = false;
  UserProfile? profile;
  String selectedDateKey = DateFormat('yyyy-MM-dd').format(DateTime.now());
  List<MealPlanEntry> mealLogs = [];

  AppStateService({required this.firebaseAvailable});

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final demoActive = prefs.getBool('nutriai_demo_mode') ?? false;

    if (demoActive) {
      await startLocalDemoMode();
    } else if (firebaseAvailable) {
      final user = FirebaseAuth.instance.currentUser;
      if (user != null) {
        isAuthenticated = true;
        await _loadFirestoreUser(user);
      }
    }

    isInitialized = true;
    notifyListeners();
  }

  Future<void> startLocalDemoMode() async {
    isDemoMode = true;
    isAuthenticated = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('nutriai_demo_mode', true);

    final rawProfile = prefs.getString('nutriai_demo_profile');
    if (rawProfile != null) {
      profile = UserProfile.fromMap(jsonDecode(rawProfile) as Map<String, dynamic>);
    } else {
      profile = _defaultProfile('demo_user', 'Aarav Sharma', 'aarav.demo@nutriai.app');
      await prefs.setString('nutriai_demo_profile', jsonEncode(profile!.toMap()));
    }

    final rawLogs = prefs.getString('nutriai_demo_logs');
    if (rawLogs != null) {
      final decoded = jsonDecode(rawLogs) as List<dynamic>;
      mealLogs = decoded
          .map((e) => MealPlanEntry.fromMap(e as Map<String, dynamic>))
          .toList();
    }
    notifyListeners();
  }

  Future<String?> loginWithEmail(String email, String password) async {
    if (!firebaseAvailable) {
      await startLocalDemoMode();
      return null;
    }
    try {
      final cred = await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      isDemoMode = false;
      isAuthenticated = true;
      await _loadFirestoreUser(cred.user!);
      notifyListeners();
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message ?? 'Login failed. Please check your credentials.';
    }
  }

  Future<String?> registerWithEmail(String fullName, String email, String password) async {
    if (!firebaseAvailable) {
      await startLocalDemoMode();
      return null;
    }
    try {
      final cred = await FirebaseAuth.instance.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      await cred.user?.updateDisplayName(fullName.trim());
      isDemoMode = false;
      isAuthenticated = true;
      profile = _defaultProfile(cred.user!.uid, fullName.trim(), email.trim());
      await saveProfile(profile!);
      notifyListeners();
      return null;
    } on FirebaseAuthException catch (e) {
      return e.message ?? 'Registration failed.';
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('nutriai_demo_mode');
    if (firebaseAvailable && !isDemoMode) {
      await FirebaseAuth.instance.signOut();
    }
    isDemoMode = false;
    isAuthenticated = false;
    profile = null;
    mealLogs = [];
    notifyListeners();
  }

  Future<void> saveProfile(UserProfile updated) async {
    final bmi = NutritionCalculator.calculateBmi(updated.heightCm, updated.weightKg);
    final cal = NutritionCalculator.calculateCalories(
      age: updated.age,
      gender: updated.gender,
      heightCm: updated.heightCm,
      weightKg: updated.weightKg,
      activityLevel: updated.activityLevel,
      fitnessGoal: updated.fitnessGoal,
    );

    profile = updated.copyWith(
      bmi: bmi.bmi,
      bmiCategory: bmi.category,
      dailyCalorieTarget: cal.targetCalories,
    );

    if (isDemoMode || !firebaseAvailable) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('nutriai_demo_profile', jsonEncode(profile!.toMap()));
    } else {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(profile!.uid)
          .set({
        ...profile!.toMap(),
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    }
    notifyListeners();
  }

  Future<void> addMealLog(MealItem meal, MealSlot slot, {double servings = 1.0}) async {
    if (profile == null) return;
    final entry = MealPlanEntry(
      id: 'log_${DateTime.now().millisecondsSinceEpoch}',
      userId: profile!.uid,
      dateKey: selectedDateKey,
      mealSlot: slot,
      mealId: meal.id,
      mealName: meal.name,
      dietType: meal.dietType,
      servings: servings,
      calories: (meal.calories * servings).round(),
      proteinG: (meal.proteinG * servings).round(),
      carbsG: (meal.carbsG * servings).round(),
      fatG: (meal.fatG * servings).round(),
    );

    mealLogs = [...mealLogs, entry];
    notifyListeners();

    if (isDemoMode || !firebaseAvailable) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'nutriai_demo_logs',
        jsonEncode(mealLogs.map((e) => e.toMap()).toList()),
      );
    } else {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(profile!.uid)
          .collection('mealLogs')
          .doc(entry.id)
          .set({
        ...entry.toMap(),
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    }
  }

  Future<void> removeMealLog(String logId) async {
    if (profile == null) return;
    mealLogs = mealLogs.where((e) => e.id != logId).toList();
    notifyListeners();

    if (isDemoMode || !firebaseAvailable) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        'nutriai_demo_logs',
        jsonEncode(mealLogs.map((e) => e.toMap()).toList()),
      );
    } else {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(profile!.uid)
          .collection('mealLogs')
          .doc(logId)
          .delete();
    }
  }

  List<MealPlanEntry> get currentDayLogs =>
      mealLogs.where((e) => e.dateKey == selectedDateKey).toList();

  Future<void> _loadFirestoreUser(User user) async {
    final docSnap =
        await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    if (docSnap.exists && docSnap.data() != null) {
      profile = UserProfile.fromMap(docSnap.data()!);
    } else {
      profile = _defaultProfile(
        user.uid,
        user.displayName ?? 'NutriAI Member',
        user.email ?? 'user@nutriai.app',
      );
      await saveProfile(profile!);
    }

    final logsSnap = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .collection('mealLogs')
        .where('userId', isEqualTo: user.uid)
        .get();
    mealLogs = logsSnap.docs.map((d) => MealPlanEntry.fromMap(d.data())).toList();
  }

  UserProfile _defaultProfile(String uid, String name, String email) {
    final bmi = NutritionCalculator.calculateBmi(172, 68);
    final cal = NutritionCalculator.calculateCalories(
      age: 22,
      gender: Gender.male,
      heightCm: 172,
      weightKg: 68,
      activityLevel: ActivityLevel.moderate,
      fitnessGoal: FitnessGoal.weightMaintenance,
    );
    return UserProfile(
      uid: uid,
      fullName: name,
      email: email,
      age: 22,
      gender: Gender.male,
      heightCm: 172,
      weightKg: 68,
      activityLevel: ActivityLevel.moderate,
      dietaryPreference: DietaryPreference.vegetarian,
      fitnessGoal: FitnessGoal.weightMaintenance,
      bmi: bmi.bmi,
      bmiCategory: bmi.category,
      dailyCalorieTarget: cal.targetCalories,
    );
  }
}
