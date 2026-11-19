# NutriAI – Smart Nutrition & Meal Planner (Flutter Android App)

A complete Flutter (Dart) + Material Design 3 + Firebase Android application built for a college DSE project. Recommends personalized meals based on age, height, weight, gender, dietary preference, activity level, and fitness goal using a 100% free rule-based recommendation engine — with full Firebase Authentication & Cloud Firestore sync plus an automatic Local Demo Mode fallback.

---

## Project Structure

```text
flutter_nutriai/
├── pubspec.yaml
├── README.md
└── lib/
    ├── main.dart
    ├── data/
    │   └── sample_meals.dart
    ├── models/
    │   ├── meal.dart
    │   ├── meal_plan_entry.dart
    │   └── user_profile.dart
    ├── services/
    │   ├── app_state_service.dart
    │   ├── meal_recommendation_engine.dart
    │   └── nutrition_calculator.dart
    ├── screens/
    │   ├── auth_screen.dart
    │   ├── calculators_screen.dart
    │   ├── home_dashboard_screen.dart
    │   ├── main_shell_screen.dart
    │   ├── meal_planner_screen.dart
    │   ├── meal_recommendations_screen.dart
    │   ├── settings_screen.dart
    │   └── splash_screen.dart
    └── widgets/
        ├── calorie_ring_card.dart
        └── meal_card.dart
```

---

## Running in Android Studio

1. **Install Prerequisites**:
   - Install **Flutter SDK (3.22+)** and **Android Studio (Jellyfish / Koala or newer)**.
   - Install the **Flutter** and **Dart** plugins in Android Studio (`Settings -> Plugins`).
   - Run `flutter doctor` in Terminal and confirm Android toolchain & SDK are green.
2. **Initialize Platform Folders (First-Time Setup)**:
   ```bash
   cd flutter_nutriai
   flutter create . --platforms=android --org com.college.nutriai
   flutter pub get
   ```
3. **Configure Firebase (Optional — Local Demo Mode Works Out of the Box!)**:
   - Go to [Firebase Console](https://console.firebase.google.com/) and create/select a project.
   - Register an Android app with package name `com.college.nutriai.nutri_ai` (or match `applicationId` in `android/app/build.gradle`).
   - Download `google-services.json` and place it inside `android/app/google-services.json`.
   - Enable **Email/Password** in *Authentication -> Sign-in method*.
   - Create a **Cloud Firestore** database and deploy the provided `firestore.rules`.
   - Or run `dart pub global activate flutterfire_cli && flutterfire configure` to auto-generate `firebase_options.dart`.
   - **Note**: If Firebase is not configured on your machine, NutriAI automatically launches cleanly with a working **Local Demo Mode** using `SharedPreferences`.
4. **Run on Emulator or Physical Android Device**:
   - Open the `flutter_nutriai` folder in Android Studio.
   - Select an Android Emulator (API 33+) or connect an Android phone with USB Debugging enabled.
   - Click the green **Run** button or run:
     ```bash
     flutter run
     ```

---

## Building the Release Android APK

1. **Verify clean dependencies**:
   ```bash
   flutter clean
   flutter pub get
   ```
2. **Build Universal Release APK**:
   ```bash
   flutter build apk --release
   ```
   Output APK path:
   `build/app/outputs/flutter-apk/app-release.apk`
3. **Build Smaller Split APKs per CPU ABI (Optional)**:
   ```bash
   flutter build apk --split-per-abi --release
   ```
4. **Install APK on an Android Device**:
   - Copy `app-release.apk` to the phone and tap to install (allow *Install unknown apps*), or run:
     ```bash
     flutter install --release
     ```

---

## Building the APK Online for Free (No Android Studio Needed)

This repository includes `.github/workflows/build-apk.yml` so GitHub can compile your Android APK automatically in the cloud:

1. Push this project to a GitHub repository (public or private).
2. Open the repository on GitHub (even from your phone's browser) and tap the **Actions** tab.
3. Select **Build NutriAI Android APK** (or click **Run workflow**).
4. Wait ~3–5 minutes for the green checkmark, then scroll down to **Artifacts** and download **`NutriAI-Android-APK`**.
5. Unzip the downloaded file on your phone and tap **`NutriAI-release.apk`** to install!

