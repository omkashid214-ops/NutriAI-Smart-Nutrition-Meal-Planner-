import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/app_state_service.dart';
import 'auth_screen.dart';
import 'main_shell_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..forward();

    Future.delayed(const Duration(milliseconds: 1600), _navigateNext);
  }

  void _navigateNext() {
    if (!mounted) return;
    final state = context.read<AppStateService>();
    final nextScreen =
        state.isAuthenticated ? const MainShellScreen() : const AuthScreen();
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => nextScreen),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF14532D),
      body: Center(
        child: FadeTransition(
          opacity: CurvedAnimation(parent: _controller, curve: Curves.easeOut),
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 84,
                  height: 84,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE6F4EC),
                    borderRadius: BorderRadius.circular(26),
                  ),
                  child: const Icon(
                    Icons.eco_rounded,
                    size: 44,
                    color: Color(0xFF14532D),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'NutriAI',
                  style: TextStyle(
                    fontSize: 34,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Smart Nutrition & Personalized Meal Planner',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFFD1E7D8),
                  ),
                ),
                const SizedBox(height: 36),
                const SizedBox(
                  width: 180,
                  child: LinearProgressIndicator(
                    minHeight: 5,
                    borderRadius: BorderRadius.all(Radius.circular(99)),
                    backgroundColor: Colors.white24,
                    color: Color(0xFFA7F3C0),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
