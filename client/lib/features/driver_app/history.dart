import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../shared/widgets/bottom_nav.dart';
import '../../shared/widgets/empty_state.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  String _selectedPeriod = 'week';
  String? _expandedRouteId;

  final _periods = [
    {'key': 'week', 'label': 'Week'},
    {'key': 'month', 'label': 'Month'},
    {'key': 'year', 'label': 'Year'},
    {'key': 'all', 'label': 'All'},
  ];

  final _completedRoutes = [
    {
      'id': '1',
      'name': 'Downtown Route #47',
      'date': 'Today',
      'stops': 12,
      'completed': 12,
      'duration': '3h 24m',
      'distance': '42.8 km',
      'earnings': '\$124.50',
      'rating': 4.9,
      'timeline': [
        {
          'address': '123 Main St',
          'time': '9:15 AM',
          'customer': 'John Doe',
          'status': 'delivered',
        },
        {
          'address': '456 Oak Ave',
          'time': '9:42 AM',
          'customer': 'Jane Smith',
          'status': 'delivered',
        },
        {
          'address': '789 Pine Rd',
          'time': '10:08 AM',
          'customer': 'Bob Johnson',
          'status': 'delivered',
        },
      ],
    },
    {
      'id': '2',
      'name': 'Suburban Route #23',
      'date': 'Yesterday',
      'stops': 8,
      'completed': 7,
      'duration': '2h 15m',
      'distance': '28.3 km',
      'earnings': '\$89.00',
      'rating': 4.7,
      'timeline': [
        {
          'address': '321 Elm St',
          'time': '2:00 PM',
          'customer': 'Sarah Williams',
          'status': 'delivered',
        },
        {
          'address': '654 Maple Dr',
          'time': '2:35 PM',
          'customer': 'Mike Davis',
          'status': 'failed',
        },
      ],
    },
    {
      'id': '3',
      'name': 'Express Route #12',
      'date': 'Mar 4, 2026',
      'stops': 15,
      'completed': 15,
      'duration': '4h 10m',
      'distance': '56.2 km',
      'earnings': '\$167.25',
      'rating': 5.0,
      'timeline': [
        {
          'address': '111 First Ave',
          'time': '8:30 AM',
          'customer': 'Emma Wilson',
          'status': 'delivered',
        },
      ],
    },
  ];

  final _weekBarData = [48, 62, 55, 71, 66, 43, 78];
  final _weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  @override
  Widget build(BuildContext context) {
    double totalEarnings = _completedRoutes.fold(
      0,
      (sum, r) =>
          sum + double.parse((r['earnings'] as String).replaceAll('\$', '')),
    );
    int totalDeliveries = _completedRoutes.fold(
      0,
      (sum, r) => sum + (r['completed'] as int),
    );
    double avgRating =
        _completedRoutes.fold(0.0, (sum, r) => sum + (r['rating'] as double)) /
        _completedRoutes.length;
    int maxBar = _weekBarData.reduce((a, b) => a > b ? a : b);

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
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
                decoration: const BoxDecoration(
                  color: AppColors.white,
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text(
                          'History',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.44,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Your completed deliveries',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: const [
                          Icon(
                            Icons.download_outlined,
                            size: 15,
                            color: AppColors.textSecondary,
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Export',
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
              ),

              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Summary Cards
                    Row(
                      children: [
                        Expanded(
                          child: _SummaryCard(
                            label: 'Routes',
                            value: '${_completedRoutes.length}',
                            icon: Icons.local_shipping_outlined,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SummaryCard(
                            label: 'Deliveries',
                            value: '$totalDeliveries',
                            icon: Icons.check_circle_outline,
                            color: AppColors.success,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: _SummaryCard(
                            label: 'Earned',
                            value:
                                '\$${(totalEarnings / 1000).toStringAsFixed(1)}k',
                            icon: Icons.attach_money,
                            color: const Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Chart
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text(
                                    'This Week',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    'Deliveries per day',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(99),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.star,
                                      size: 12,
                                      color: Color(0xFFFBBF24),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${avgRating.toStringAsFixed(1)} avg',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.success,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            height: 80,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: _weekBarData.asMap().entries.map((e) {
                                int i = e.key;
                                int val = e.value;
                                return Expanded(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      Expanded(
                                        child: Align(
                                          alignment: Alignment.bottomCenter,
                                          child: Container(
                                            width: double.infinity,
                                            margin: const EdgeInsets.symmetric(
                                              horizontal: 4,
                                            ),
                                            height:
                                                (val / maxBar) *
                                                70, // proportional height
                                            decoration: BoxDecoration(
                                              color: i == 6
                                                  ? AppColors.primary
                                                  : AppColors.primaryLight,
                                              borderRadius:
                                                  const BorderRadius.vertical(
                                                    top: Radius.circular(4),
                                                  ),
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        _weekLabels[i],
                                        style: const TextStyle(
                                          fontSize: 10,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Filter
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x0D000000),
                            offset: Offset(0, 1),
                            blurRadius: 2,
                          ),
                        ],
                      ),
                      child: Row(
                        children: _periods
                            .map(
                              (p) => Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(
                                    () => _selectedPeriod = p['key']!,
                                  ),
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(
                                      vertical: 8,
                                    ),
                                    decoration: BoxDecoration(
                                      color: _selectedPeriod == p['key']
                                          ? AppColors.primary
                                          : Colors.transparent,
                                      borderRadius: BorderRadius.circular(7),
                                    ),
                                    alignment: Alignment.center,
                                    child: Text(
                                      p['label']!,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: _selectedPeriod == p['key']
                                            ? AppColors.white
                                            : AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            )
                            .toList(),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Routes
                    Text(
                      '${_completedRoutes.length} routes • ${_selectedPeriod == 'week'
                          ? 'This week'
                          : _selectedPeriod == 'month'
                          ? 'This month'
                          : _selectedPeriod == 'year'
                          ? 'This year'
                          : 'All time'}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textMuted,
                        letterSpacing: 0.7,
                      ),
                    ),
                    const SizedBox(height: 10),

                    if (_completedRoutes.isEmpty)
                      const EmptyState(
                        title: 'No history',
                        message: 'Your completed routes will appear here.',
                        icon: Icons.history,
                      )
                    else
                      ..._completedRoutes.map((r) {
                        bool isExpanded = _expandedRouteId == r['id'];
                        int completionRate =
                            ((r['completed'] as int) /
                                    (r['stops'] as int) *
                                    100)
                                .round();

                        return GestureDetector(
                          onTap: () => setState(
                            () => _expandedRouteId = isExpanded
                                ? null
                                : r['id'] as String,
                          ),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isExpanded
                                    ? AppColors.primary
                                    : AppColors.border,
                              ),
                              boxShadow: isExpanded
                                  ? const [
                                      BoxShadow(
                                        color: Color(0x1A000000),
                                        offset: Offset(0, 4),
                                        blurRadius: 6,
                                      ),
                                    ]
                                  : const [
                                      BoxShadow(
                                        color: Color(0x0D000000),
                                        offset: Offset(0, 1),
                                        blurRadius: 2,
                                      ),
                                    ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(16),
                                  child: Column(
                                    children: [
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  children: [
                                                    Text(
                                                      r['date'] as String,
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        color:
                                                            AppColors.textMuted,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                    ),
                                                    Container(
                                                      width: 4,
                                                      height: 4,
                                                      margin:
                                                          const EdgeInsets.symmetric(
                                                            horizontal: 8,
                                                          ),
                                                      decoration:
                                                          const BoxDecoration(
                                                            color: AppColors
                                                                .border,
                                                            shape:
                                                                BoxShape.circle,
                                                          ),
                                                    ),
                                                    const Icon(
                                                      Icons.star,
                                                      size: 11,
                                                      color: Color(0xFFFBBF24),
                                                    ),
                                                    const SizedBox(width: 3),
                                                    Text(
                                                      '${r['rating']}',
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        color: AppColors
                                                            .textSecondary,
                                                        fontWeight:
                                                            FontWeight.w600,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  r['name'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w600,
                                                    color:
                                                        AppColors.textPrimary,
                                                  ),
                                                  maxLines: 1,
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                              ],
                                            ),
                                          ),
                                          Row(
                                            children: [
                                              Text(
                                                r['earnings'] as String,
                                                style: const TextStyle(
                                                  fontSize: 17,
                                                  fontWeight: FontWeight.w700,
                                                  color: AppColors.primary,
                                                ),
                                              ),
                                              const SizedBox(width: 12),
                                              Container(
                                                width: 28,
                                                height: 28,
                                                decoration: BoxDecoration(
                                                  color: AppColors.surface,
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  border: Border.all(
                                                    color: AppColors.border,
                                                  ),
                                                ),
                                                child: Icon(
                                                  isExpanded
                                                      ? Icons.keyboard_arrow_up
                                                      : Icons
                                                            .keyboard_arrow_down,
                                                  size: 16,
                                                  color: isExpanded
                                                      ? AppColors.primary
                                                      : AppColors.textMuted,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 12),
                                      // Progress bar
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            '${r['completed']}/${r['stops']} stops',
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                          Text(
                                            '$completionRate%',
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: completionRate == 100
                                                  ? AppColors.success
                                                  : const Color(0xFFD97706),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 5),
                                      Stack(
                                        children: [
                                          Container(
                                            height: 4,
                                            decoration: BoxDecoration(
                                              color: AppColors.surface,
                                              borderRadius:
                                                  BorderRadius.circular(99),
                                            ),
                                          ),
                                          FractionallySizedBox(
                                            widthFactor: completionRate / 100,
                                            child: Container(
                                              height: 4,
                                              decoration: BoxDecoration(
                                                color: completionRate == 100
                                                    ? AppColors.success
                                                    : const Color(0xFFF59E0B),
                                                borderRadius:
                                                    BorderRadius.circular(99),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      const Divider(height: 1),
                                      const SizedBox(height: 10),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                const Icon(
                                                  Icons.schedule,
                                                  size: 13,
                                                  color: AppColors.textMuted,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  r['duration'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                const Icon(
                                                  Icons.local_shipping_outlined,
                                                  size: 13,
                                                  color: AppColors.textMuted,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  r['distance'] as String,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Expanded(
                                            child: Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment.center,
                                              children: [
                                                const Icon(
                                                  Icons.location_on_outlined,
                                                  size: 13,
                                                  color: AppColors.textMuted,
                                                ),
                                                const SizedBox(width: 5),
                                                Text(
                                                  '${r['stops']} stops',
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color:
                                                        AppColors.textSecondary,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                if (isExpanded) ...[
                                  const Divider(height: 1),
                                  Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'DELIVERY TIMELINE',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textSecondary,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                        const SizedBox(height: 12),
                                        ...(r['timeline'] as List).map((stop) {
                                          bool isDelivered =
                                              stop['status'] == 'delivered';
                                          return Padding(
                                            padding: const EdgeInsets.only(
                                              bottom: 14,
                                            ),
                                            child: Row(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Container(
                                                  width: 30,
                                                  height: 30,
                                                  decoration: BoxDecoration(
                                                    color: isDelivered
                                                        ? const Color(
                                                            0xFFECFDF5,
                                                          )
                                                        : const Color(
                                                            0xFFFEF2F2,
                                                          ),
                                                    shape: BoxShape.circle,
                                                    border: Border.all(
                                                      color: isDelivered
                                                          ? AppColors.success
                                                          : AppColors.error,
                                                      width: 2,
                                                    ),
                                                  ),
                                                  alignment: Alignment.center,
                                                  child: Icon(
                                                    isDelivered
                                                        ? Icons.check
                                                        : Icons.close,
                                                    size: 14,
                                                    color: isDelivered
                                                        ? AppColors.success
                                                        : AppColors.error,
                                                  ),
                                                ),
                                                const SizedBox(width: 14),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Row(
                                                        mainAxisAlignment:
                                                            MainAxisAlignment
                                                                .spaceBetween,
                                                        children: [
                                                          Text(
                                                            stop['address'],
                                                            style: const TextStyle(
                                                              fontSize: 13,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w600,
                                                              color: AppColors
                                                                  .textPrimary,
                                                            ),
                                                          ),
                                                          Row(
                                                            children: [
                                                              const Icon(
                                                                Icons.schedule,
                                                                size: 11,
                                                                color: AppColors
                                                                    .textMuted,
                                                              ),
                                                              const SizedBox(
                                                                width: 4,
                                                              ),
                                                              Text(
                                                                stop['time'],
                                                                style: const TextStyle(
                                                                  fontSize: 11,
                                                                  color: AppColors
                                                                      .textMuted,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w500,
                                                                ),
                                                              ),
                                                            ],
                                                          ),
                                                        ],
                                                      ),
                                                      Text(
                                                        stop['customer'],
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          color: AppColors
                                                              .textSecondary,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          );
                                        }),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        );
                      }),
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

class _SummaryCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  const _SummaryCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Container(
            width: 32,
            height: 32,
            margin: const EdgeInsets.only(bottom: 8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.2,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
