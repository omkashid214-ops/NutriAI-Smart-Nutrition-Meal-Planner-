enum Gender { male, female, other }

enum ActivityLevel { sedentary, light, moderate, active, veryActive }

enum DietaryPreference { vegetarian, vegan, nonVegetarian }

enum FitnessGoal { weightLoss, weightMaintenance, weightGain }

class UserProfile {
  final String uid;
  final String fullName;
  final String email;
  final int age;
  final Gender gender;
  final double heightCm;
  final double weightKg;
  final ActivityLevel activityLevel;
  final DietaryPreference dietaryPreference;
  final FitnessGoal fitnessGoal;
  final double bmi;
  final String bmiCategory;
  final int dailyCalorieTarget;

  const UserProfile({
    required this.uid,
    required this.fullName,
    required this.email,
    required this.age,
    required this.gender,
    required this.heightCm,
    required this.weightKg,
    required this.activityLevel,
    required this.dietaryPreference,
    required this.fitnessGoal,
    required this.bmi,
    required this.bmiCategory,
    required this.dailyCalorieTarget,
  });

  UserProfile copyWith({
    String? fullName,
    int? age,
    Gender? gender,
    double? heightCm,
    double? weightKg,
    ActivityLevel? activityLevel,
    DietaryPreference? dietaryPreference,
    FitnessGoal? fitnessGoal,
    double? bmi,
    String? bmiCategory,
    int? dailyCalorieTarget,
  }) {
    return UserProfile(
      uid: uid,
      fullName: fullName ?? this.fullName,
      email: email,
      age: age ?? this.age,
      gender: gender ?? this.gender,
      heightCm: heightCm ?? this.heightCm,
      weightKg: weightKg ?? this.weightKg,
      activityLevel: activityLevel ?? this.activityLevel,
      dietaryPreference: dietaryPreference ?? this.dietaryPreference,
      fitnessGoal: fitnessGoal ?? this.fitnessGoal,
      bmi: bmi ?? this.bmi,
      bmiCategory: bmiCategory ?? this.bmiCategory,
      dailyCalorieTarget: dailyCalorieTarget ?? this.dailyCalorieTarget,
    );
  }

  Map<String, dynamic> toMap() => {
        'uid': uid,
        'fullName': fullName,
        'email': email,
        'age': age,
        'gender': gender.name,
        'heightCm': heightCm,
        'weightKg': weightKg,
        'activityLevel': activityLevel.name,
        'dietaryPreference': dietaryPreference.name,
        'fitnessGoal': fitnessGoal.name,
        'bmi': bmi,
        'bmiCategory': bmiCategory,
        'dailyCalorieTarget': dailyCalorieTarget,
      };

  factory UserProfile.fromMap(Map<String, dynamic> map) {
    return UserProfile(
      uid: (map['uid'] as String?) ?? 'demo_user',
      fullName: (map['fullName'] as String?) ?? 'NutriAI Member',
      email: (map['email'] as String?) ?? 'demo@nutriai.app',
      age: ((map['age'] as num?) ?? 22).toInt(),
      gender: Gender.values.firstWhere(
        (g) => g.name == map['gender'],
        orElse: () => Gender.male,
      ),
      heightCm: ((map['heightCm'] as num?) ?? 172).toDouble(),
      weightKg: ((map['weightKg'] as num?) ?? 68).toDouble(),
      activityLevel: ActivityLevel.values.firstWhere(
        (a) => a.name == map['activityLevel'],
        orElse: () => ActivityLevel.moderate,
      ),
      dietaryPreference: DietaryPreference.values.firstWhere(
        (d) => d.name == map['dietaryPreference'],
        orElse: () => DietaryPreference.vegetarian,
      ),
      fitnessGoal: FitnessGoal.values.firstWhere(
        (f) => f.name == map['fitnessGoal'],
        orElse: () => FitnessGoal.weightMaintenance,
      ),
      bmi: ((map['bmi'] as num?) ?? 23.0).toDouble(),
      bmiCategory: (map['bmiCategory'] as String?) ?? 'Normal',
      dailyCalorieTarget: ((map['dailyCalorieTarget'] as num?) ?? 2250).toInt(),
    );
  }
}
