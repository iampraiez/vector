import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class DashboardSignUpScreen extends StatefulWidget {
  const DashboardSignUpScreen({super.key});

  @override
  State<DashboardSignUpScreen> createState() => _DashboardSignUpScreenState();
}

enum _Step { account, company, plan }

class _DashboardSignUpScreenState extends State<DashboardSignUpScreen> {
  _Step _step = _Step.account;
  bool _showPassword = false;
  bool _loading = false;

  String _fullName = '';
  String _email = '';
  String _password = '';
  String _companyName = '';
  String _companySize = '';
  String _plan = 'growth';

  final List<Map<String, dynamic>> _plans = [
    {
      'id': 'starter',
      'name': 'Starter',
      'price': '\$29/mo',
      'drivers': 'Up to 5 drivers',
      'highlight': false,
    },
    {
      'id': 'growth',
      'name': 'Growth',
      'price': '\$89/mo',
      'drivers': 'Up to 20 drivers',
      'highlight': true,
    },
    {
      'id': 'enterprise',
      'name': 'Enterprise',
      'price': 'Custom',
      'drivers': 'Unlimited drivers',
      'highlight': false,
    },
  ];

  bool get _emailValid =>
      RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(_email);
  bool get _step1Valid =>
      _fullName.trim().length >= 2 && _emailValid && _password.length >= 8;
  bool get _step2Valid =>
      _companyName.trim().length >= 2 && _companySize.isNotEmpty;

  void _handleNext() {
    if (_step == _Step.account && _step1Valid) {
      setState(() => _step = _Step.company);
    } else if (_step == _Step.company && _step2Valid) {
      setState(() => _step = _Step.plan);
    }
  }

