import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/buttons.dart';

class FeatureItem {
  final IconData icon;
  final String title;
  final String desc;

  FeatureItem({required this.icon, required this.title, required this.desc});
}

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  int _activeFeature = 0;
  Timer? _timer;

  final List<FeatureItem> _features = [
    FeatureItem(
      icon: Icons.bolt,
      title: 'Optimised routes',
      desc: 'AI calculates the fastest path through all your stops.',
    ),
    FeatureItem(
      icon: Icons.location_on_outlined,
      title: 'Turn-by-turn nav',
      desc: 'Built-in navigation keeps you on track, even offline.',
    ),
    FeatureItem(
      icon: Icons.fact_check_outlined,
      title: 'Proof of delivery',
      desc: 'Capture photos and signatures at every stop.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 2800), (timer) {
      if (mounted) {
        setState(() {
          _activeFeature = (_activeFeature + 1) % _features.length;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
                  children: [
                    // Header
                    Container(
                      padding: const EdgeInsets.only(
                        left: AppSpacing.p6,
                        right: AppSpacing.p6,
                        top: AppSpacing.p6,
                        bottom: AppSpacing.p4,
                      ),
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(color: AppColors.divider),
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      color: AppColors.primary,
                                      borderRadius: BorderRadius.circular(
                                        AppSpacing.radiusSm,
                                      ),
                                    ),
                                    child: const Icon(
                                      Icons.local_shipping,
                                      size: 16,
                                      color: AppColors.white,
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.p2),
                                  const Text(
                                    'VECTOR',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.64, // 0.04em
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.p6),
                          RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.56,
                                color: AppColors.textPrimary,
                                height: 1.15,
                                fontFamily: 'Inter',
                              ),
                              children: [
                                TextSpan(text: 'Deliver more.\n'),
                                TextSpan(
                                  text: 'Stress less.',
                                  style: TextStyle(color: AppColors.primary),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: AppSpacing.p2),
                          const Text(
                            'Smart routing, turn-by-turn navigation, and proof of delivery — all in one app.',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textSecondary,
                              height: 1.5,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Features List
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(
                          AppSpacing.p5,
                          AppSpacing.p5,
                          AppSpacing.p5,
                          AppSpacing.p3,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              children: List.generate(_features.length, (
                                index,
                              ) {
                                final feature = _features[index];
                                final isActive = index == _activeFeature;
                                return GestureDetector(
                                  onTap: () =>
                                      setState(() => _activeFeature = index),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 250),
                                    margin: const EdgeInsets.only(
                                      bottom: AppSpacing.p2,
                                    ),
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: AppSpacing.p3,
                                      vertical: AppSpacing.p3,
                                    ),
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? AppColors.successLight
                                          : AppColors.surface,
                                      border: Border.all(
                                        color: isActive
                                            ? AppColors.primary.withValues(
                                                alpha: 0.2,
                                              )
                                            : AppColors.divider,
                                      ),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: Row(
                                      children: [
                                        AnimatedContainer(
                                          duration: const Duration(
                                            milliseconds: 250,
                                          ),
                                          width: 36,
                                          height: 36,
                                          decoration: BoxDecoration(
                                            color: isActive
                                                ? AppColors.successLight
                                                : const Color(0xFFF0F0F0),
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          child: Icon(
                                            feature.icon,
                                            size: 17,
                                            color: isActive
                                                ? AppColors.primary
                                                : AppColors.textHint,
                                          ),
                                        ),
                                        const SizedBox(width: AppSpacing.p3),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              AnimatedDefaultTextStyle(
                                                duration: const Duration(
                                                  milliseconds: 250,
                                                ),
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w700,
                                                  color: isActive
                                                      ? const Color(0xFF064E3B)
                                                      : AppColors.textPrimary,
                                                  fontFamily: 'Inter',
                                                ),
                                                child: Text(feature.title),
                                              ),
                                              const SizedBox(height: 2),
                                              Text(
                                                feature.desc,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  color: AppColors.textMuted,
                                                  height: 1.35,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                        if (isActive)
                                          const Icon(
                                            Icons.check_circle,
                                            size: 16,
                                            color: AppColors.primary,
                                          ),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                            ),
                            // Dots
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(_features.length, (
                                index,
                              ) {
                                final isActive = index == _activeFeature;
                                return GestureDetector(
                                  onTap: () =>
                                      setState(() => _activeFeature = index),
                                  child: AnimatedContainer(
                                    duration: const Duration(milliseconds: 300),
                                    margin: const EdgeInsets.symmetric(
                                      horizontal: 2.5,
                                    ),
                                    width: isActive ? 18 : 5,
                                    height: 5,
                                    decoration: BoxDecoration(
                                      color: isActive
                                          ? AppColors.primary
                                          : const Color(0xFFE0E0E0),
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // CTA
                    Container(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.p5,
                        AppSpacing.p3,
                        AppSpacing.p5,
                        AppSpacing.p8,
                      ),
                      decoration: const BoxDecoration(
                        color: AppColors.white,
                        border: Border(
                          top: BorderSide(color: AppColors.divider),
                        ),
                      ),
                      child: Column(
                        children: [
                          AppButton(
                            label: 'Create driver account',
                            isFullWidth: true,
                            icon: const Icon(Icons.arrow_forward, size: 15),
                            onPressed: () => context.push('/signup'),
                          ),
                          const SizedBox(height: AppSpacing.p2),
                          AppButton(
                            label: 'I already have an account',
                            variant: ButtonVariant.outline,
                            isFullWidth: true,
                            onPressed: () => context.push('/signin'),
                          ),
                          const SizedBox(height: AppSpacing.p2),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                'Fleet owner? ',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textHint,
                                ),
                              ),
                              GestureDetector(
                                onTap: () => context.go('/'),
                                child: const Text(
                                  'Go to the dashboard →',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.primary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
