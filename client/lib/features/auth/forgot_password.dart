import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:client/core/theme/colors.dart';
import 'package:client/core/theme/spacing.dart';
import 'package:client/widgets/inputs.dart';
import 'package:client/widgets/buttons.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  bool _emailSent = false;
  final TextEditingController _emailController = TextEditingController();
  String? _emailError;

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
    });
  }

  void _handleSendReset() {
    _validate();
    if (_emailError != null || _emailController.text.isEmpty) return;
    setState(() => _emailSent = true);
  }

  Widget _buildHeader() {
    return Row(
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
    );
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primaryLight,
          ),
          child: const Icon(Icons.check_circle, size: 40, color: AppColors.primary),
        ),
        const SizedBox(height: AppSpacing.p6),
        const Text(
          'Check your email',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: AppSpacing.p3),
        const Text(
          'We\'ve sent a password reset link to',
          style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.p2),
        Text(
          _emailController.text,
          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.primary),
        ),
        const SizedBox(height: AppSpacing.p8),
        const Text(
          'Click the link in the email to reset your password. If you don\'t see it, check your spam folder.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.textMuted, height: 1.5),
        ),
        const SizedBox(height: AppSpacing.p8),
        AppButton(
          label: 'Back to sign in',
          isFullWidth: true,
          onPressed: () => context.push('/signin'),
        ),
        const SizedBox(height: AppSpacing.p4),
        TextButton(
          onPressed: () => setState(() => _emailSent = false),
          child: const Text('Try a different email', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
        )
      ],
    );
  }

  Widget _buildFormView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildHeader(),
        const SizedBox(height: 32),
        Container(
          padding: const EdgeInsets.all(AppSpacing.p6),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.divider),
            boxShadow: const [
              BoxShadow(
                color: Color(0x0A000000),
                blurRadius: 24,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Reset password',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.48,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: AppSpacing.p1),
              const Text(
                'Enter your email address and we\'ll send you a link to reset your password.',
                style: TextStyle(fontSize: 14, color: AppColors.textMuted),
              ),
              const SizedBox(height: AppSpacing.p6),
              AppTextField(
                label: 'Email address',
                hintText: 'alex@example.com',
                controller: _emailController,
                prefixIcon: const Icon(Icons.email_outlined, size: 16, color: AppColors.textHint),
                keyboardType: TextInputType.emailAddress,
                errorText: _emailError,
                onChanged: (_) {
                  if (_emailError != null) _validate();
                },
              ),
              const SizedBox(height: AppSpacing.p6),
              AppButton(
                label: 'Send reset link',
                isFullWidth: true,
                onPressed: _handleSendReset,
              ),
              const SizedBox(height: AppSpacing.p6),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Remember your password? ', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                  GestureDetector(
                    onTap: () => context.push('/signin'),
                    child: const Text(
                      'Sign in',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary),
                    ),
                  )
                ],
              )
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
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
                  child: _emailSent ? _buildSuccessView() : _buildFormView(),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
