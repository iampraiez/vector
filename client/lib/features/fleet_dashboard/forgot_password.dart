import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'widgets/dashboard_button.dart';

class DashboardForgotPasswordScreen extends StatefulWidget {
  const DashboardForgotPasswordScreen({super.key});

  @override
  State<DashboardForgotPasswordScreen> createState() => _DashboardForgotPasswordScreenState();
}

class _DashboardForgotPasswordScreenState extends State<DashboardForgotPasswordScreen> {
  String _email = '';
  bool _loading = false;
  bool _submitted = false;

  bool get _emailValid => RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_email);
  bool get _canSubmit => _emailValid && !_loading;

  void _handleSubmit() async {
    if (!_canSubmit) return;
    setState(() => _loading = true);
    
    await Future.delayed(const Duration(milliseconds: 1500));
    
    if (mounted) {
      setState(() {
        _loading = false;
        _submitted = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: Column(
          children: [
            // Top Nav
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 32),
              decoration: const BoxDecoration(
                color: AppColors.white, 
                border: Border(bottom: BorderSide(color: AppColors.border))
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                    onTap: () => context.go('/'),
                    child: Row(
                      children: [
                        Container(
                          width: 30, height: 30,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, Color(0xFF047857)], 
                              begin: Alignment.topLeft, 
                              end: Alignment.bottomRight
                            ), 
                            borderRadius: BorderRadius.circular(8)
                          ),
                          alignment: Alignment.center,
                          child: const Icon(Icons.local_shipping, size: 16, color: AppColors.white),
                        ),
                        const SizedBox(width: 10),
                        const Text('VECTOR', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.16, color: AppColors.textPrimary)),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => context.push('/dashboard/signin'),
                    icon: const Icon(Icons.arrow_back, size: 14),
                    label: const Text('Back to sign in'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textSecondary, 
                      textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)
                    ),
                  )
                ],
              ),
            ),

            // Main Content
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 440),
                    child: Column(
                      children: [
                        // Card
                        Container(
                          padding: const EdgeInsets.all(40),
                          decoration: BoxDecoration(
                            color: AppColors.white, 
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.border),
                            boxShadow: const [BoxShadow(color: Color(0x0F000000), offset: Offset(0, 4), blurRadius: 24)],
                          ),
                          child: _submitted ? _buildSuccessState() : _buildFormState(),
                        ),

                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text("Remember your password? ", style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                            InkWell(
                              onTap: () => context.push('/dashboard/signin'),
                              child: const Text('Sign in', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildFormState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Header
        Container(
          width: 48, height: 48,
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppColors.primary, Color(0xFF047857)], 
              begin: Alignment.topLeft, 
              end: Alignment.bottomRight
            ), 
            borderRadius: BorderRadius.circular(14), 
            boxShadow: const [BoxShadow(color: Color(0x40059669), offset: Offset(0, 4), blurRadius: 16)]
          ),
          alignment: Alignment.center,
          child: const Icon(Icons.lock_reset_rounded, size: 24, color: AppColors.white),
        ),
        const Text('Forgot password', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.48, color: AppColors.textPrimary)),
        const SizedBox(height: 6),
        const Text("Enter your email and we'll send you a link to reset your password.", textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: AppColors.textMuted, height: 1.5)),
        const SizedBox(height: 32),

        // Email
        const Text('Work email', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF424242))),
        const SizedBox(height: 8),
        TextFormField(
          onChanged: (val) => setState(() => _email = val),
          onFieldSubmitted: (_) => _handleSubmit(),
          keyboardType: TextInputType.emailAddress,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            hintText: 'you@company.com',
            hintStyle: const TextStyle(color: AppColors.textHint, fontWeight: FontWeight.normal),
            prefixIcon: const Icon(Icons.email_outlined, size: 16, color: AppColors.textHint),
            suffixIcon: _emailValid && _email.isNotEmpty ? const Icon(Icons.check_circle, size: 16, color: AppColors.success) : null,
            filled: true, fillColor: _emailValid && _email.isNotEmpty ? const Color(0xFFFAFFFE) : AppColors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: _emailValid && _email.isNotEmpty ? AppColors.primary : AppColors.border, width: 1.5)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
          ),
        ),
        const SizedBox(height: 24),

        DashboardButton(
          label: 'Send reset link',
          enabled: _canSubmit,
          loading: _loading,
          onTap: _handleSubmit,
        ),
      ],
    );
  }

  Widget _buildSuccessState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          width: 48, height: 48,
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(14),
          ),
          alignment: Alignment.center,
          child: const Icon(Icons.mark_email_read_outlined, size: 24, color: AppColors.success),
        ),
        const Text('Check your email', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.48, color: AppColors.textPrimary)),
        const SizedBox(height: 12),
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: const TextStyle(fontSize: 14, color: AppColors.textMuted, height: 1.5),
            children: [
              const TextSpan(text: "We've sent a password reset link to\n"),
              TextSpan(text: _email, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
        ),
        const SizedBox(height: 32),
        DashboardButton(
          label: 'Back to sign in',
          onTap: () => context.push('/dashboard/signin'),
          backgroundColor: AppColors.surface,
          foregroundColor: AppColors.textPrimary,
        ),
        const SizedBox(height: 16),
        TextButton(
          onPressed: () => setState(() => _submitted = false),
          child: const Text("Didn't receive the email? Try again", style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
        ),
      ],
    );
  }
}