  void _handleSubmit() async {
    setState(() => _loading = true);
    await Future.delayed(const Duration(milliseconds: 1800));
    if (mounted) {
      setState(() => _loading = false);
      context.go('/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    int currentStepIndex = _Step.values.indexOf(_step);

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
                border: Border(bottom: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  InkWell(
                    onTap: () => context.go('/'),
                    child: Row(
                      children: [
                        Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [AppColors.primary, Color(0xFF047857)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          alignment: Alignment.center,
                          child: const Icon(
                            Icons.local_shipping,
                            size: 16,
                            color: AppColors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Text(
                          'VECTOR',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.16,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => context.go('/'),
                    icon: const Icon(Icons.arrow_back, size: 14),
                    label: const Text('Back to home'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Main Content
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 40,
                  ),
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 480),
                    child: Column(
                      children: [
                        // Step Indicators
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _StepBubble(
                              num: 1,
                              label: 'Account',
                              isCurrent: _step == _Step.account,
                              isDone: currentStepIndex > 0,
                            ),
                            Container(
                              width: 60,
                              height: 2,
                              margin: const EdgeInsets.only(bottom: 20),
                              color: currentStepIndex > 0
                                  ? AppColors.primary
                                  : AppColors.border,
                            ),
                            _StepBubble(
                              num: 2,
                              label: 'Company',
                              isCurrent: _step == _Step.company,
                              isDone: currentStepIndex > 1,
                            ),
                            Container(
                              width: 60,
                              height: 2,
                              margin: const EdgeInsets.only(bottom: 20),
                              color: currentStepIndex > 1
                                  ? AppColors.primary
                                  : AppColors.border,
                            ),
                            _StepBubble(
                              num: 3,
                              label: 'Plan',
                              isCurrent: _step == _Step.plan,
                              isDone: currentStepIndex > 2,
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),

                        // Card
                        Container(
                          padding: const EdgeInsets.all(40),
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.border),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x0F000000),
                                offset: Offset(0, 4),
                                blurRadius: 24,
                              ),
                            ],
                          ),
                          child: _buildStepContent(),
                        ),

                        const SizedBox(height: 24),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              "Already have a fleet account? ",
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textMuted,
                              ),
                            ),
                            InkWell(
                              onTap: () => context.push('/dashboard/signin'),
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

                        Container(
                          margin: const EdgeInsets.only(top: 24),
                          padding: const EdgeInsets.only(top: 24),
                          decoration: const BoxDecoration(
                            border: Border(
                              top: BorderSide(color: AppColors.border),
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text(
                                "Are you a driver? ",
                                style: TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textHint,
                                ),
                              ),
                              InkWell(
                                onTap: () => context.go('/driver'),
                                child: const Text(
                                  'Go to driver app →',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_step) {
      case _Step.account:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Create your account',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.44,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              '14-day free trial. No credit card required.',
              style: TextStyle(fontSize: 14, color: AppColors.textMuted),
            ),
            const SizedBox(height: 28),

            _FieldLabel('Full name'),
            TextFormField(
              onChanged: (v) => setState(() => _fullName = v),
              decoration: _inputDeco(
                hint: 'Alex Rivera',
                icon: Icons.person_outline,
              ),
            ),
            const SizedBox(height: 16),

            _FieldLabel('Work email'),
            TextFormField(
              onChanged: (v) => setState(() => _email = v),
              keyboardType: TextInputType.emailAddress,
              decoration:
                  _inputDeco(
                    hint: 'you@company.com',
                    icon: Icons.email_outlined,
                  ).copyWith(
                    suffixIcon: _emailValid && _email.isNotEmpty
                        ? const Icon(
                            Icons.check_circle,
                            size: 16,
                            color: AppColors.success,
                          )
                        : null,
                    fillColor: _emailValid && _email.isNotEmpty
                        ? const Color(0xFFFAFFFE)
                        : AppColors.white,
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                      borderSide: BorderSide(
                        color: _emailValid && _email.isNotEmpty
                            ? AppColors.primary
                            : AppColors.border,
                        width: 1.5,
                      ),
                    ),
                  ),
            ),
            const SizedBox(height: 16),

            _FieldLabel('Password'),
            TextFormField(
              obscureText: !_showPassword,
              onChanged: (v) => setState(() => _password = v),
              decoration:
                  _inputDeco(
                    hint: 'Minimum 8 characters',
                    icon: Icons.lock_outline,
                  ).copyWith(
                    suffixIcon: IconButton(
                      icon: Icon(
                        _showPassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        size: 16,
                        color: AppColors.textMuted,
                      ),
                      onPressed: () =>
                          setState(() => _showPassword = !_showPassword),
                    ),
                  ),
            ),
            if (_password.isNotEmpty && _password.length < 8)
              const Padding(
                padding: EdgeInsets.only(top: 6),
                child: Text(
                  'Password must be at least 8 characters',
                  style: TextStyle(fontSize: 12, color: AppColors.error),
                ),
              ),
            const SizedBox(height: 28),

            _PrimaryBtn(
              label: 'Continue',
              icon: Icons.arrow_forward,
              enabled: _step1Valid,
              onTap: _handleNext,
            ),
          ],
        );

      case _Step.company:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => setState(() => _step = _Step.account),
                icon: const Icon(Icons.arrow_back, size: 13),
                label: const Text('Back'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textMuted,
                  padding: EdgeInsets.zero,
                  textStyle: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
            const Text(
              'Tell us about your fleet',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.44,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              "We'll personalise your dashboard setup.",
              style: TextStyle(fontSize: 14, color: AppColors.textMuted),
            ),
            const SizedBox(height: 28),

            _FieldLabel('Company name'),
            TextFormField(
              onChanged: (v) => setState(() => _companyName = v),
              decoration: _inputDeco(
                hint: 'Acme Deliveries Ltd',
                icon: Icons.domain,
              ),
            ),
            const SizedBox(height: 16),

            _FieldLabel('How many drivers do you have?'),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: ['1–3', '4–10', '11–25', '26–50', '50+'].map((size) {
                bool active = _companySize == size;
                return InkWell(
                  onTap: () => setState(() => _companySize = size),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 9,
                    ),
                    decoration: BoxDecoration(
                      color: active ? const Color(0xFFECFDF5) : AppColors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: active
                            ? AppColors.primary
                            : const Color(0x1A000000),
                        width: 1.5,
                      ),
                    ),
                    child: Text(
                      size,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: active
                            ? AppColors.primary
                            : AppColors.textSecondary,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 28),

            _PrimaryBtn(
              label: 'Continue',
              icon: Icons.arrow_forward,
              enabled: _step2Valid,
              onTap: _handleNext,
            ),
          ],
        );

      case _Step.plan:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => setState(() => _step = _Step.company),
                icon: const Icon(Icons.arrow_back, size: 13),
                label: const Text('Back'),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.textMuted,
                  padding: EdgeInsets.zero,
                  textStyle: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
            const Text(
              'Choose your plan',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.44,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Start free for 14 days, no card required.',
              style: TextStyle(fontSize: 14, color: AppColors.textMuted),
            ),
            const SizedBox(height: 28),

            ..._plans.map(
              (p) => _PlanCard(
                plan: p,
                isSelected: _plan == p['id'],
                onTap: () => setState(() => _plan = p['id'] as String),
              ),
            ),
            const SizedBox(height: 28),

            _PrimaryBtn(
              label: 'Launch my fleet dashboard',
              icon: Icons.arrow_forward,
              enabled: true,
              loading: _loading,
              onTap: _handleSubmit,
            ),

            Padding(
              padding: const EdgeInsets.only(top: 14),
              child: RichText(
                textAlign: TextAlign.center,
                text: const TextSpan(
                  text: 'By continuing you agree to our ',
                  style: TextStyle(fontSize: 12, color: AppColors.textHint),
                  children: [
                    TextSpan(
                      text: 'Terms',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    TextSpan(text: ' and '),
                    TextSpan(
                      text: 'Privacy Policy',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
    }
  }

  InputDecoration _inputDeco({required String hint, required IconData icon}) {
    return InputDecoration(
      hintText: hint,
      prefixIcon: Icon(icon, size: 16, color: AppColors.textHint),
      filled: true,
      fillColor: AppColors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.primary, width: 2),
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String label;
  const _FieldLabel(this.label);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 7),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Color(0xFF424242),
        ),
      ),
    );
  }
}

class _StepBubble extends StatelessWidget {
  final int num;
  final String label;
  final bool isCurrent, isDone;

  const _StepBubble({
    required this.num,
    required this.label,
    required this.isCurrent,
    required this.isDone,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isDone || isCurrent ? AppColors.primary : AppColors.white,
            shape: BoxShape.circle,
            border: Border.all(
              color: isDone || isCurrent
                  ? AppColors.primary
                  : const Color(0x1F000000),
              width: 2,
            ),
          ),
          alignment: Alignment.center,
          child: isDone
              ? const Icon(Icons.check, size: 14, color: AppColors.white)
              : Text(
                  '$num',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: isCurrent ? AppColors.white : AppColors.textHint,
                  ),
                ),
        ),
        const SizedBox(height: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isDone || isCurrent ? AppColors.primary : AppColors.textHint,
            letterSpacing: 0.4,
          ),
        ),
      ],
    );
  }
}

