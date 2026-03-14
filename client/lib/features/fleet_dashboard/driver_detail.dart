import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';

class DashboardDriverDetailScreen extends StatefulWidget {
  const DashboardDriverDetailScreen({super.key});

  @override
  State<DashboardDriverDetailScreen> createState() =>
      _DashboardDriverDetailScreenState();
}

class _DashboardDriverDetailScreenState
    extends State<DashboardDriverDetailScreen> {
  String _timeFilter = 'today';

  final Map<String, dynamic> _driver = {
    'id': 1,
    'name': 'Alex Rivera',
    'email': 'alex.rivera@email.com',
    'phone': '+1 (555) 123-4567',
    'vehicle': 'Van • ABC-1234',
    'rating': 4.9,
    'status': 'active',
    'lastSession': '2 min ago',
    'companyCode': 'FLEET-2024',
    'joinedDate': 'Jan 15, 2024',
    'totalDeliveries': 234,
    'onTimeRate': 96,
  };

  final Map<String, List<Map<String, dynamic>>> _historyData = {
    'today': [
      {
        'id': 'DEL-001',
        'customerName': 'Sarah Chen',
        'address': '742 Evergreen Terrace, Springfield',
        'completedAt': '10:45 AM',
        'packages': 3,
        'signature': true,
        'timeWindow': '9:00 AM - 11:00 AM',
      },
      {
        'id': 'DEL-005',
        'customerName': 'Mike Johnson',
        'address': '1428 Elm Street, Springfield',
        'completedAt': '9:30 AM',
        'packages': 1,
        'signature': true,
        'timeWindow': '9:00 AM - 10:00 AM',
      },
      {
        'id': 'DEL-012',
        'customerName': 'Emma Davis',
        'address': '890 Oak Avenue, Springfield',
        'completedAt': '8:15 AM',
        'packages': 2,
        'signature': true,
        'timeWindow': '8:00 AM - 9:00 AM',
      },
    ],
    'week': [
      {
        'id': 'DEL-001',
        'customerName': 'Sarah Chen',
        'address': '742 Evergreen Terrace, Springfield',
        'completedAt': 'Today, 10:45 AM',
        'packages': 3,
        'signature': true,
        'timeWindow': '9:00 AM - 11:00 AM',
      },
      {
        'id': 'DEL-097',
        'customerName': 'John Smith',
        'address': '456 Park Lane, Springfield',
        'completedAt': 'Yesterday, 3:30 PM',
        'packages': 2,
        'signature': true,
        'timeWindow': '3:00 PM - 5:00 PM',
      },
      {
        'id': 'DEL-089',
        'customerName': 'Lisa Anderson',
        'address': '123 Main Street, Springfield',
        'completedAt': 'Feb 16, 2:15 PM',
        'packages': 1,
        'signature': false,
        'timeWindow': '2:00 PM - 4:00 PM',
      },
    ],
  };

  final Map<String, Map<String, dynamic>> _stats = {
    'today': {'completed': 3, 'onTime': 3, 'rating': 5.0},
    'week': {'completed': 18, 'onTime': 17, 'rating': 4.9},
    'month': {'completed': 72, 'onTime': 69, 'rating': 4.9},
  };

  @override
  Widget build(BuildContext context) {
    final currentHistory = _historyData[_timeFilter] ?? _historyData['today']!;
    final currentStats = _stats[_timeFilter] ?? _stats['today']!;

    return DashboardLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1200),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: () => context.go('/dashboard/drivers'),
                    icon: const Icon(Icons.arrow_back_rounded, size: 18),
                    label: const Text('Back to Drivers'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      backgroundColor: AppColors.surface,
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Driver Profile
                Container(
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.divider),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Stack(
                        children: [
                          Container(
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(20),
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [AppColors.primary, Color(0xFF6366F1)],
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(
                                    alpha: 0.2,
                                  ),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            alignment: Alignment.center,
                            child: const Icon(
                              Icons.person_rounded,
                              size: 40,
                              color: AppColors.white,
                            ),
                          ),
                          if (_driver['status'] == 'active')
                            Positioned(
                              bottom: -2,
                              right: -2,
                              child: Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: AppColors.success,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: AppColors.white,
                                    width: 4,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(width: 32),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _driver['name'],
                                      style: const TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textPrimary,
                                        letterSpacing: -0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 6,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.success.withValues(
                                          alpha: 0.1,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            Icons.verified_rounded,
                                            size: 14,
                                            color: AppColors.success,
                                          ),
                                          SizedBox(width: 6),
                                          Text(
                                            'Active Driver',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                              color: AppColors.success,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 12,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(
                                      0xFFFBBF24,
                                    ).withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.star_rounded,
                                        size: 20,
                                        color: Color(0xFFFBBF24),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        _driver['rating'].toString(),
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w800,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      const Text(
                                        'avg',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            Wrap(
                              spacing: 12,
                              runSpacing: 12,
                              children: [
                                _buildContactBadge(
                                  Icons.mail_outline_rounded,
                                  _driver['email'],
                                ),
                                _buildContactBadge(
                                  Icons.phone_iphone_rounded,
                                  _driver['phone'],
                                ),
                                _buildContactBadge(
                                  Icons.local_shipping_rounded,
                                  _driver['vehicle'],
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            Container(
                              padding: const EdgeInsets.only(top: 32),
                              margin: const EdgeInsets.only(top: 8),
                              decoration: const BoxDecoration(
                                border: Border(
                                  top: BorderSide(color: AppColors.divider),
                                ),
                              ),
                              child: Wrap(
                                spacing: 48,
                                runSpacing: 24,
                                children: [
                                  _buildInfoItem(
                                    'Total Deliveries',
                                    _driver['totalDeliveries'].toString(),
                                  ),
                                  _buildInfoItem(
                                    'On-Time Rate',
                                    '${_driver['onTimeRate']}%',
                                  ),
                                  _buildInfoItem(
                                    'Joined',
                                    _driver['joinedDate'],
                                  ),
                                  _buildInfoItem(
                                    'Last Session',
                                    _driver['lastSession'],
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
                const SizedBox(height: 24),

                // Stats Cards
                LayoutBuilder(
                  builder: (context, constraints) {
                    final itemWidth = (constraints.maxWidth - (24 * 2)) / 3;
                    return Wrap(
                      spacing: 24,
                      runSpacing: 24,
                      children: [
                        _buildStatCard(
                          'Deliveries Completed',
                          currentStats['completed'],
                          Icons.check_circle_rounded,
                          AppColors.success,
                          itemWidth,
                        ),
                        _buildStatCard(
                          'On-Time Deliveries',
                          currentStats['onTime'],
                          Icons.timer_rounded,
                          AppColors.primary,
                          itemWidth,
                        ),
                        _buildStatCard(
                          'Average Rating',
                          currentStats['rating'],
                          Icons.star_rounded,
                          const Color(0xFFF59E0B),
                          itemWidth,
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 24),

                // Delivery History
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.divider),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Delivery History',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.divider),
                              ),
                              child: Row(
                                children: [
                                  _buildTimeFilter('today', 'Today'),
                                  _buildTimeFilter('week', 'Week'),
                                  _buildTimeFilter('month', 'Month'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1, color: AppColors.divider),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          headingRowColor: WidgetStateProperty.all(
                            AppColors.surface,
                          ),
                          dataRowMinHeight: 72,
                          dataRowMaxHeight: 72,
                          showBottomBorder: true,
                          horizontalMargin: 24,
                          columnSpacing: 40,
                          columns: const [
                            DataColumn(
                              label: Text(
                                'ORDER ID',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'CUSTOMER',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'ADDRESS',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'TIME WINDOW',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'COMPLETED',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'SIG',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textSecondary,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                          ],
                          rows: currentHistory
                              .map(
                                (delivery) => DataRow(
                                  cells: [
                                    DataCell(
                                      Text(
                                        delivery['id'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            delivery['customerName'],
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w700,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            '${delivery['packages']} packages',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        delivery['address'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        delivery['timeWindow'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        delivery['completedAt'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      delivery['signature']
                                          ? Container(
                                              padding: const EdgeInsets.all(4),
                                              decoration: BoxDecoration(
                                                color: AppColors.success
                                                    .withValues(alpha: 0.1),
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(
                                                Icons.check_rounded,
                                                size: 14,
                                                color: AppColors.success,
                                              ),
                                            )
                                          : const Text(
                                              '—',
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w800,
                                                color: AppColors.textMuted,
                                              ),
                                            ),
                                    ),
                                  ],
                                ),
                              )
                              .toList(),
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
    );
  }

  Widget _buildContactBadge(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w800,
            color: AppColors.textMuted,
            letterSpacing: 1.2,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(
    String label,
    dynamic value,
    IconData icon,
    Color color,
    double width,
  ) {
    final isDesktop = MediaQuery.of(context).size.width > 900;
    return Container(
      width: isDesktop ? width : double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.divider),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textSecondary,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: color),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value.toString(),
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeFilter(String value, String label) {
    bool active = _timeFilter == value;
    return GestureDetector(
      onTap: () => setState(() => _timeFilter = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: active ? FontWeight.w800 : FontWeight.w700,
            color: active ? AppColors.textPrimary : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
