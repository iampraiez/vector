import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';

enum ButtonVariant { primary, secondary, outline, ghost }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool isLoading;
  final Widget? icon;
  final bool isFullWidth;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.isLoading = false,
    this.icon,
    this.isFullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    Widget buttonChild = Center(
      child: isLoading
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2.5,
                color: AppColors.white,
              ),
            )
          : Row(
              mainAxisSize: isFullWidth ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null)
                  Padding(
                    padding: const EdgeInsets.only(right: AppSpacing.p2),
                    child: icon!,
                  ),
                Text(
                  label,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
    );

    ButtonStyle style;
    const buttonPadding = EdgeInsets.symmetric(horizontal: AppSpacing.p4, vertical: 16);
    final buttonShape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppSpacing.radiusMd));
    final minimumSize = isFullWidth ? const Size.fromHeight(52) : null;

    switch (variant) {
      case ButtonVariant.primary:
        style = ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.white,
          elevation: 0,
          padding: buttonPadding,
          shape: buttonShape,
          minimumSize: minimumSize,
        );
        return ElevatedButton(onPressed: isLoading ? null : onPressed, style: style, child: buttonChild);
      
      case ButtonVariant.secondary:
        style = ElevatedButton.styleFrom(
          backgroundColor: AppColors.surface,
          foregroundColor: AppColors.textPrimary,
          elevation: 0,
          padding: buttonPadding,
          shape: buttonShape,
          minimumSize: minimumSize,
        );
        return ElevatedButton(onPressed: isLoading ? null : onPressed, style: style, child: buttonChild);

      case ButtonVariant.outline:
        style = OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          side: const BorderSide(color: AppColors.border),
          padding: buttonPadding,
          shape: buttonShape,
          minimumSize: minimumSize,
        );
        return OutlinedButton(onPressed: isLoading ? null : onPressed, style: style, child: buttonChild);

      case ButtonVariant.ghost:
        style = TextButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          padding: buttonPadding,
          shape: buttonShape,
          minimumSize: minimumSize,
        );
        return TextButton(onPressed: isLoading ? null : onPressed, style: style, child: buttonChild);
    }
  }
}
