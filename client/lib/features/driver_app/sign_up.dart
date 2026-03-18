import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:client/core/theme/colors.dart';
import 'package:client/core/theme/spacing.dart';
import 'package:country_picker/country_picker.dart';
import 'package:client/main.dart';
import 'package:client/shared/widgets/inputs.dart';
import 'package:client/shared/widgets/buttons.dart';
import 'package:client/core/services/auth_service.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final TextEditingController _companyCodeController = TextEditingController();
  final TextEditingController _fullNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  // nigeria by default
  String _selectedCountryFlag = '🇳🇬';
  String _selectedCountryCode = '234';

  String? _companyCodeError;
  String? _fullNameError;
  String? _emailError;
  String? _phoneError;
  String? _passwordError;
  String? _confirmPasswordError;

  bool _loading = false;
  bool _isCheckingCompanyCode = false;
  bool? _companyCodeValid;

  // To prevent multiple concurrent validations
  int _validationCounter = 0;

  @override
  void dispose() {
    _companyCodeController.dispose();
    _fullNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _validate() {
    setState(() {
      _companyCodeError = _companyCodeController.text.isEmpty
          ? 'Company code is required'
          : null;
      if (_companyCodeValid == false) {
        _companyCodeError = 'Invalid company code';
      }
      _fullNameError = _fullNameController.text.isEmpty
          ? 'Full name is required'
          : null;

      final email = _emailController.text;
      if (email.isEmpty) {
        _emailError = 'Email is required';
      } else if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
        _emailError = 'Enter a valid email address';
      } else {
        _emailError = null;
      }

      _phoneError = _phoneController.text.isEmpty
          ? 'Phone number is required'
          : null;

      final password = _passwordController.text;
      if (password.isEmpty) {
        _passwordError = 'Password is required';
      } else if (password.length < 8) {
        _passwordError = 'Password must be at least 8 characters';
      } else {
        _passwordError = null;
      }

      if (_confirmPasswordController.text.isEmpty) {
        _confirmPasswordError = 'Confirm your password';
      } else if (_confirmPasswordController.text != _passwordController.text) {
        _confirmPasswordError = 'Passwords do not match';
      } else {
        _confirmPasswordError = null;
      }
    });
  }

  bool get _isValid =>
      _companyCodeError == null &&
      _fullNameError == null &&
      _emailError == null &&
      _phoneError == null &&
      _passwordError == null &&
      _confirmPasswordError == null &&
      _companyCodeController.text.isNotEmpty &&
      _fullNameController.text.isNotEmpty &&
      _emailController.text.isNotEmpty &&
      _phoneController.text.isNotEmpty &&
      _passwordController.text.isNotEmpty &&
      _confirmPasswordController.text.isNotEmpty;

  void _onCompanyCodeChanged(String value) async {
    if (value.length < 3) {
      setState(() {
        _companyCodeValid = null;
        _isCheckingCompanyCode = false;
        _companyCodeError = null;
      });
      return;
    }

    setState(() => _isCheckingCompanyCode = true);

    final currentCounter = ++_validationCounter;

    try {
      // Small debounce of 500ms
      await Future.delayed(const Duration(milliseconds: 500));
      if (!mounted || currentCounter != _validationCounter) return;

      final result = await AuthService.instance.validateCompanyCode(value);
      
      if (mounted && currentCounter == _validationCounter) {
        setState(() {
          _isCheckingCompanyCode = false;
          _companyCodeValid = result['valid'] == true;
          if (_companyCodeValid!) {
            _companyCodeError = null;
          } else {
            _companyCodeError = 'Invalid company code';
          }
        });
      }
    } catch (e) {
      if (mounted && currentCounter == _validationCounter) {
        setState(() {
          _isCheckingCompanyCode = false;
          _companyCodeValid = false;
          _companyCodeError = 'Error validating code';
        });
      }
    }
  }

  void _handleSignUp() async {
    _validate();
    if (!_isValid || _loading || _companyCodeValid != true) {
      if (_companyCodeValid == false) {
        setState(() => _companyCodeError = 'Please enter a valid company code');
      }
      return;
    }

    setState(() => _loading = true);
    try {
      await AuthScope.of(context).signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
        name: _fullNameController.text.trim(),
        phone: '+$_selectedCountryCode${_phoneController.text.trim()}',
        companyCode: _companyCodeController.text.trim(),
      );
      if (mounted) {
        context.push('/verify-email?email=${_emailController.text}');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _loading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: AppColors.error,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showPicker() {
    showCountryPicker(
      context: context,
      showPhoneCode: true,
      onSelect: (Country country) {
        setState(() {
          _selectedCountryFlag = country.flagEmoji;
          _selectedCountryCode = country.phoneCode;
        });
      },
      countryListTheme: CountryListThemeData(
        backgroundColor: AppColors.white,
        textStyle: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
        searchTextStyle: const TextStyle(
          fontSize: 14,
          color: AppColors.textPrimary,
        ),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
        inputDecoration: InputDecoration(
          hintText: 'Search country',
          hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 14),
          prefixIcon: const Icon(
            Icons.search,
            size: 20,
            color: AppColors.textHint,
          ),
          filled: true,
          fillColor: const Color(0xFFF8FAF9),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0x1A000000)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0x1A000000)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: AppColors.primary),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.p5),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: constraints.maxHeight,
                  maxWidth: 480,
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: AppSpacing.p6),
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 28,
                            height: 28,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
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
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.72,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Content
                      Container(
                        padding: const EdgeInsets.all(AppSpacing.p6),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.divider),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x0A000000),
                              blurRadius: 24,
                              offset: Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Text(
                              'Create driver account',
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.48,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p1),
                            const Text(
                              'Join your fleet and start delivering',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p6),

                            AppTextField(
                              label: 'Company Code',
                              hintText: 'e.g. ACM-2026',
                              controller: _companyCodeController,
                              prefixIcon: const Icon(
                                Icons.storefront_outlined,
                                size: 16,
                                color: AppColors.textHint,
                              ),
                              onChanged: _onCompanyCodeChanged,
                              suffixIcon: _isCheckingCompanyCode
                                  ? const Padding(
                                      padding: EdgeInsets.all(12),
                                      child: SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    )
                                  : null,
                              errorText: _companyCodeError == 'Invalid company code'
                                  ? null
                                  : _companyCodeError,
                            ),
                            if (_companyCodeValid != null && !_isCheckingCompanyCode)
                              Padding(
                                padding: const EdgeInsets.only(top: 8, left: 4),
                                child: Row(
                                  children: [
                                    Icon(
                                      _companyCodeValid!
                                          ? Icons.check_circle
                                          : Icons.error,
                                      size: 14,
                                      color: _companyCodeValid!
                                          ? AppColors.success
                                          : AppColors.error,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _companyCodeValid!
                                          ? 'Valid company code'
                                          : 'Invalid company code',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: _companyCodeValid!
                                            ? AppColors.success
                                            : AppColors.error,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            else if (!_isCheckingCompanyCode)
                              const Padding(
                                padding: EdgeInsets.only(
                                  top: AppSpacing.p1,
                                  left: AppSpacing.p1,
                                ),
                                child: Text(
                                  'Ask your fleet manager for this code',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textHint,
                                  ),
                                ),
                              ),
                            const SizedBox(height: AppSpacing.p4),

                            Row(
                              children: [
                                const Expanded(child: Divider()),
                                Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.p2,
                                  ),
                                  child: Text(
                                    'YOUR DETAILS',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textHint,
                                      letterSpacing: 0.44,
                                    ),
                                  ),
                                ),
                                const Expanded(child: Divider()),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.p4),

                            AppTextField(
                              label: 'Full Name',
                              hintText: 'Alex Rivera',
                              controller: _fullNameController,
                              prefixIcon: const Icon(
                                Icons.person_outline,
                                size: 16,
                                color: AppColors.textHint,
                              ),
                              errorText: _fullNameError,
                            ),
                            const SizedBox(height: AppSpacing.p4),

                            AppTextField(
                              label: 'Email Address',
                              hintText: 'alex@example.com',
                              controller: _emailController,
                              prefixIcon: const Icon(
                                Icons.email_outlined,
                                size: 16,
                                color: AppColors.textHint,
                              ),
                              keyboardType: TextInputType.emailAddress,
                              errorText: _emailError,
                            ),
                            const SizedBox(height: AppSpacing.p4),

                            PhoneInputField(
                              label: 'Phone Number',
                              controller: _phoneController,
                              errorText: _phoneError,
                              selectedCountryFlag: _selectedCountryFlag,
                              selectedCountryCode: _selectedCountryCode,
                              onCountryTap: _showPicker,
                              prefixIcon: const Icon(
                                Icons.phone_outlined,
                                size: 16,
                                color: AppColors.textHint,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.p4),

                            AppTextField(
                              label: 'Password',
                              hintText: 'Minimum 8 characters',
                              controller: _passwordController,
                              prefixIcon: const Icon(
                                Icons.lock_outline,
                                size: 16,
                                color: AppColors.textHint,
                              ),
                              isPassword: true,
                              errorText: _passwordError,
                            ),
                            const SizedBox(height: AppSpacing.p4),

                            AppTextField(
                              label: 'Confirm Password',
                              hintText: 'Repeat your password',
                              controller: _confirmPasswordController,
                              prefixIcon: const Icon(
                                Icons.lock_outline,
                                size: 16,
                                color: AppColors.textHint,
                              ),
                              isPassword: true,
                              errorText: _confirmPasswordError,
                            ),
                            const SizedBox(height: AppSpacing.p6),

                            AppButton(
                              label: 'Create driver account',
                              isFullWidth: true,
                              isLoading: _loading,
                              onPressed: _handleSignUp,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.p5),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Text(
                            'Already have an account? ',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.textMuted,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => context.push('/signin'),
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
                      const SizedBox(height: AppSpacing.p8),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
