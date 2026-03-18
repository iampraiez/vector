import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:client/core/theme/colors.dart';
import 'package:client/core/theme/spacing.dart';
import 'package:client/main.dart';
import 'package:client/shared/widgets/inputs.dart';
import 'package:client/shared/widgets/buttons.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  String? _emailError;
  String? _passwordError;
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _validate() {
    setState(() {
      final email = _emailController.text;
      if (email.isEmpty) {
        _emailError = 'Email is required';
      } else if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
        _emailError = 'Enter a valid email address';
      } else {
        _emailError = null;
      }

      final password = _passwordController.text;
      if (password.isEmpty) {
        _passwordError = 'Password is required';
      } else if (password.length < 8) {
        _passwordError = 'Password must be at least 8 characters';
      } else {
        _passwordError = null;
      }
    });
  }

  bool get _isValid => _emailError == null && _passwordError == null && 
                       _emailController.text.isNotEmpty && _passwordController.text.isNotEmpty;

  void _handleSignIn() async {
    _validate();
    if (!_isValid || _loading) return;

    setState(() => _loading = true);
    try {
      await AuthScope.of(context).login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      // Redirection is handled by the router
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p5),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                  maxWidth: 480,
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: AppSpacing.p8),
                      // ── Header ──
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.local_shipping, size: 16, color: AppColors.white),
                          ),
                          const SizedBox(width: AppSpacing.p2),
                          const Text(
                            'VECTOR',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.72,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),

                      // ── Card ──
                      Container(
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          border: Border.all(color: const Color(0x14000000)),
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x0A000000),
                              blurRadius: 24,
                              offset: Offset(0, 4),
                            )
                          ],
                        ),
                        padding: const EdgeInsets.all(AppSpacing.p6),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Welcome back',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.48,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p1),
                            const Text(
                              'Sign in to continue your deliveries',
                              style: TextStyle(fontSize: 14, color: AppColors.textMuted),
                            ),
                            const SizedBox(height: AppSpacing.p6),

                            AppTextField(
                              label: 'Email',
                              hintText: 'alex@example.com',
                              controller: _emailController,
                              prefixIcon: Icon(Icons.email_outlined, size: 16, color: AppColors.textHint),
                              keyboardType: TextInputType.emailAddress,
                              errorText: _emailError,
                              onChanged: (_) {
                                if (_emailError != null) _validate();
                              },
                            ),
                            const SizedBox(height: AppSpacing.p4),

                            AppTextField(
                              label: 'Password',
                              hintText: 'Your password',
                              controller: _passwordController,
                              prefixIcon: Icon(Icons.lock_outline, size: 16, color: AppColors.textHint),
                              isPassword: true,
                              errorText: _passwordError,
                              onChanged: (_) {
                                if (_passwordError != null) _validate();
                              },
                            ),
                            const SizedBox(height: 8),

                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () => context.push('/forgot-password'),
                                style: TextButton.styleFrom(
                                  padding: EdgeInsets.zero,
                                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                ),
                                child: const Text(
                                  'Forgot password?',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p6),

                            AppButton(
                              label: 'Sign in',
                              isFullWidth: true,
                              isLoading: _loading,
                              onPressed: _handleSignIn,
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Create account link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            "Don't have an account?",
                            style: TextStyle(fontSize: 14, color: AppColors.textMuted),
                          ),
                          const SizedBox(width: 4),
                          GestureDetector(
                            onTap: () => context.push('/signup'),
                            child: const Text(
                              'Create one',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.p8),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
