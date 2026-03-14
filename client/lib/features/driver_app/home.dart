import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/bottom_nav.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final hour = now.hour;
    final greeting = hour < 12
        ? 'Good morning'
        : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

    final days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    final dateStr =
        '${days[now.weekday - 1]}, ${months[now.month - 1]} ${now.day}';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Header
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      border: const Border(
                        bottom: BorderSide(color: AppColors.border),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          offset: const Offset(0, 4),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              dateStr.toUpperCase(),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textMuted,
                                letterSpacing: 0.66,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '$greeting, Alex',
                              style: const TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.6,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        InkWell(
                          onTap: () => context.push('/notifications'),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                const Icon(
                                  Icons.notifications_none,
                                  size: 20,
                                  color: AppColors.textSecondary,
                                ),
                                Positioned(
                                  top: 6,
                                  right: 6,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.error,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(
                                        color: AppColors.white,
                                        width: 1.5,
                                      ),
                                    ),
                                    child: const Text(
                                      '3',
                                      style: TextStyle(
                                        color: AppColors.white,
                                        fontSize: 9,
                                        fontWeight: FontWeight.w800,
                                        height: 1,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Content Body
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.p4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Active Route
                        const Text(
                          'ACTIVE ROUTE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textMuted,
                            letterSpacing: 0.77,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.p2),
                        GestureDetector(
                          onTap: () => context.push('/navigation'),
                          child: Container(
                            padding: const EdgeInsets.all(AppSpacing.p5),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              border: Border.all(
                                color: AppColors.primary.withValues(
                                  alpha: 0.25,
                                ),
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: const [
                                BoxShadow(
                                  color: Color(0x14059669),
                                  offset: Offset(0, 4),
                                  blurRadius: 16,
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          width: 36,
                                          height: 36,
                                          decoration: BoxDecoration(
                                            color: AppColors.successLight,
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                          ),
                                          child: const Icon(
                                            Icons.local_shipping_outlined,
                                            size: 18,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                        const SizedBox(width: AppSpacing.p2),
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Text(
                                              'Downtown Deliveries',
                                              style: TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                                letterSpacing: -0.15,
                                              ),
                                            ),
                                            Row(
                                              children: [
                                                Container(
                                                  width: 6,
                                                  height: 6,
                                                  margin: const EdgeInsets.only(
                                                    right: 6,
                                                  ),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.primary,
                                                    shape: BoxShape.circle,
                                                    border: Border.all(
                                                      color: AppColors.primary
                                                          .withValues(
                                                            alpha: 0.2,
                                                          ),
                                                      width: 2,
                                                    ),
                                                  ),
                                                ),
                                                const Text(
                                                  'In progress',
                                                  style: TextStyle(
                                                    fontSize: 12,
                                                    color: AppColors.primary,
                                                    fontWeight: FontWeight.w600,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 5,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.successLight,
                                        border: Border.all(
                                          color: AppColors.primary.withValues(
                                            alpha: 0.2,
                                          ),
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text(
                                        '2 / 4',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.p3),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                    vertical: 12,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF8FAF9),
                                    border: Border.all(color: AppColors.border),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.location_on,
                                        size: 16,
                                        color: AppColors.primary,
                                      ),
                                      const SizedBox(width: AppSpacing.p2),
                                      const Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'NEXT STOP',
                                              style: TextStyle(
                                                fontSize: 11,
                                                color: AppColors.textMuted,
                                                fontWeight: FontWeight.w600,
                                                letterSpacing: 0.44,
                                              ),
                                            ),
                                            Text(
                                              '456 Market Street',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w600,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Row(
                                        children: const [
                                          Icon(
                                            Icons.schedule,
                                            size: 13,
                                            color: AppColors.textMuted,
                                          ),
                                          SizedBox(width: 4),
                                          Text(
                                            '8 min',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textMuted,
                                              fontWeight: FontWeight.w500,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.p3),
                                Row(
                                  children: [
                                    Expanded(
                                      child: Stack(
                                        children: [
                                          Container(
                                            height: 5,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF0FDF4),
                                              borderRadius:
                                                  BorderRadius.circular(99),
                                            ),
                                          ),
                                          FractionallySizedBox(
                                            widthFactor: 0.5,
                                            child: Container(
                                              height: 5,
                                              decoration: BoxDecoration(
                                                color: AppColors.primary,
                                                borderRadius:
                                                    BorderRadius.circular(99),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.p2),
                                    const Text(
                                      '2 of 4 done',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textMuted,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.p5),

                        // Stats
                        Row(
                          children: [
                            Expanded(
                              child: _StatCard(
                                label: 'Today',
                                value: '8',
                                subtitle: 'deliveries',
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _StatCard(
                                label: 'This week',
                                value: '42',
                                subtitle: 'deliveries',
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.p5),

                        // Quick Actions
                        const Text(
                          'QUICK ACTIONS',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textMuted,
                            letterSpacing: 0.77,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.p2),
                        Row(
                          children: [
                            Expanded(
                              child: _ActionCard(
                                icon: Icons.add,
                                label: 'New',
                                onTap: () => context.push('/new-route'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _ActionCard(
                                icon: Icons.upload_file,
                                label: 'Import',
                                onTap: () => context.push('/new-route'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _ActionCard(
                                icon: Icons.qr_code_scanner,
                                label: 'Scan',
                                onTap: () => context.push('/proof-delivery'),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _ActionCard(
                                icon: Icons.settings_outlined,
                                label: 'Settings',
                                onTap: () => context.push('/settings'),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.p5),

                        // Recent Activity
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'RECENT ACTIVITY',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textMuted,
                                letterSpacing: 0.77,
                              ),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/history'),
                              child: Row(
                                children: const [
                                  Text(
                                    'View all',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  SizedBox(width: 2),
                                  Icon(
                                    Icons.arrow_forward,
                                    size: 12,
                                    color: AppColors.primary,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.p2),
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            border: Border.all(color: AppColors.border),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            children: const [
                              _ActivityItem(
                                icon: Icons.check_circle,
                                iconColor: AppColors.primary,
                                title: 'Delivery completed',
                                subtitle: '123 Main Street',
                                time: '2:34 PM',
                                bg: AppColors.successLight,
                              ),
                              Divider(height: 1),
                              _ActivityItem(
                                icon: Icons.check_circle,
                                iconColor: AppColors.primary,
                                title: 'Delivery completed',
                                subtitle: '789 Oak Avenue',
                                time: '1:15 PM',
                                bg: AppColors.successLight,
                              ),
                              Divider(height: 1),
                              _ActivityItem(
                                icon: Icons.location_on,
                                iconColor: AppColors.primary,
                                title: 'Route started',
                                subtitle: 'Downtown · 4 stops',
                                time: '9:00 AM',
                                bg: Color(0xFFF0FDF4),
                              ),
                            ],
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
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label, value, subtitle;
  const _StatCard({
    required this.label,
    required this.value,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.p4),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
              letterSpacing: 0.66,
            ),
          ),
          const SizedBox(height: AppSpacing.p2),
          Text(
            value,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.56,
              height: 1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionCard({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor, bg;
  final String title, subtitle, time;
  const _ActivityItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.bg,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.p4,
        vertical: 14,
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 16, color: iconColor),
          ),
          const SizedBox(width: AppSpacing.p3),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Text(
            time,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }
}
