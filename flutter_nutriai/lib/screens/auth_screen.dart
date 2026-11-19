import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../services/app_state_service.dart';
import 'main_shell_screen.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();

  bool _isRegister = false;
  bool _obscurePassword = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    setState(() {
      _loading = true;
      _error = null;
    });

    final state = context.read<AppStateService>();
    final err = _isRegister
        ? await state.registerWithEmail(
            _nameCtrl.text,
            _emailCtrl.text,
            _passwordCtrl.text,
          )
        : await state.loginWithEmail(_emailCtrl.text, _passwordCtrl.text);

    if (!mounted) return;
    setState(() => _loading = false);

    if (err != null) {
      setState(() => _error = err);
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const MainShellScreen()),
      );
    }
  }

  Future<void> _enterDemoMode() async {
    await context.read<AppStateService>().startLocalDemoMode();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const MainShellScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: const Color(0xFF14532D),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.eco_rounded, color: Color(0xFFE6F4EC)),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'NutriAI',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF14231A),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),
              Text(
                _isRegister ? 'Create your account' : 'Welcome back',
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF14231A),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _isRegister
                    ? 'Set up personalized meal plans and nutrition tracking.'
                    : 'Sign in with Firebase Authentication to load your nutrition profile.',
                style: const TextStyle(fontSize: 14, color: Color(0xFF526458)),
              ),
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_error != null) ...[
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFECACA)),
                            ),
                            child: Text(
                              _error!,
                              style: const TextStyle(
                                color: Color(0xFF991B1B),
                                fontSize: 13,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        if (_isRegister) ...[
                          TextFormField(
                            controller: _nameCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Full Name',
                              prefixIcon: Icon(Icons.person_outline),
                            ),
                            validator: (v) =>
                                (v == null || v.trim().length < 2) ? 'Enter your full name' : null,
                          ),
                          const SizedBox(height: 14),
                        ],
                        TextFormField(
                          controller: _emailCtrl,
                          keyboardType: TextInputType.emailAddress,
                          decoration: const InputDecoration(
                            labelText: 'Email Address',
                            prefixIcon: Icon(Icons.mail_outline),
                          ),
                          validator: (v) => (v == null || !v.contains('@'))
                              ? 'Enter a valid email address'
                              : null,
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _passwordCtrl,
                          obscureText: _obscurePassword,
                          decoration: InputDecoration(
                            labelText: 'Password',
                            prefixIcon: const Icon(Icons.lock_outline),
                            suffixIcon: IconButton(
                              onPressed: () =>
                                  setState(() => _obscurePassword = !_obscurePassword),
                              icon: Icon(
                                _obscurePassword
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                              ),
                            ),
                          ),
                          validator: (v) => (v == null || v.length < 6)
                              ? 'Password must be at least 6 characters'
                              : null,
                        ),
                        const SizedBox(height: 20),
                        FilledButton(
                          onPressed: _loading ? null : _submit,
                          style: FilledButton.styleFrom(
                            minimumSize: const Size.fromHeight(50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: _loading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Text(_isRegister ? 'Register Account' : 'Sign In'),
                        ),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => setState(() {
                            _isRegister = !_isRegister;
                            _error = null;
                          }),
                          child: Text(
                            _isRegister
                                ? 'Already have an account? Sign In'
                                : 'New to NutriAI? Create Account',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _enterDemoMode,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                icon: const Icon(Icons.play_arrow_rounded),
                label: const Text('Continue in Local Demo Mode'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
