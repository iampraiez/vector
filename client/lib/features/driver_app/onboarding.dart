import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';

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
      'icon': Icons.local_shipping_outlined,
      'title': 'Optimize Every Route',
      'desc':
          'AI-powered algorithms calculate the most efficient delivery routes, saving you time and fuel costs instantly.',
      'color': const Color(0xFFE0F2F1),
      'accent': const Color(0xFF00BFA5),
    },
    {
      'icon': Icons.bolt_outlined,
      'title': 'Real-Time Updates',
      'desc':
          'Track your progress with precise GPS navigation and automatic route adjustments that adapt on the fly.',
      'color': const Color(0xFFECEFF1),
      'accent': const Color(0xFF607D8B),
    },
    {
      'icon': Icons.my_location_outlined,
      'title': 'Proof of Delivery',
      'desc':
          'Capture signatures and photos instantly. Keep detailed records for every successful delivery with ease.',
      'color': const Color(0xFFF3E5F5),
      'accent': const Color(0xFF9C27B0),
    },
    {
      'icon': Icons.security_outlined,
      'title': 'Built on Privacy',
      'desc':
          'Your delivery data is encrypted and secure. We prioritize your privacy at every step of the journey.',
      'color': const Color(0xFFE8EAF6),
      'accent': const Color(0xFF3F51B5),
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
            duration: const Duration(milliseconds: 800),
            curve: Curves.easeInOut,
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  _steps[_currentPage]['color'] as Color,
                  AppColors.white,
                ],
                center: const Alignment(0, -0.3),
                radius: 1.2,
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
                    vertical: AppSpacing.p2,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      GestureDetector(
                        onTap: () => context.go('/home'),
                        child: const Text(
                          'Skip',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
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
                              duration: const Duration(milliseconds: 800),
                              tween: Tween(begin: 0.8, end: 1.0),
                              builder: (context, value, child) {
                                return Transform.scale(
                                  scale: value,
                                  child: child,
                                );
                              },
                              child: Container(
                                width: 160,
                                height: 160,
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: (step['accent'] as Color)
                                          .withValues(alpha: 0.15),
                                      blurRadius: 40,
                                      offset: const Offset(0, 10),
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  step['icon'] as IconData,
                                  size: 64,
                                  color: step['accent'] as Color,
                                ),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p12),
                            // Text Content
                            Text(
                              step['title'] as String,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w900,
                                color: AppColors.textPrimary,
                                letterSpacing: -1,
                                height: 1.1,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p6),
                            Text(
                              step['desc'] as String,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 16,
                                color: AppColors.textSecondary,
                                height: 1.6,
                                fontFamily: 'Outfit',
                              ),
                            ),
                            if (index == _steps.length - 1) ...[
                              const SizedBox(height: AppSpacing.p10),
                              GestureDetector(
                                onTap: () => context.go('/home'),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 400),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 48,
                                    vertical: 18,
                                  ),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        _steps[_currentPage]['accent'] as Color,
                                        (_steps[_currentPage]['accent'] as Color)
                                            .withValues(alpha: 0.8),
                                      ],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(100),
                                    boxShadow: [
                                      BoxShadow(
                                        color: (_steps[_currentPage]['accent']
                                                as Color)
                                            .withValues(alpha: 0.3),
                                        blurRadius: 20,
                                        offset: const Offset(0, 10),
                                      ),
                                    ],
                                  ),
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        'Get Started',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w800,
                                          fontSize: 18,
                                          letterSpacing: -0.2,
                                        ),
                                      ),
                                      SizedBox(width: 12),
                                      Icon(
                                        Icons.chevron_right_rounded,
                                        color: Colors.white,
                                        size: 24,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Bottom Controls (Indicators only)
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.p8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_steps.length, (index) {
                      final isActive = index == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 400),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        height: 6,
                        width: isActive ? 32 : 6,
                        decoration: BoxDecoration(
                          color: isActive
                              ? (_steps[_currentPage]['accent'] as Color)
                              : AppColors.border,
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
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
