import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _showPassword = false;
  bool _emailValid = false;
  bool _loading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleEmailChange(String value) {
    final isValid = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(value);
    setState(() => _emailValid = isValid);
  }

  bool get _canSubmit => _emailValid && _passwordController.text.length >= 8;

  void _handleSignIn() {
    if (!_canSubmit || _loading) return;
    setState(() => _loading = true);
    Future.delayed(const Duration(milliseconds: 1400), () {
      if (mounted) {
        setState(() => _loading = false);
        context.go('/home');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              children: [
                // ── Header ──
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 28, height: 28,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.local_shipping, size: 16, color: AppColors.white),
                      ),
                      const SizedBox(width: 8),
                      const Text('VECTOR', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, letterSpacing: 0.72, color: AppColors.textPrimary)),
                    ],
                  ),
                ),

                // ── Card ──
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                    child: Column(
                      children: [
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            border: Border.all(color: const Color(0x14000000)),
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: const [BoxShadow(color: Color(0x0A000000), blurRadius: 24, offset: Offset(0, 4))],
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Title
                              const Text('Welcome back', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.48, color: AppColors.textPrimary)),
                              const SizedBox(height: 5),
                              const Text('Sign in to continue your deliveries', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                              const SizedBox(height: 28),

                              // Email
                              _FieldLabel(label: 'Email'),
                              const SizedBox(height: 7),
                              _EmailField(
                                controller: _emailController,
                                emailValid: _emailValid,
                                onChanged: _handleEmailChange,
                              ),
                              const SizedBox(height: 14),

                              // Password
                              _FieldLabel(label: 'Password'),
                              const SizedBox(height: 7),
                              _PasswordField(
                                controller: _passwordController,
                                showPassword: _showPassword,
                                onToggle: () => setState(() => _showPassword = !_showPassword),
                                onChanged: (_) => setState(() {}),
                              ),
                              const SizedBox(height: 8),

                              // Forgot password
                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: () => context.push('/forgot-password'),
                                  style: TextButton.styleFrom(padding: EdgeInsets.zero, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                                  child: const Text('Forgot password?', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
                                ),
                              ),
                              const SizedBox(height: 24),

                              // Submit button
                              _SignInButton(
                                loading: _loading,
                                canSubmit: _canSubmit,
                                onPressed: _handleSignIn,
                              ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Create account link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text("Don't have an account?", style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                            const SizedBox(width: 4),
                            GestureDetector(
                              onTap: () => context.push('/signup'),
                              child: const Text('Create one', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                            ),
                          ],
                        ),
                      ],
                    ),
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

// ── Supporting Widgets ──────────────────────────────────────────────────────

class _FieldLabel extends StatelessWidget {
  final String label;
  const _FieldLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.48),
    );
  }
}

class _EmailField extends StatelessWidget {
  final TextEditingController controller;
  final bool emailValid;
  final ValueChanged<String> onChanged;

  const _EmailField({required this.controller, required this.emailValid, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: TextInputType.emailAddress,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText: 'alex@example.com',
        hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 14),
        filled: true,
        fillColor: emailValid ? const Color(0xFFFAFFFE) : AppColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
        prefixIcon: const Icon(Icons.email_outlined, size: 16, color: AppColors.textHint),
        suffixIcon: emailValid ? const Icon(Icons.check_circle, size: 16, color: AppColors.primary) : null,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: emailValid ? AppColors.primary : const Color(0x1A000000), width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}

class _PasswordField extends StatelessWidget {
  final TextEditingController controller;
  final bool showPassword;
  final VoidCallback onToggle;
  final ValueChanged<String> onChanged;

  const _PasswordField({required this.controller, required this.showPassword, required this.onToggle, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      obscureText: !showPassword,
      onChanged: onChanged,
      style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
      decoration: InputDecoration(
        hintText: 'Your password',
        hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 14),
        filled: true,
        fillColor: AppColors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
        prefixIcon: const Icon(Icons.lock_outline, size: 16, color: AppColors.textHint),
        suffixIcon: IconButton(
          icon: Icon(showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 16, color: AppColors.textHint),
          onPressed: onToggle,
          padding: EdgeInsets.zero,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0x1A000000), width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}

class _SignInButton extends StatelessWidget {
  final bool loading;
  final bool canSubmit;
  final VoidCallback onPressed;

  const _SignInButton({required this.loading, required this.canSubmit, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 50,
      child: ElevatedButton(
        onPressed: canSubmit && !loading ? onPressed : null,
        style: ElevatedButton.styleFrom(
          backgroundColor: canSubmit ? AppColors.primary : const Color(0x12000000),
          disabledBackgroundColor: const Color(0x12000000),
          foregroundColor: canSubmit ? AppColors.white : AppColors.textHint,
          disabledForegroundColor: AppColors.textHint,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: canSubmit ? 2 : 0,
          shadowColor: canSubmit ? AppColors.primary.withValues(alpha: 0.25) : Colors.transparent,
        ),
        child: loading
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
            : const Text('Sign in', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
