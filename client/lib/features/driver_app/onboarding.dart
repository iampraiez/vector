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
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _steps = [
    {
      'icon': Icons.directions_car_filled_rounded,
      'title': 'Optimize Every Route',
      'desc':
          'AI-powered algorithms calculate the most efficient delivery routes, saving you time and fuel costs instantly.',
      'color': const Color(0xFFF0FDF4),
      'accent': AppColors.primary,
    },
    {
      'icon': Icons.bolt_rounded,
      'title': 'Real-Time Updates',
      'desc':
          'Track your progress with precise GPS navigation and automatic route adjustments that adapt on the fly.',
      'color': const Color(0xFFEFF6FF),
      'accent': const Color(0xFF3B82F6),
    },
    {
      'icon': Icons.map_rounded,
      'title': 'Live Tracking',
      'desc':
          'Capture signatures and photos instantly. Keep detailed records for every successful delivery with ease.',
      'color': const Color(0xFFF5F3FF),
      'accent': const Color(0xFF8B5CF6),
    },
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: Stack(
        children: [
          // Background atmospheric glow
          AnimatedContainer(
            duration: const Duration(milliseconds: 600),
            curve: Curves.easeOutCubic,
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  (_steps[_currentPage]['accent'] as Color).withValues(
                    alpha: 0.08,
                  ),
                  AppColors.white,
                ],
                center: const Alignment(0, -0.2),
                radius: 1.0,
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                // Header (Skip)
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.p6,
                    vertical: AppSpacing.p4,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (_currentPage < _steps.length - 1)
                        GestureDetector(
                          onTap: () => context.go('/home'),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.transparent,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Text(
                              'Skip',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                                color: AppColors.textMuted,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    physics: const BouncingScrollPhysics(),
                    onPageChanged: (index) {
                      setState(() => _currentPage = index);
                    },
                    itemCount: _steps.length,
                    itemBuilder: (context, index) {
                      final step = _steps[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.p8,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Icon Illustration
                            TweenAnimationBuilder<double>(
                              duration: const Duration(milliseconds: 600),
                              tween: Tween(begin: 0.9, end: 1.0),
                              curve: Curves.elasticOut,
                              builder: (context, value, child) {
                                return Transform.scale(
                                  scale: value,
                                  child: child,
                                );
                              },
                              child: Container(
                                width: 180,
                                height: 180,
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: (step['accent'] as Color)
                                          .withValues(alpha: 0.1),
                                      blurRadius: 30,
                                      offset: const Offset(0, 15),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  step['icon'] as IconData,
                                  size: 72,
                                  color: step['accent'] as Color,
                                ),
                              ),
                            ),
                            const SizedBox(height: 60),
                            // Text Content
                            Text(
                              step['title'] as String,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -1.2,
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: 20),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                              ),
                              child: Text(
                                step['desc'] as String,
                                textAlign: TextAlign.center,
                                style: const TextStyle(
                                  fontSize: 16,
                                  color: AppColors.textSecondary,
                                  height: 1.6,
                                  fontFamily: 'Inter',
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Bottom Area
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 0, 24, 48),
                  child: Column(
                    children: [
                      // Indicators
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(_steps.length, (index) {
                          final isActive = index == _currentPage;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            height: 6,
                            width: isActive ? 24 : 6,
                            decoration: BoxDecoration(
                              color: isActive
                                  ? (_steps[_currentPage]['accent'] as Color)
                                  : const Color(0xFFE5E7EB),
                              borderRadius: BorderRadius.circular(10),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 32),

                      // Bottom Button
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 300),
                        child: _currentPage == _steps.length - 1
                            ? AppButton(
                                key: const ValueKey('start'),
                                label: 'Get Started',
                                isFullWidth: true,
                                onPressed: () => context.go('/home'),
                              )
                            : SizedBox(
                                width: double.infinity,
                                height: 52,
                                child: TextButton(
                                  onPressed: () {
                                    _pageController.nextPage(
                                      duration: const Duration(
                                        milliseconds: 500,
                                      ),
                                      curve: Curves.easeInOutCubic,
                                    );
                                  },
                                  child: Text(
                                    'Continue',
                                    style: TextStyle(
                                      color:
                                          _steps[_currentPage]['accent']
                                              as Color,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
