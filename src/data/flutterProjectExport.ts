import readmeMd from '../../flutter_nutriai/README.md?raw';
import pubspecYaml from '../../flutter_nutriai/pubspec.yaml?raw';
import mainDart from '../../flutter_nutriai/lib/main.dart?raw';
import userProfileDart from '../../flutter_nutriai/lib/models/user_profile.dart?raw';
import mealDart from '../../flutter_nutriai/lib/models/meal.dart?raw';
import mealPlanEntryDart from '../../flutter_nutriai/lib/models/meal_plan_entry.dart?raw';
import sampleMealsDart from '../../flutter_nutriai/lib/data/sample_meals.dart?raw';
import nutritionCalcDart from '../../flutter_nutriai/lib/services/nutrition_calculator.dart?raw';
import mealRecEngineDart from '../../flutter_nutriai/lib/services/meal_recommendation_engine.dart?raw';
import appStateDart from '../../flutter_nutriai/lib/services/app_state_service.dart?raw';
import splashScreenDart from '../../flutter_nutriai/lib/screens/splash_screen.dart?raw';
import authScreenDart from '../../flutter_nutriai/lib/screens/auth_screen.dart?raw';
import mainShellDart from '../../flutter_nutriai/lib/screens/main_shell_screen.dart?raw';
import homeDashboardDart from '../../flutter_nutriai/lib/screens/home_dashboard_screen.dart?raw';
import mealRecScreenDart from '../../flutter_nutriai/lib/screens/meal_recommendations_screen.dart?raw';
import mealPlannerScreenDart from '../../flutter_nutriai/lib/screens/meal_planner_screen.dart?raw';
import calculatorsScreenDart from '../../flutter_nutriai/lib/screens/calculators_screen.dart?raw';
import settingsScreenDart from '../../flutter_nutriai/lib/screens/settings_screen.dart?raw';
import calorieRingDart from '../../flutter_nutriai/lib/widgets/calorie_ring_card.dart?raw';
import mealCardDart from '../../flutter_nutriai/lib/widgets/meal_card.dart?raw';
import firestoreRules from '../../firestore.rules?raw';
import buildApkWorkflow from '../../.github/workflows/build-apk.yml?raw';

export interface FlutterSourceFile {
  path: string;
  content: string;
}

export const FLUTTER_PROJECT_FILES: FlutterSourceFile[] = [
  { path: 'README.md (Android Studio & APK Guide)', content: readmeMd },
  { path: '.github/workflows/build-apk.yml (Cloud APK Builder)', content: buildApkWorkflow },
  { path: 'pubspec.yaml', content: pubspecYaml },
  { path: 'firestore.rules', content: firestoreRules },
  { path: 'lib/main.dart', content: mainDart },
  { path: 'lib/models/user_profile.dart', content: userProfileDart },
  { path: 'lib/models/meal.dart', content: mealDart },
  { path: 'lib/models/meal_plan_entry.dart', content: mealPlanEntryDart },
  { path: 'lib/data/sample_meals.dart', content: sampleMealsDart },
  { path: 'lib/services/nutrition_calculator.dart', content: nutritionCalcDart },
  { path: 'lib/services/meal_recommendation_engine.dart', content: mealRecEngineDart },
  { path: 'lib/services/app_state_service.dart', content: appStateDart },
  { path: 'lib/screens/splash_screen.dart', content: splashScreenDart },
  { path: 'lib/screens/auth_screen.dart', content: authScreenDart },
  { path: 'lib/screens/main_shell_screen.dart', content: mainShellDart },
  { path: 'lib/screens/home_dashboard_screen.dart', content: homeDashboardDart },
  { path: 'lib/screens/meal_recommendations_screen.dart', content: mealRecScreenDart },
  { path: 'lib/screens/meal_planner_screen.dart', content: mealPlannerScreenDart },
  { path: 'lib/screens/calculators_screen.dart', content: calculatorsScreenDart },
  { path: 'lib/screens/settings_screen.dart', content: settingsScreenDart },
  { path: 'lib/widgets/calorie_ring_card.dart', content: calorieRingDart },
  { path: 'lib/widgets/meal_card.dart', content: mealCardDart },
];
