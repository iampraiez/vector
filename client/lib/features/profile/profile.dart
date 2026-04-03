import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'package:client/main.dart';
import '../../widgets/bottom_nav.dart';
import '../../core/services/driver_api_service.dart';
import '../../core/services/offline_service.dart';

import '../../widgets/offline_banner.dart';
import 'dart:convert';
import 'package:url_launcher/url_launcher.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _api = DriverApiService.instance;
  late TextEditingController _nameCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _phoneCtrl;
  late TextEditingController _vTypeCtrl;
  late TextEditingController _vMakeCtrl;
  late TextEditingController _vModelCtrl;
  late TextEditingController _vPlateCtrl;
  late TextEditingController _vColorCtrl;
  late TextEditingController _licenseCtrl;
  bool _isSavingVehicle = false;
  bool _isSavingProfile = false;
  bool _updating = false;
  bool _requestingOtp = false;

  int _totalDeliveries = 0;
  double _rating = 0.0;
  bool _statsLoading = true;
  bool _isInitialized = false;
  String? _fleetName;
  String? _fleetCode;
  String? _memberSince;
  String? _currency;
  double? _pricePerKm;
  bool _isOffline = false;
  static const String _cacheKey = 'driver_profile_cache';
  static const int _cacheTtlMs = 3600000; // 1 hour

  @override
  void initState() {
    super.initState();
    _fetchLiveStats();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final user = AuthScope.of(context).user;
      _nameCtrl = TextEditingController(text: user?.name);
      _emailCtrl = TextEditingController(text: user?.email);
      _phoneCtrl = TextEditingController(text: user?.phone ?? '');
      _vTypeCtrl = TextEditingController(text: user?.vehicleType);
      _vMakeCtrl = TextEditingController(text: user?.vehicleMake);
      _vModelCtrl = TextEditingController(text: user?.vehicleModel);
      _vPlateCtrl = TextEditingController(text: user?.vehiclePlate);
      _vColorCtrl = TextEditingController(text: user?.vehicleColor);
      _licenseCtrl = TextEditingController(text: user?.licenseNumber);
      _isInitialized = true;
    }
  }

  Future<void> _handleLeaveFleet() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Leave Fleet?'),
        content: const Text(
            'Are you sure you want to disconnect from this fleet? You will need an OTP to confirm.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Continue')),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _requestingOtp = true);
    try {
      await DriverApiService.instance.requestSettingsOtp('leave_fleet');
      if (mounted) {
        final otp = await _showOtpDialog();
        if (otp != null) {
          await DriverApiService.instance.verifySettingsOtp(
              'leave_fleet', otp);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Successfully left the fleet.')));
            AuthScope.of(context).logout(); // For now, logout to reset state
          }
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error: $e')));
      }
    } finally {
      if (mounted) setState(() => _requestingOtp = false);
    }
  }

  Future<void> _handleSwitchFleet() async {
    final code = await _showSwitchFleetDialog();
    if (code == null || code.isEmpty) return;
    if (!mounted) return;

    setState(() => _updating = true);
    try {
      await AuthScope.of(context).joinCompany(code);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Joined new fleet successfully!')));
        context.go('/onboarding'); // Redirect to onboarding for new fleet
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text('Error joining fleet: $e')));
      }
    } finally {
      if (mounted) setState(() => _updating = false);
    }
  }

  Future<String?> _showOtpDialog() async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Enter OTP'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('A verification code has been sent to your email.'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                  hintText: '6-digit code', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('Verify')),
        ],
      ),
    );
  }

  Future<String?> _showSwitchFleetDialog() async {
    final controller = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Switch Fleet'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
                'Enter the company code of the new fleet you want to join.'),
            const SizedBox(height: 16),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                  hintText: 'Company Code', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, controller.text),
              child: const Text('Switch')),
        ],
      ),
    );
  }

  Future<void> _fetchLiveStats() async {
    // Try live data first
    try {
      final profile = await _api.getProfile();
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_cacheKey, jsonEncode({
        'ts': DateTime.now().millisecondsSinceEpoch,
        'data': profile,
      }));
      
      if (mounted) {
        _applyProfileData(profile);
        setState(() {
          _statsLoading = false;
          _isOffline = false;
        });
      }
      return;
    } catch (_) {}

    // Fallback to cache
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_cacheKey);
      if (raw != null) {
        final cached = jsonDecode(raw) as Map<String, dynamic>;
        final ts = cached['ts'] as int;
        if (DateTime.now().millisecondsSinceEpoch - ts < _cacheTtlMs) {
          if (mounted) {
            _applyProfileData(cached['data'] as Map<String, dynamic>);
            setState(() {
              _statsLoading = false;
              _isOffline = true;
            });
          }
          return;
        }
      }
    } catch (_) {}

    if (mounted) setState(() => _statsLoading = false);
  }

  void _applyProfileData(Map<String, dynamic> profile) {
    _totalDeliveries = (profile['deliveries'] as num?)?.toInt() ?? 0;
    _rating = (profile['rating'] as num?)?.toDouble() ?? 0.0;
    _fleetName = profile['fleet_name'] as String?;
    _fleetCode = profile['fleet_code'] as String?;
    _currency = profile['currency'] as String? ?? 'USD';
    _pricePerKm = (profile['price_per_km'] as num?)?.toDouble();
    // Parse joined date
    final raw = profile['joined_at'] as String?
        ?? profile['created_at'] as String?;
    if (raw != null) {
      try {
        final dt = DateTime.parse(raw);
        _memberSince = '${_monthName(dt.month)} ${dt.year}';
      } catch (_) {}
    }
  }

  String _monthName(int m) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[(m - 1).clamp(0, 11)];
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _vTypeCtrl.dispose();
    _vMakeCtrl.dispose();
    _vModelCtrl.dispose();
    _vPlateCtrl.dispose();
    _vColorCtrl.dispose();
    _licenseCtrl.dispose();
    super.dispose();
  }

  Future<void> _saveVehicleInfo() async {
    if (await OfflineService.instance.checkAndShowOfflineSnackBar(context)) return;
    if (!mounted) return;
    setState(() => _isSavingVehicle = true);
    try {
      if (!context.mounted) return;
      await AuthScope.of(context).updateDriverProfile({
        'vehicle_type': _vTypeCtrl.text.trim(),
        'vehicle_make': _vMakeCtrl.text.trim(),
        'vehicle_model': _vModelCtrl.text.trim(),
        'vehicle_plate': _vPlateCtrl.text.trim(),
        'vehicle_color': _vColorCtrl.text.trim(),
        'license_number': _licenseCtrl.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vehicle profile updated successfully')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isSavingVehicle = false);
    }
  }

  Future<void> _saveProfileInfo() async {
    if (await OfflineService.instance.checkAndShowOfflineSnackBar(context)) return;
    if (!mounted) return;
    setState(() => _isSavingProfile = true);
    try {
      if (!context.mounted) return;
      await AuthScope.of(context).updateDriverProfile({
        'full_name': _nameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
      });
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Profile updated successfully')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      if (mounted) setState(() => _isSavingProfile = false);
    }
  }

  void _openEditSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          left: 24, right: 24, top: 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Edit Profile', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                IconButton(
                  icon: const Icon(Icons.close, size: 20),
                  onPressed: () => Navigator.pop(ctx),
                  style: IconButton.styleFrom(backgroundColor: const Color(0xFFF5F5F5)),
                )
              ]
            ),
            const SizedBox(height: 24),
            _EditField(controller: _nameCtrl, hint: 'Full Name', icon: Icons.person_outline),
            const SizedBox(height: 16),
            _EditField(controller: _emailCtrl, hint: 'Email Address', icon: Icons.email_outlined),
            const SizedBox(height: 16),
            _EditField(controller: _phoneCtrl, hint: 'Phone Number', icon: Icons.phone_outlined),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isSavingProfile ? null : () async {
                setState(() => _isSavingProfile = true);
                await _saveProfileInfo();
                setState(() => _isSavingProfile = false);
                if (ctx.mounted) Navigator.pop(ctx);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: _isSavingProfile
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Save Changes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _openVehicleEditSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModalState) => Container(
          decoration: const BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            left: 24, right: 24, top: 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Vehicle Information', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.pop(ctx),
                    style: IconButton.styleFrom(backgroundColor: const Color(0xFFF5F5F5)),
                  )
                ]
              ),
              const SizedBox(height: 24),
              _EditField(controller: _vTypeCtrl, hint: 'Vehicle Type (e.g. Van)', icon: Icons.type_specimen_outlined),
              const SizedBox(height: 16),
              _EditField(controller: _vMakeCtrl, hint: 'Vehicle Make (e.g. Toyota)', icon: Icons.branding_watermark_outlined),
              const SizedBox(height: 16),
              _EditField(controller: _vModelCtrl, hint: 'Vehicle Model (e.g. Hiace)', icon: Icons.directions_car_outlined),
              const SizedBox(height: 16),
              _EditField(controller: _vPlateCtrl, hint: 'License Plate (e.g. ABC-123)', icon: Icons.pin_outlined),
              const SizedBox(height: 16),
              _EditField(controller: _vColorCtrl, hint: 'Vehicle Color', icon: Icons.color_lens_outlined),
              const SizedBox(height: 16),
              _EditField(controller: _licenseCtrl, hint: 'Driver License Number', icon: Icons.badge_outlined),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSavingVehicle ? null : () async {
                  setModalState(() => _isSavingVehicle = true);
                  await _saveVehicleInfo();
                  setModalState(() => _isSavingVehicle = false);
                  if (ctx.mounted) Navigator.pop(ctx);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: _isSavingVehicle 
                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Save Vehicle Details', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthScope.of(context).user;
    final String name = user?.name ?? 'Driver';
    final String email = user?.email ?? '';
    final String initials = name.isNotEmpty 
        ? name.split(' ').map((n) => n.isNotEmpty ? n[0] : '').take(2).join('')
        : 'D';

    final bool hasVehicleInfo = user?.vehiclePlate != null && user!.vehiclePlate!.isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.white,
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: Column(
          children: [
            OfflineBanner(apiOffline: _isOffline),
            
            // Header
            Container(
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
              decoration: BoxDecoration(
                color: AppColors.white,
                border: const Border(bottom: BorderSide(color: AppColors.border)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    offset: const Offset(0, 4),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Profile', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.6, color: AppColors.textPrimary)),
                      SizedBox(height: 2),
                      Text('Account & preferences', style: TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w500)),
                    ],
                  ),
                  InkWell(
                    onTap: () {
                      _nameCtrl.text = name;
                      _emailCtrl.text = email;
                      _openEditSheet();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
                      child: const Icon(Icons.edit_outlined, size: 16, color: AppColors.primary),
                    ),
                  )
                ],
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Profile Card
                  Container(
                    decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Row(
                            children: [
                              Container(
                                width: 60, height: 60,
                                decoration: const BoxDecoration(shape: BoxShape.circle, gradient: LinearGradient(colors: [AppColors.primary, Color(0xFF34D399)], begin: Alignment.topLeft, end: Alignment.bottomRight)),
                                alignment: Alignment.center,
                                child: Text(initials, style: const TextStyle(color: AppColors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.5)),
                                    const SizedBox(height: 6),
                                    Row(
                                      children: [
                                        const Icon(Icons.email_outlined, size: 15, color: AppColors.textMuted),
                                        const SizedBox(width: 8),
                                        Expanded(child: Text(email, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                      ]
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Icon(Icons.phone_outlined, size: 15, color: AppColors.textMuted),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            (user?.phone != null && user!.phone!.isNotEmpty)
                                                ? user.phone!
                                                : 'No phone number added',
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: (user?.phone != null && user!.phone!.isNotEmpty)
                                                  ? AppColors.textSecondary
                                                  : AppColors.textHint,
                                              fontStyle: (user?.phone != null && user!.phone!.isNotEmpty)
                                                  ? FontStyle.normal
                                                  : FontStyle.italic,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              )
                            ],
                          ),
                        ),
                        const Divider(height: 1),
                        Row(
                          children: [
                            Expanded(child: _ProfileStat(label: 'Deliveries', value: _statsLoading ? '--' : '$_totalDeliveries')),
                            Container(width: 1, height: 40, color: AppColors.border),
                            Expanded(child: _ProfileStat(
                              label: 'Member since',
                              value: _statsLoading ? '--' : (_memberSince ?? 'Driver'),
                            )),
                            Container(width: 1, height: 40, color: AppColors.border),
                            Expanded(child: _ProfileStat(label: 'Rating', value: _statsLoading ? '--' : (_rating > 0 ? _rating.toStringAsFixed(1) : '5.0'), icon: Icons.star)),
                          ],
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Fleet Info
                  if (_fleetName != null || !_statsLoading)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.primary, AppColors.primary.withValues(alpha: 0.85)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('FLEET', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white54, letterSpacing: 0.5)),
                                const SizedBox(height: 4),
                                Text(
                                  _fleetName ?? 'No fleet assigned',
                                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (_fleetCode != null) ...[
                                  const SizedBox(height: 2),
                                  Text('Code: $_fleetCode', style: const TextStyle(fontSize: 12, color: Colors.white54)),
                                ],
                              ],
                            ),
                          ),
                          if (_fleetName != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 7, height: 7,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFA7F3D0),
                                      shape: BoxShape.circle,
                                      boxShadow: [BoxShadow(color: const Color(0xFFA7F3D0).withValues(alpha: 0.5), spreadRadius: 2)],
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Text('Enrolled', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Rates Info
                  if (_currency != null && _pricePerKm != null)
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF9FAFB),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40, height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.1),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.payments_outlined, color: AppColors.primary, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Fleet Earnings Rate', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.5)),
                                const SizedBox(height: 2),
                                Text(
                                  '$_currency ${_pricePerKm!.toStringAsFixed(2)} / KM',
                                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 16),

                  // Menus
                  _SectionCard(
                    label: 'Account',
                    children: [
                      _MenuItem(icon: Icons.notifications_none, label: 'Notifications', sub: 'Push, email, SMS', onTap: () => context.push('/notifications')),
                    ],
                  ),
                  const SizedBox(height: 16),

                  _SectionCard(
                    label: 'Vehicle Information',
                    children: [
                      if (!hasVehicleInfo)
                        Container(
                          margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          decoration: BoxDecoration(
                            color: const Color(0xFFFFFBEB),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFFEF3C7)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.info_outline, size: 16, color: Color(0xFFD97706)),
                              const SizedBox(width: 10),
                              const Expanded(
                                child: Text(
                                  'Complete your vehicle profile to help managers track assets efficiently.',
                                  style: TextStyle(fontSize: 12, color: Color(0xFF92400E), fontWeight: FontWeight.w500),
                                ),
                              ),
                            ],
                          ),
                        ),
                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            if (hasVehicleInfo) ...[
                              _VehicleSummaryRow(icon: Icons.directions_car_outlined, label: 'Vehicle', value: '${user.vehicleMake} ${user.vehicleModel}'),
                              const SizedBox(height: 12),
                              _VehicleSummaryRow(icon: Icons.pin_outlined, label: 'Plate Number', value: user.vehiclePlate!),
                            ] else
                              const Text(
                                'No vehicle information provided yet.',
                                style: TextStyle(fontSize: 14, color: AppColors.textMuted),
                              ),
                            const SizedBox(height: 20),
                            SizedBox(
                              width: double.infinity,
                              child: OutlinedButton(
                                onPressed: _openVehicleEditSheet,
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 14),
                                  side: const BorderSide(color: AppColors.border),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                child: Text(
                                  hasVehicleInfo ? 'Edit Vehicle Details' : 'Add Vehicle Details',
                                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  _SectionCard(
                    label: 'Support',
                    children: [
                      _MenuItem(
                        icon: Icons.help_outline,
                        label: 'Help Centre',
                        sub: 'FAQs and guides',
                        onTap: () async {
                          final Uri emailUri = Uri(
                            scheme: 'mailto',
                            path: 'support@vectorapp.io',
                            queryParameters: {
                              'subject': 'Help Request – Vector Driver App',
                            },
                          );
                          try {
                            if (await canLaunchUrl(emailUri)) {
                              await launchUrl(emailUri);
                            } else {
                              throw 'Could not launch $emailUri';
                            }
                          } catch (_) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Could not open mail app. Please email support@vectorapp.io')),
                              );
                            }
                          }
                        },
                      ),
                      const Divider(height: 1, indent: 66),
                      _MenuItem(icon: Icons.security, label: 'Privacy & Security', sub: 'Manage your data', onTap: () => context.push('/settings')),
                    ],
                  ),
                  const SizedBox(height: 16),

                  _SectionCard(
                    label: 'Fleet Management',
                    children: [
                      _MenuItem(
                        icon: Icons.swap_horiz_rounded,
                        label: 'Switch Fleet',
                        sub: 'Join another company roster',
                        onTap: (_updating || RouteProgressScope.of(context).hasActiveRoute) ? null : _handleSwitchFleet,
                        enabled: !RouteProgressScope.of(context).hasActiveRoute,
                      ),
                      const Divider(height: 1, indent: 66),
                      _MenuItem(
                        icon: Icons.exit_to_app_rounded,
                        label: 'Leave Current Fleet',
                        sub: 'Disconnect from ${_fleetName ?? 'Company'}',
                        onTap: (_requestingOtp || RouteProgressScope.of(context).hasActiveRoute) ? null : _handleLeaveFleet,
                        enabled: !RouteProgressScope.of(context).hasActiveRoute,
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  InkWell(
                    onTap: () => AuthScope.of(context).logout(),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.power_settings_new, size: 16, color: AppColors.error),
                          SizedBox(width: 8),
                          Text('Sign out', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.error)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Center(child: Text('VECTOR v1.0.0 · © 2026', style: TextStyle(fontSize: 12, color: AppColors.textHint))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VehicleSummaryRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _VehicleSummaryRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32, height: 32,
          decoration: BoxDecoration(color: const Color(0xFFF3F4F6), borderRadius: BorderRadius.circular(8)),
          child: Icon(icon, size: 16, color: AppColors.textSecondary),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
            Text(value, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
          ],
        ),
      ],
    );
  }
}

