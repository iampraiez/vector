import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'widgets/dashboard_button.dart';

class DashboardSignInScreen extends StatefulWidget {
  const DashboardSignInScreen({super.key});

  @override
  State<DashboardSignInScreen> createState() => _DashboardSignInScreenState();
}

class _DashboardSignInScreenState extends State<DashboardSignInScreen> {
  String _email = '';
  String _password = '';
  bool _showPassword = false;
  bool _loading = false;
  String? _error;

  bool get _emailValid => RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_email);
  bool get _canSubmit => _emailValid && _password.length >= 8 && !_loading;

  void _handleSignIn() async {
    if (!_canSubmit) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    
    await Future.delayed(const Duration(milliseconds: 1500));
    
    if (mounted) {
      setState(() => _loading = false);
      context.go('/dashboard');
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
              decoration: const BoxDecoration(color: AppColors.white, border: Border(bottom: BorderSide(color: AppColors.border))),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                    onTap: () => context.go('/'),
                    child: Row(
                      children: [
                        Container(
                          width: 30, height: 30,
                          decoration: BoxDecoration(gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFF047857)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(8)),
                          alignment: Alignment.center,
                          child: const Icon(Icons.local_shipping, size: 16, color: AppColors.white),
                        ),
                        const SizedBox(width: 10),
                        const Text('VECTOR', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: -0.16, color: AppColors.textPrimary)),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => context.go('/'),
                    icon: const Icon(Icons.arrow_back, size: 14),
                    label: const Text('Back to home'),
                    style: TextButton.styleFrom(foregroundColor: AppColors.textSecondary, textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
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
                            color: AppColors.white, borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.border),
                            boxShadow: const [BoxShadow(color: Color(0x0F000000), offset: Offset(0, 4), blurRadius: 24)],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Header
                              Container(
                                width: 48, height: 48,
                                margin: const EdgeInsets.only(bottom: 20),
                                decoration: BoxDecoration(gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFF047857)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(14), boxShadow: const [BoxShadow(color: Color(0x40059669), offset: Offset(0, 4), blurRadius: 16)]),
                                alignment: Alignment.center,
                                child: const Icon(Icons.local_shipping, size: 24, color: AppColors.white),
                              ),
                              const Text('Fleet dashboard', textAlign: TextAlign.center, style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: -0.48, color: AppColors.textPrimary)),
                              const SizedBox(height: 6),
                              const Text('Sign in to manage your drivers and routes', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: AppColors.textMuted, height: 1.5)),
                              const SizedBox(height: 32),

                              if (_error != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                  margin: const EdgeInsets.only(bottom: 20),
                                  decoration: BoxDecoration(color: const Color(0xFFFEF2F2), borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0x33EF4444))),
                                  child: Text(_error!, style: const TextStyle(fontSize: 14, color: AppColors.error)),
                                ),

                              // Email
                              const Text('Work email', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF424242))),
                              const SizedBox(height: 8),
                              TextFormField(
                                onChanged: (val) => setState(() => _email = val),
                                onFieldSubmitted: (_) => _handleSignIn(),
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
                              const SizedBox(height: 16),

                              // Password
                              const Text('Password', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF424242))),
                              const SizedBox(height: 8),
                              TextFormField(
                                obscureText: !_showPassword,
                                onChanged: (val) => setState(() => _password = val),
                                onFieldSubmitted: (_) => _handleSignIn(),
                                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.bold),
                                  decoration: InputDecoration(
                                    hintText: 'Enter your password',
                                    hintStyle: const TextStyle(color: AppColors.textHint, fontWeight: FontWeight.normal),
                                    prefixIcon: const Icon(Icons.lock_outline, size: 16, color: AppColors.textHint),
                                    suffixIcon: IconButton(
                                      icon: Icon(_showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 16, color: AppColors.textMuted),
                                      onPressed: () => setState(() => _showPassword = !_showPassword),
                                    ),
                                    filled: true, fillColor: AppColors.white,
                                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border, width: 1.5)),
                                    focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
                                  ),
                              ),

                              Align(
                                alignment: Alignment.centerRight,
                                child: TextButton(
                                  onPressed: () => context.push('/dashboard/forgot-password'),
                                  style: TextButton.styleFrom(foregroundColor: AppColors.primary, textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                  child: const Text('Forgot password?'),
                                ),
                              ),
                              const SizedBox(height: 24),

                               DashboardButton(
                                 label: 'Sign in to dashboard',
                                 enabled: _canSubmit,
                                 loading: _loading,
                                 onTap: _handleSignIn,
                               ),
                            ],
                          ),
                        ),

                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text("Don't have a fleet account? ", style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                            InkWell(
                              onTap: () => context.push('/dashboard/signup'),
                              child: const Text('Create one free', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                            ),
                          ],
                        ),
                        
                        Container(
                          margin: const EdgeInsets.only(top: 32),
                          padding: const EdgeInsets.only(top: 28),
                          decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text("Are you a driver? ", style: TextStyle(fontSize: 13, color: AppColors.textHint)),
                              InkWell(
                                onTap: () => context.go('/signin'),
                                child: const Text('Sign in to the driver app →', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                              ),
                            ],
                          ),
                        )
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
}
