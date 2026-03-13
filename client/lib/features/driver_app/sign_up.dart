import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/inputs.dart';
import '../../shared/widgets/buttons.dart';

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

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
                // Header
                Container(
                  padding: const EdgeInsets.all(AppSpacing.p6),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(AppSpacing.radiusSm),
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
                ),

                // Content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.fromLTRB(AppSpacing.p5, 0, AppSpacing.p5, AppSpacing.p8),
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.p6),
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.divider),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0x0A000000),
                                blurRadius: 24,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text(
                                'Create driver account',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: -0.48,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.p1),
                              const Text(
                                'Join your fleet and start delivering',
                                style: TextStyle(
                                  fontSize: 14,
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const SizedBox(height: AppSpacing.p6),

                              const AppTextField(
                                label: 'Company Code',
                                hintText: 'e.g. ACM-2026',
                                prefixIcon: Icon(Icons.storefront_outlined, size: 16),
                              ),
                              const Padding(
                                padding: EdgeInsets.only(top: AppSpacing.p1, left: AppSpacing.p1),
                                child: Text(
                                  'Ask your fleet manager for this code',
                                  style: TextStyle(fontSize: 12, color: AppColors.textHint),
                                ),
                              ),
                              const SizedBox(height: AppSpacing.p4),

                              Row(
                                children: [
                                  const Expanded(child: Divider()),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p2),
                                    child: Text(
                                      'YOUR DETAILS',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textHint,
                                        letterSpacing: 0.44,
                                      ),
                                    ),
                                  ),
                                  const Expanded(child: Divider()),
                                ],
                              ),
                              const SizedBox(height: AppSpacing.p4),

                              const AppTextField(
                                label: 'Full Name',
                                hintText: 'Alex Rivera',
                                prefixIcon: Icon(Icons.person_outline, size: 16),
                              ),
                              const SizedBox(height: AppSpacing.p4),

                              const AppTextField(
                                label: 'Email Address',
                                hintText: 'alex@example.com',
                                prefixIcon: Icon(Icons.email_outlined, size: 16),
                                keyboardType: TextInputType.emailAddress,
                              ),
                              const SizedBox(height: AppSpacing.p4),

                              const AppTextField(
                                label: 'Phone Number',
                                hintText: '+1 (555) 000-0000',
                                prefixIcon: Icon(Icons.phone_outlined, size: 16),
                                keyboardType: TextInputType.phone,
                              ),
                              const SizedBox(height: AppSpacing.p4),

                              const AppTextField(
                                label: 'Password',
                                hintText: 'Minimum 8 characters',
                                prefixIcon: Icon(Icons.lock_outline, size: 16),
                                obscureText: true,
                              ),
                              const SizedBox(height: AppSpacing.p4),

                              const AppTextField(
                                label: 'Confirm Password',
                                hintText: 'Repeat your password',
                                prefixIcon: Icon(Icons.lock_outline, size: 16),
                                obscureText: true,
                              ),
                              const SizedBox(height: AppSpacing.p6),

                              AppButton(
                                label: 'Create driver account',
                                isFullWidth: true,
                                onPressed: () => context.push('/verify-email'),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: AppSpacing.p5),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'Already have an account? ',
                              style: TextStyle(fontSize: 14, color: AppColors.textMuted),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/signin'),
                              child: const Text(
                                'Sign in',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
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
