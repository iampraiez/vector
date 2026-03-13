import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/spacing.dart';
import '../../shared/widgets/bottom_nav.dart';
import '../../shared/widgets/empty_state.dart';

class AssignmentsScreen extends StatefulWidget {
  const AssignmentsScreen({super.key});

  @override
  State<AssignmentsScreen> createState() => _AssignmentsScreenState();
}

class _AssignmentsScreenState extends State<AssignmentsScreen> {
  int _activeTab = 0; // 0 = today, 1 = completed

  final _todayAssignments = [
    {
      'id': 'DEL-001',
      'customerName': 'Sarah Chen',
      'address': '742 Evergreen Terrace',
      'city': 'Springfield',
      'packages': 3,
      'priority': 'high',
      'timeWindow': '9:00 – 11:00 AM',
      'status': 'active',
      'notes': 'Ring doorbell twice',
    },
    {
      'id': 'DEL-002',
      'customerName': 'Mike Johnson',
      'address': '1428 Elm Street',
      'city': 'Springfield',
      'packages': 1,
      'priority': 'normal',
      'timeWindow': '11:00 AM – 1:00 PM',
      'status': 'pending',
      'notes': 'Leave at front desk',
    },
  ];

  final _completedAssignments = [
    {
      'id': 'DEL-098',
      'customerName': 'John Smith',
      'address': '456 Park Lane',
      'city': 'Springfield',
      'packages': 2,
      'completedAt': 'Today, 8:45 AM',
      'signature': true,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      bottomNavigationBar: const AppBottomNav(),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                color: AppColors.white,
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.p5,
                  AppSpacing.p5,
                  AppSpacing.p5,
                  AppSpacing.p4,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Assignments',
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.44,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Your delivery schedule for today',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textMuted,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              // Content Body
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(AppSpacing.p4),
                  children: [
                    // Tab Control
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: _buildTabButton(
                              0,
                              'Today',
                              _todayAssignments.length,
                            ),
                          ),
                          Expanded(
                            child: _buildTabButton(
                              1,
                              'Completed',
                              _completedAssignments.length,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.p4),

                    // List
                    if (_activeTab == 0)
                      if (_todayAssignments.isEmpty)
                        const EmptyState(
                          title: 'No assignments',
                          message: 'You have no deliveries scheduled for today.',
                          icon: Icons.assignment_outlined,
                        )
                      else
                        ..._todayAssignments.asMap().entries.map(
                          (e) => _buildTodayItem(e.key, e.value),
                        )
                    else if (_completedAssignments.isEmpty)
                      const EmptyState(
                        title: 'No completions',
                        message: 'You haven\'t completed any deliveries yet today.',
                        icon: Icons.check_circle_outline,
                      )
                    else
                      ..._completedAssignments.map(
                        (a) => _buildCompletedItem(a),
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

  Widget _buildTabButton(int index, String label, int count) {
    bool active = _activeTab == index;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 12),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(9),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: active ? AppColors.white : AppColors.textSecondary,
              ),
            ),
            const SizedBox(width: 7),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 1),
              decoration: BoxDecoration(
                color: active
                    ? Colors.white.withValues(alpha: 0.2)
                    : const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                count.toString(),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: active ? AppColors.white : AppColors.textMuted,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTodayItem(int index, Map<String, dynamic> a) {
    bool active = a['status'] == 'active';
    return GestureDetector(
      onTap: () => context.push(active ? '/navigation' : '/route-preview'),
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.p3),
        padding: const EdgeInsets.all(AppSpacing.p4),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(
            color: active
                ? AppColors.primary.withValues(alpha: 0.3)
                : AppColors.border,
          ),
          borderRadius: BorderRadius.circular(16),
          boxShadow: active
              ? const [
                  BoxShadow(
                    color: Color(0x1A059669),
                    offset: Offset(0, 4),
                    blurRadius: 16,
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: active ? AppColors.primary : const Color(0xFFF5F5F5),
                    borderRadius: BorderRadius.circular(10),
                    border: active ? null : Border.all(color: AppColors.border),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    (index + 1).toString(),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                      color: active ? AppColors.white : AppColors.textMuted,
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.p3),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        a['id'],
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textHint,
                          letterSpacing: 0.6,
                        ),
                      ),
                      Text(
                        a['customerName'],
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      Text(
                        '${a['address']}, ${a['city']}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.chevron_right,
                  size: 20,
                  color: AppColors.textHint,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.p3),
            Row(
              children: [
                if (active) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.successLight,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 5,
                          height: 5,
                          margin: const EdgeInsets.only(right: 4),
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const Text(
                          'Active',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: AppSpacing.p2),
                ],
                if (a['priority'] == 'high')
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'High priority',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFFD97706),
                      ),
                    ),
                  ),
              ],
            ),
            if (active || a['priority'] == 'high')
              const SizedBox(height: AppSpacing.p3),
            const Divider(height: 1),
            const SizedBox(height: AppSpacing.p3),
            Row(
              children: [
                const Icon(
                  Icons.schedule,
                  size: 14,
                  color: AppColors.textMuted,
                ),
                const SizedBox(width: 4),
                Text(
                  a['timeWindow'],
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(width: AppSpacing.p4),
                const Icon(
                  Icons.inventory_2_outlined,
                  size: 14,
                  color: AppColors.textMuted,
                ),
                const SizedBox(width: 4),
                Text(
                  '${a['packages']} package${a['packages'] > 1 ? 's' : ''}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            if (a['notes'] != null && (a['notes'] as String).isNotEmpty) ...[
              const SizedBox(height: AppSpacing.p3),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFFBEB),
                  border: Border.all(color: const Color(0x26F59E0B)),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 16,
                      color: Color(0xFFD97706),
                    ),
                    const SizedBox(width: AppSpacing.p2),
                    Expanded(
                      child: Text(
                        a['notes'],
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF92400E),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCompletedItem(Map<String, dynamic> a) {
    return GestureDetector(
      onTap: () => context.push('/history'),
      child: Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.p3),
        padding: const EdgeInsets.all(AppSpacing.p4),
        decoration: BoxDecoration(
          color: AppColors.white,
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.successLight,
                borderRadius: BorderRadius.circular(10),
              ),
              alignment: Alignment.center,
              child: const Icon(
                Icons.check_circle,
                size: 20,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: AppSpacing.p3),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    a['id'],
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textHint,
                      letterSpacing: 0.6,
                    ),
                  ),
                  Text(
                    a['customerName'],
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    '${a['address']}, ${a['city']}',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.p2),
                  Wrap(
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Text(
                        a['completedAt'],
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const Text(
                        ' · ',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textHint,
                        ),
                      ),
                      Text(
                        '${a['packages']} pkg',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textMuted,
                        ),
                      ),
                      if (a['signature']) ...[
                        const Text(
                          ' · ',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textHint,
                          ),
                        ),
                        const Text(
                          '✓ Signed',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              size: 20,
              color: AppColors.textHint,
            ),
          ],
        ),
      ),
    );
  }
}