class _PrimaryBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool enabled;
  final bool loading;
  final VoidCallback onTap;

  const _PrimaryBtn({
    required this.label,
    required this.icon,
    required this.enabled,
    this.loading = false,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: enabled ? onTap : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primary,
        disabledBackgroundColor: const Color(0x0F000000),
        disabledForegroundColor: const Color(0xFFBDBDBD),
        padding: const EdgeInsets.all(13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        elevation: enabled ? 2 : 0,
      ),
      child: loading
          ? const SizedBox(
              width: 15,
              height: 15,
              child: CircularProgressIndicator(
                color: AppColors.white,
                strokeWidth: 2,
              ),
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(width: 8),
                Icon(icon, size: 15),
              ],
            ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final Map<String, dynamic> plan;
  final bool isSelected;
  final VoidCallback onTap;

  const _PlanCard({
    required this.plan,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF0FDF4) : AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0x1A000000),
            width: 1.5,
          ),
        ),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            if (plan['highlight'] == true)
              Positioned(
                top: -26,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: const Text(
                      'MOST POPULAR',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: AppColors.white,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ),
              ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan['name'],
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      plan['drivers'],
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                Row(
                  children: [
                    Text(
                      plan['price'],
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSelected
                              ? AppColors.primary
                              : const Color(0x26000000),
                          width: 2,
                        ),
                      ),
                      alignment: Alignment.center,
                      child: isSelected
                          ? Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.white,
                                shape: BoxShape.circle,
                              ),
                            )
                          : null,
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
