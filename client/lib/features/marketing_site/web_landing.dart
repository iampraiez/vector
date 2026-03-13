import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';

class WebLandingScreen extends StatelessWidget {
  const WebLandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Vector'),
        backgroundColor: AppColors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Hero Section
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p4, vertical: AppSpacing.p16),
              alignment: Alignment.center,
              child: Column(
                children: [
                  Text(
                    'Smart Route Optimization App',
                    style: Theme.of(context).textTheme.displayLarge,
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.p4),
                  Text(
                    'Optimize your delivery routes with smart planning.',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.p8),
                  // TODO: Add call to action buttons
                ],
              ),
            ),
            // Features Section
            // TODO: Extract and translate features
            const SizedBox(height: AppSpacing.p16),
          ],
        ),
      ),
    );
  }
}