class _EditField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final IconData icon;
  const _EditField({required this.controller, required this.hint, required this.icon});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      style: const TextStyle(fontSize: 15, color: AppColors.textPrimary, fontWeight: FontWeight.w500),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(color: AppColors.textHint, fontWeight: FontWeight.w400),
        prefixIcon: Icon(icon, color: AppColors.textSecondary, size: 20),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.primary, width: 2)),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
      ),
    );
  }
}

class _ProfileStat extends StatelessWidget {
  final String label, value;
  final IconData? icon;
  const _ProfileStat({required this.label, required this.value, this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[Icon(icon, size: 13, color: const Color(0xFFFBBF24)), const SizedBox(width: 4)],
              Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary, height: 1)),
            ],
          ),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String label;
  final List<Widget> children;
  const _SectionCard({required this.label, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(label.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textMuted, letterSpacing: 0.7)),
        ),
        Container(
          decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
          child: Column(children: children),
        )
      ],
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? sub;
  final VoidCallback? onTap;
  final bool enabled;
  const _MenuItem({
    required this.icon,
    required this.label,
    this.sub,
    this.onTap,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: enabled ? onTap : null,
      child: Opacity(
        opacity: enabled ? 1.0 : 0.5,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Icon(icon, size: 16, color: AppColors.textSecondary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    if (sub != null)
                      Text(
                        sub!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 20, color: AppColors.textHint),
            ],
          ),
        ),
      ),
    );
  }
}
