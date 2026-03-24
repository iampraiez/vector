import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:client/core/theme/colors.dart';
import 'package:client/main.dart';
import 'package:client/core/services/driver_api_service.dart';
import 'package:client/core/services/offline_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final Map<String, bool> _notifications = {
    'push': true,
    'email': true,
    'sms': false,
  };

  final Map<String, dynamic> _preferences = {
    'language': 'English',
    'units': 'Metric',
    'autoOptimize': true,
    'voiceGuidance': true,
  };

  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey('driver_settings_cache')) {
      final cacheStr = prefs.getString('driver_settings_cache');
      if (cacheStr != null) {
        if (mounted) _mapResponseToState(jsonDecode(cacheStr));
      }
    }

    try {
      final res = await DriverApiService.instance.getSettings();
      final settings = res['settings'] ?? res;
      await prefs.setString('driver_settings_cache', jsonEncode(settings));
      if (mounted) _mapResponseToState(settings);
    } catch (e) {
      debugPrint('Settings sync failed: $e');
    }
  }

  void _mapResponseToState(Map<String, dynamic> data) {
    setState(() {
      if (data.containsKey('push')) _notifications['push'] = data['push'] == true;
      if (data.containsKey('email')) _notifications['email'] = data['email'] == true;
      if (data.containsKey('sms')) _notifications['sms'] = data['sms'] == true;
      
      if (data.containsKey('language')) _preferences['language'] = data['language'];
      if (data.containsKey('units')) _preferences['units'] = data['units'];
      if (data.containsKey('autoOptimize')) _preferences['autoOptimize'] = data['autoOptimize'] == true;
      if (data.containsKey('voiceGuidance')) _preferences['voiceGuidance'] = data['voiceGuidance'] == true;
    });
  }

  void _updateSetting(String type, String key, dynamic value) {
    setState(() {
      if (type == 'notifications') {
        _notifications[key] = value as bool;
      } else {
        _preferences[key] = value;
      }
    });

    SharedPreferences.getInstance().then((prefs) {
      final cacheStr = prefs.getString('driver_settings_cache');
      final currentCache = cacheStr != null ? (jsonDecode(cacheStr) as Map<String, dynamic>) : {};
      currentCache[key] = value;
      prefs.setString('driver_settings_cache', jsonEncode(currentCache));
    });

    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      try {
        await DriverApiService.instance.updateSettings({
          ..._notifications,
          ..._preferences,
        });
      } catch (e) {
        debugPrint('Failed to sync settings: $e');
      }
    });
  }

  void _handleOtpAction(String action) async {
    // Block dangerous actions if offline
    if (await OfflineService.instance.checkAndShowOfflineSnackBar(context)) return;
    if (!mounted) return;
    // Show verification dialog immediately
    _showEmailVerificationDialog(action);

    // Request OTP in background
    DriverApiService.instance.requestSettingsOtp(action).catchError((e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to send OTP: $e'))
        );
      }
    });
  }

  void _showClearDataConfirmation() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Clear All Data?'),
        content: const Text(
          'Confirming this will clear all local app data. A full activity report will be sent to your fleet manager.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _handleOtpAction('clear_data');
            },
            child: const Text('Clear Data', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showDeleteAccountFlow() {
    // Step 1: Initial Confirmation
    showDialog(
      context: context,
      builder: (ctx1) => AlertDialog(
        title: const Text('Delete Account?'),
        content: const Text(
          'Are you sure you want to delete your account? A final report will be sent to the fleet owner.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx1),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx1);
              _handleOtpAction('delete_account');
            },
            child: const Text('Proceed', style: TextStyle(color: AppColors.error)),
          ),
        ],
      ),
    );
  }

  void _showEmailVerificationDialog(String action) {
    final codeController = TextEditingController();
    bool isVerifying = false;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx2) {
        return StatefulBuilder(
          builder: (context, setStateModal) {
            return AlertDialog(
              title: const Text('Verify Identity'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('A 6-digit code has been sent to your email. Enter it below to confirm ${action == 'delete_account' ? 'deletion' : 'data clearance'}.'),
                  const SizedBox(height: 20),
                  TextField(
                    controller: codeController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    textAlign: TextAlign.center,
                    enabled: !isVerifying,
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, letterSpacing: 8),
                    decoration: InputDecoration(
                      counterText: '',
                      filled: true,
                      fillColor: const Color(0xFFF9FAFB),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: AppColors.border.withValues(alpha: 0.15)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: AppColors.border.withValues(alpha: 0.15)),
                      ),
                      hintText: '000000',
                    ),
                  ),
                  if (isVerifying) const Padding(
                    padding: EdgeInsets.only(top: 16.0),
                    child: CircularProgressIndicator(),
                  ),
                ],
              ),
              actions: [
                if (!isVerifying)
                  TextButton(
                    onPressed: () => Navigator.pop(ctx2),
                    child: const Text('Cancel'),
                  ),
                TextButton(
                  onPressed: isVerifying ? null : () async {
                    if (codeController.text.length == 6) {
                      setStateModal(() => isVerifying = true);
                      try {
                        await DriverApiService.instance.verifySettingsOtp(action, codeController.text);
                        if (ctx2.mounted && Navigator.of(ctx2).canPop()) {
                          Navigator.pop(ctx2);
                        }
                        
                        if (action == 'delete_account') {
                          if (mounted) {
                            _showFinalDeletionNotice();
                          }
                        } else {
                          if (context.mounted) {
                            AuthScope.of(context).logout();
                            ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Data cleared successfully.'))
                            );
                          }
                        }
                      } catch (e) {
                        setStateModal(() => isVerifying = false);
                        if (mounted) {
                          ScaffoldMessenger.of(this.context).showSnackBar(SnackBar(content: Text(e.toString())));
                        }
                      }
                    }
                  },
                  child: const Text('Verify'),
                ),
              ],
            );
          }
        );
      },
    );
  }

  void _showFinalDeletionNotice() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx3) => AlertDialog(
        title: const Text('Account Scheduled for Deletion'),
        content: const Text(
          'Your account is now scheduled for deletion in 10 days. You will be logged out now.\n\nNote: If you sign back in within the next 10 days, you will need to re-verify your email to cancel the deletion process.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx3);
              AuthScope.of(context).logout();
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  border: Border(bottom: BorderSide(color: AppColors.border.withValues(alpha: 0.15))),
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => context.pop(),
                      icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
                    ),
                    const SizedBox(width: 16),
                    const Text(
                      'Settings',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.6,
                      ),
                    ),
                  ],
                ),
              ),

              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    _SectionHeader(title: 'Notifications'),
                    _CardGroup(
                      children: [
                        _ToggleItem(
                          icon: Icons.notifications,
                          label: 'Push notifications',
                          sublabel: 'Delivery updates and alerts',
                          value: _notifications['push']!,
                          onChanged: (v) =>
                              _updateSetting('notifications', 'push', v),
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _ToggleItem(
                          icon: Icons.smartphone,
                          label: 'Email notifications',
                          sublabel: 'Weekly summaries and reports',
                          value: _notifications['email']!,
                          onChanged: (v) =>
                              _updateSetting('notifications', 'email', v),
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _ToggleItem(
                          icon: Icons.volume_up,
                          label: 'SMS notifications',
                          sublabel: 'Critical alerts only',
                          value: _notifications['sms']!,
                          onChanged: (v) =>
                              _updateSetting('notifications', 'sms', v),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    _SectionHeader(title: 'App Preferences'),
                    _CardGroup(
                      children: [
                        ListenableBuilder(
                          listenable: themeController,
                          builder: (context, _) {
                            return _ThemeSelector(
                              value: themeController.themeMode,
                              onChanged: (mode) =>
                                  themeController.setThemeMode(mode),
                            );
                          },
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _SelectItem(
                          icon: Icons.language,
                          label: 'Language',
                          value: 'English (Only option for now)',
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _SelectItem(
                          icon: Icons.location_on,
                          label: 'Distance units',
                          value: 'Metric',
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    _SectionHeader(title: 'Navigation'),
                    _CardGroup(
                      children: [
                        _ToggleItem(
                          icon: Icons.near_me,
                          label: 'Auto-optimize routes',
                          sublabel: 'Reorder stops for efficiency',
                          value: _preferences['autoOptimize']!,
                          onChanged: (v) =>
                              _updateSetting('preferences', 'autoOptimize', v),
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _ToggleItem(
                          icon: Icons.volume_up,
                          label: 'Voice guidance',
                          sublabel: 'Coming soon',
                          value: false,
                          disabled: true,
                          onChanged: (v) {},
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    const _SectionHeader(title: 'Danger Zone', isDanger: true),
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFFCA5A5)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _DangerBtn(
                            label: 'Clear all data',
                            sublabel: 'Remove all routes and history',
                            icon: Icons.delete_sweep_outlined,
                            onTap: _showClearDataConfirmation,
                          ),
                          const Divider(
                            height: 1,
                            indent: 16,
                            endIndent: 16,
                            color: Color(0xFFFECACA),
                          ),
                          _DangerBtn(
                            label: 'Delete account',
                            sublabel: 'Permanently delete your account',
                            icon: Icons.person_remove_outlined,
                            onTap: _showDeleteAccountFlow,
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),
                    const Center(
                      child: Text(
                        'VECTOR v1.0.0',
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textMuted,
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
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final bool isDanger;
  const _SectionHeader({required this.title, this.isDanger = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: isDanger ? AppColors.error : AppColors.textMuted,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _CardGroup extends StatelessWidget {
  final List<Widget> children;
  const _CardGroup({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withValues(alpha: 0.15)),
      ),
      child: Column(children: children),
    );
  }
}

class _ToggleItem extends StatelessWidget {
  final IconData icon;
  final String label, sublabel;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool disabled;

  const _ToggleItem({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.value,
    required this.onChanged,
    this.disabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                Text(
                  sublabel,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: disabled ? null : onChanged,
            activeThumbColor: Colors.white,
            activeTrackColor: AppColors.primary,
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: const Color(0xFFE5E7EB),
            trackOutlineColor: WidgetStateProperty.all(Colors.transparent),
          ),
        ],
      ),
    );
  }
}

class _SelectItem extends StatelessWidget {
  final IconData icon;
  final String label, value;

  const _SelectItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () {},
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.primary, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              color: AppColors.textMuted,
              size: 20,
            ),
          ],
        ),
      ),
    );
  }
}

class _DangerBtn extends StatelessWidget {
  final String label, sublabel;
  final IconData icon;
  final VoidCallback onTap;

  const _DangerBtn({
    required this.label,
    required this.sublabel,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFFEE2E2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: AppColors.error, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: AppColors.error,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sublabel,
                    style: const TextStyle(fontSize: 13, color: Color(0xFFDC2626)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ThemeSelector extends StatelessWidget {
  final ThemeMode value;
  final ValueChanged<ThemeMode> onChanged;

  const _ThemeSelector({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.palette_outlined,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Appearance',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                _buildOption(
                  context,
                  'Light',
                  Icons.light_mode_outlined,
                  ThemeMode.light,
                ),
                _buildOption(
                  context,
                  'Dark',
                  Icons.dark_mode_outlined,
                  ThemeMode.dark,
                ),
                _buildOption(
                  context,
                  'System',
                  Icons.settings_brightness_outlined,
                  ThemeMode.system,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOption(
    BuildContext context,
    String label,
    IconData icon,
    ThemeMode mode,
  ) {
    final active = value == mode;

    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? AppColors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Column(
            children: [
              Icon(
                icon,
                size: 18,
                color: active
                    ? AppColors.primary
                    : AppColors.textSecondary,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                  color: active
                      ? AppColors.textPrimary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
