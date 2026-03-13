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
                    icon: const Icon(Icons.arrow_back, size: 16),
                    label: const Text('Back to Drivers'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      textStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Driver Profile
                Container(
                  padding: const EdgeInsets.all(28),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(32),
                          color: AppColors.primary,
                        ),
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.person_outline,
                          size: 32,
                          color: AppColors.white,
                        ),
                      ),
                      const SizedBox(width: 24),
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
                                        fontSize: 26,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDCFCE7),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Container(
                                            width: 6,
                                            height: 6,
                                            decoration: const BoxDecoration(
                                              color: Color(0xFF16A34A),
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Text(
                                            'Active',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: Color(0xFF16A34A),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                Row(
                                  children: [
                                    const Icon(
                                      Icons.star,
                                      size: 18,
                                      color: Colors.amber,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      _driver['rating'].toString(),
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Text(
                                      'avg',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: [
                                _buildContactBadge(
                                  Icons.email_outlined,
                                  _driver['email'],
                                ),
                                _buildContactBadge(
                                  Icons.phone_outlined,
                                  _driver['phone'],
                                ),
                                _buildContactBadge(
                                  Icons.local_shipping_outlined,
                                  _driver['vehicle'],
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            Container(
                              padding: const EdgeInsets.only(top: 24),
                              decoration: const BoxDecoration(
                                border: Border(
                                  top: BorderSide(color: AppColors.border),
                                ),
                              ),
                              child: Wrap(
                                spacing: 24,
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
                Wrap(
                  spacing: 24,
                  runSpacing: 24,
                  children: [
                    _buildStatCard(
                      'Deliveries Completed',
                      currentStats['completed'],
                      Icons.check_circle_outline,
                      const Color(0xFF16A34A),
                    ),
                    _buildStatCard(
                      'On-Time Deliveries',
                      currentStats['onTime'],
                      Icons.schedule,
                      const Color(0xFF059669),
                    ),
                    _buildStatCard(
                      'Average Rating',
                      currentStats['rating'],
                      Icons.star_outline,
                      const Color(0xFFFBBF24),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Delivery History
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
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
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: Row(
                                children: [
                                  _buildTimeFilter('today', 'Today'),
                                  const SizedBox(width: 8),
                                  _buildTimeFilter('week', 'This Week'),
                                  const SizedBox(width: 8),
                                  _buildTimeFilter('month', 'This Month'),
                                  const SizedBox(width: 8),
                                  _buildTimeFilter('all', 'All Time'),
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
                          dataRowMinHeight: 60,
                          dataRowMaxHeight: 60,
                          showBottomBorder: true,
                          columns: const [
                            DataColumn(
                              label: Text(
                                'ORDER ID',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'CUSTOMER',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'ADDRESS',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'TIME WINDOW',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'COMPLETED',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                            DataColumn(
                              label: Text(
                                'SIG',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
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
                                          fontWeight: FontWeight.w600,
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
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            '${delivery['packages']} pkg',
                                            style: const TextStyle(
                                              fontSize: 12,
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
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        delivery['timeWindow'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        delivery['completedAt'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      delivery['signature']
                                          ? const Icon(
                                              Icons.check_circle,
                                              size: 18,
                                              color: Color(0xFF16A34A),
                                            )
                                          : const Text(
                                              '—',
                                              style: TextStyle(
                                                fontSize: 12,
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: AppColors.textMuted),
          const SizedBox(width: 6),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
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
          label,
          style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
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
  ) {
    return Container(
      width: MediaQuery.of(context).size.width > 900
          ? 300
          : MediaQuery.of(context).size.width > 600
          ? 200
          : double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: color.withValues(alpha: 0.15),
                ),
                alignment: Alignment.center,
                child: Icon(icon, size: 20, color: color),
              ),
              const SizedBox(width: 16),
              Text(
                value.toString(),
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimeFilter(String value, String label) {
    bool active = _timeFilter == value;
    return InkWell(
      onTap: () => setState(() => _timeFilter = value),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: active ? AppColors.primary : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: active ? AppColors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
