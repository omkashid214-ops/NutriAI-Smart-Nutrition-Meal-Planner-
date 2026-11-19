import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import 'screens/splash_screen.dart';
import 'services/app_state_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  bool firebaseReady = false;
  try {
    await Firebase.initializeApp();
    firebaseReady = true;
  } catch (e) {
    debugPrint('Firebase config unavailable, starting in Local Demo Mode: $e');
    firebaseReady = false;
  }

  runApp(
    ChangeNotifierProvider(
      create: (_) => AppStateService(firebaseAvailable: firebaseReady)..init(),
      child: const NutriAIApp(),
    ),
  );
}

class NutriAIApp extends StatelessWidget {
  const NutriAIApp({super.key});

  @override
  Widget build(BuildContext context) {
    const primaryGreen = Color(0xFF1B6B40);
    const creamCanvas = Color(0xFFF7F8F4);

    final colorScheme = ColorScheme.fromSeed(
      seedColor: primaryGreen,
      primary: primaryGreen,
      surface: Colors.white,
      brightness: Brightness.light,
    );

    return MaterialApp(
      title: 'NutriAI – Smart Nutrition & Meal Planner',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: colorScheme,
        scaffoldBackgroundColor: creamCanvas,
        textTheme: GoogleFonts.dmSansTextTheme(),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: const BorderSide(color: Color(0xFFE2E8DF)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFFAFBF9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFD8E1D5)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: Color(0xFFD8E1D5)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(color: primaryGreen, width: 1.6),
          ),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
