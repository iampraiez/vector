import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';

class EmptyState extends StatelessWidget {
  final String title;
  final String message;
  final IconData? icon;
  final Widget? action;

  const EmptyState({
    super.key,
    required this.title,
    required this.message,
    this.icon,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.p8),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(
                icon,
                size: 48,
                color: AppColors.textHint,
              ),
              const SizedBox(height: AppSpacing.p4),
            ],
            Text(
              title,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    color: AppColors.textPrimary,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.p2),
            Text(
              message,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.textSecondary,
                  ),
              textAlign: TextAlign.center,
            ),
            if (action != null) ...[
              const SizedBox(height: AppSpacing.p6),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}
