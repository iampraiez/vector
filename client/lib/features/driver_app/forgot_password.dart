import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/inputs.dart';
import '../../shared/widgets/buttons.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  bool _emailSent = false;
  final TextEditingController _emailController = TextEditingController();

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
          style: TextStyle(fontSize: 14, color: AppColors.textMuted),
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
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        const SizedBox(height: AppSpacing.p6),
        const Text(
          'Reset password',
          style: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: AppSpacing.p3),
        const Text(
          'Enter your email address and we\'ll send you a link to reset your password.',
          style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
        ),
        const SizedBox(height: AppSpacing.p8),
        AppTextField(
          label: 'Email address',
          hintText: 'alex@example.com',
          controller: _emailController,
          prefixIcon: const Icon(Icons.email_outlined, size: 20, color: AppColors.textMuted),
          keyboardType: TextInputType.emailAddress,
        ),
        const SizedBox(height: AppSpacing.p8),
        AppButton(
          label: 'Send reset link',
          isFullWidth: true,
          onPressed: () => setState(() => _emailSent = true),
        ),
        const SizedBox(height: AppSpacing.p6),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Remember your password? ', style: TextStyle(color: AppColors.textSecondary)),
            GestureDetector(
              onTap: () => context.push('/signin'),
              child: const Text('Sign in', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
            )
          ],
        )
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface, // PageBackground equivalent
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.p5),
              child: _emailSent ? _buildSuccessView() : _buildFormView(),
            ),
          ),
        ),
      ),
    );
  }
}
