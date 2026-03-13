import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:client/core/theme/colors.dart';
import 'package:client/main.dart';

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: const BoxDecoration(
                  color: AppColors.white,
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => context.pop(),
                      icon: const Icon(Icons.arrow_back),
                      style: IconButton.styleFrom(
                        backgroundColor: AppColors.surface,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: const BorderSide(color: AppColors.border),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Settings',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
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
                              setState(() => _notifications['push'] = v),
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _ToggleItem(
                          icon: Icons.smartphone,
                          label: 'Email notifications',
                          sublabel: 'Weekly summaries and reports',
                          value: _notifications['email']!,
                          onChanged: (v) =>
                              setState(() => _notifications['email'] = v),
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _ToggleItem(
                          icon: Icons.volume_up,
                          label: 'SMS notifications',
                          sublabel: 'Critical alerts only',
                          value: _notifications['sms']!,
                          onChanged: (v) =>
                              setState(() => _notifications['sms'] = v),
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
                          value: _preferences['language']!,
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _SelectItem(
                          icon: Icons.location_on,
                          label: 'Distance units',
                          value: _preferences['units']!,
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
                              setState(() => _preferences['autoOptimize'] = v),
                        ),
                        const Divider(height: 1, indent: 16, endIndent: 16),
                        _ToggleItem(
                          icon: Icons.volume_up,
                          label: 'Voice guidance',
                          sublabel: 'Turn-by-turn audio instructions',
                          value: _preferences['voiceGuidance']!,
                          onChanged: (v) =>
                              setState(() => _preferences['voiceGuidance'] = v),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),
                    const _SectionHeader(title: 'Danger Zone', isDanger: true),
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFFEE2E2)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          _DangerBtn(
                            label: 'Clear all data',
                            sublabel: 'Remove all routes and history',
                            onTap: () {},
                          ),
                          const Divider(
                            height: 1,
                            indent: 16,
                            endIndent: 16,
                            color: AppColors.border,
                          ),
                          _DangerBtn(
                            label: 'Delete account',
                            sublabel: 'Permanently delete your account',
                            onTap: () => context.go('/'),
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
        border: Border.all(color: AppColors.border),
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

  const _ToggleItem({
    required this.icon,
    required this.label,
    required this.sublabel,
    required this.value,
    required this.onChanged,
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
            onChanged: onChanged,
            activeThumbColor: Colors.white,
            activeTrackColor: AppColors.primary,
            inactiveThumbColor: Colors.white,
            inactiveTrackColor: const Color(0xFFD1D5DB),
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
  final VoidCallback onTap;

  const _DangerBtn({
    required this.label,
    required this.sublabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(16),
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
    final theme = Theme.of(context);

    return Expanded(
      child: GestureDetector(
        onTap: () => onChanged(mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: active ? theme.colorScheme.surface : Colors.transparent,
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
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurface.withValues(alpha: 0.5),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w500,
                  color: active
                      ? theme.colorScheme.onSurface
                      : theme.colorScheme.onSurface.withValues(alpha: 0.5),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
