import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../shared/widgets/bottom_nav.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final Map<String, String> _profileData = {
    'name': 'Alex Rivera',
    'email': 'alex.rivera@email.com',
    'phone': '+1 (555) 123-4567',
  };

  late TextEditingController _nameCtrl;
  late TextEditingController _emailCtrl;
  late TextEditingController _phoneCtrl;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: _profileData['name']);
    _emailCtrl = TextEditingController(text: _profileData['email']);
    _phoneCtrl = TextEditingController(text: _profileData['phone']);
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  void _openEditSheet() {
    _nameCtrl.text = _profileData['name']!;
    _emailCtrl.text = _profileData['email']!;
    _phoneCtrl.text = _profileData['phone']!;
    
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
              onPressed: () {
                setState(() {
                  _profileData['name'] = _nameCtrl.text;
                  _profileData['email'] = _emailCtrl.text;
                  _profileData['phone'] = _phoneCtrl.text;
                });
                Navigator.pop(ctx);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: const Text('Save Changes', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    String initials = _profileData['name']!.split(' ').map((n) => n.isNotEmpty ? n[0] : '').join('');

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            children: [
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
                      onTap: _openEditSheet,
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
                                      Text(_profileData['name']!, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.5)),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          const Icon(Icons.email_outlined, size: 15, color: AppColors.textMuted),
                                          const SizedBox(width: 8),
                                          Expanded(child: Text(_profileData['email']!, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                        ]
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          const Icon(Icons.phone_outlined, size: 15, color: AppColors.textMuted),
                                          const SizedBox(width: 8),
                                          Expanded(child: Text(_profileData['phone']!, style: const TextStyle(fontSize: 14, color: AppColors.textSecondary))),
                                        ]
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
                              Expanded(child: _ProfileStat(label: 'Deliveries', value: '248')),
                              Container(width: 1, height: 40, color: AppColors.border),
                              Expanded(child: _ProfileStat(label: 'This week', value: '42')),
                              Container(width: 1, height: 40, color: AppColors.border),
                              Expanded(child: _ProfileStat(label: 'Rating', value: '4.9', icon: Icons.star)),
                            ],
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Fleet Info
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                      decoration: BoxDecoration(gradient: const LinearGradient(colors: [Color(0xFF064E3B), Color(0xFF065F46)], begin: Alignment.topLeft, end: Alignment.bottomRight), borderRadius: BorderRadius.circular(16)),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text('FLEET', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white54, letterSpacing: 0.5)),
                              SizedBox(height: 4),
                              Text('Acme Logistics', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                              SizedBox(height: 2),
                              Text('Code: ACM-2026', style: TextStyle(fontSize: 12, color: Colors.white54)), // In real app, highlight ACM-2026
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.white.withValues(alpha: 0.2))),
                            child: Row(
                              children: [
                                Container(width: 7, height: 7, decoration: BoxDecoration(color: const Color(0xFF6EE7B7), shape: BoxShape.circle, boxShadow: [BoxShadow(color: const Color(0xFF6EE7B7).withValues(alpha: 0.4), spreadRadius: 2)])),
                                const SizedBox(width: 6),
                                const Text('Active', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white)),
                              ],
                            ),
                          )
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
                      label: 'Support',
                      children: [
                        _MenuItem(icon: Icons.help_outline, label: 'Help Centre', sub: 'FAQs and guides'),
                        const Divider(height: 1, indent: 66),
                        _MenuItem(icon: Icons.security, label: 'Privacy & Security', sub: 'Manage your data', onTap: () => context.push('/settings')),
                      ],
                    ),
                    const SizedBox(height: 16),

                    InkWell(
                      onTap: () => context.go('/'),
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
              )
            ],
          ),
        ),
      ),
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
  const _MenuItem({required this.icon, required this.label, this.sub, this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
        child: Row(
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(color: const Color(0xFFF5F5F5), borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.border)),
              child: Icon(icon, size: 16, color: AppColors.textSecondary),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  if (sub != null) Text(sub!, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 20, color: AppColors.textHint),
          ],
        ),
      ),
    );
  }
}
