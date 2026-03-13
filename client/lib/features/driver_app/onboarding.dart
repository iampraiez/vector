import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/buttons.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int _currentStep = 0;

  final List<Map<String, dynamic>> _steps = [
    {
      'icon': Icons.local_shipping_outlined,
      'title': 'Optimize Every Route',
      'desc': 'AI-powered algorithms calculate the most efficient delivery routes, saving you time and fuel costs instantly.',
      'color': const Color(0x19059669),
    },
    {
      'icon': Icons.bolt_outlined,
      'title': 'Real-Time Updates',
      'desc': 'Track your progress with precise GPS navigation and automatic route adjustments that adapt on the fly.',
      'color': const Color(0x1934D399),
    },
    {
      'icon': Icons.my_location_outlined,
      'title': 'Proof of Delivery',
      'desc': 'Capture signatures and photos instantly. Keep detailed records for every successful delivery with ease.',
      'color': const Color(0x19047857),
    },
    {
      'icon': Icons.health_and_safety_outlined,
      'title': 'Built on Privacy',
      'desc': 'Your delivery data is encrypted and secure. We prioritize your privacy at every step of the journey.',
      'color': const Color(0x14059669),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isLastStep = _currentStep == _steps.length - 1;
    final currentStepData = _steps[_currentStep];

    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Stack(
          children: [
            // Background decor (stubbed with Container for now)
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: RadialGradient(
                    colors: [currentStepData['color'], Colors.transparent],
                    center: const Alignment(0, -0.2), // Adjust roughly 50% 40%
                    radius: 0.8,
                  ),
                ),
              ),
            ),
            
            // Skip Button
            if (!isLastStep)
              Positioned(
                top: AppSpacing.p6,
                right: AppSpacing.p6,
                child: TextButton(
                  onPressed: () => context.go('/home'),
                  child: const Text('Skip', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                ),
              ),

            // Content
            Column(
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(AppSpacing.radiusXl),
                            border: Border.all(color: AppColors.border),
                            boxShadow: const [
                              BoxShadow(color: Color(0x14000000), offset: Offset(0, 20), blurRadius: 40)
                            ],
                          ),
                          child: Icon(currentStepData['icon'], size: 56, color: AppColors.primary),
                        ),
                        const SizedBox(height: AppSpacing.p10),
                        Text(
                          currentStepData['title'],
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.p4),
                        Text(
                          currentStepData['desc'],
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            color: AppColors.textSecondary,
                            height: 1.6,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Bottom actions
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.p8),
                  child: Column(
                    children: [
                      // Dots
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_steps.length, (index) {
                          bool isActive = index == _currentStep;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            height: 6,
                            width: isActive ? 32 : 6,
                            decoration: BoxDecoration(
                              color: isActive ? AppColors.primary : AppColors.border,
                              borderRadius: BorderRadius.circular(3),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: AppSpacing.p6),
                      
                      AppButton(
                        label: isLastStep ? 'Get Started' : 'Continue',
                        isFullWidth: true,
                        onPressed: () {
                          if (isLastStep) {
                            context.go('/home');
                          } else {
                            setState(() => _currentStep++);
                          }
                        },
                      ),
                      
                      if (_currentStep > 0) ...[
                        const SizedBox(height: AppSpacing.p2),
                        AppButton(
                          label: 'Back',
                          variant: ButtonVariant.ghost,
                          isFullWidth: true,
                          onPressed: () => setState(() => _currentStep--),
                        ),
                      ] else ...[
                        // Reserve space so layout doesn't shift
                        const SizedBox(height: 54), // Rough height of button + padding
                      ]
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
