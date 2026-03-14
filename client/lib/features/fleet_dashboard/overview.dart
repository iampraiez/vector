import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';
import 'widgets/dashboard_status_badge.dart';

class DashboardOverviewScreen extends StatefulWidget {
  const DashboardOverviewScreen({super.key});

  @override
  State<DashboardOverviewScreen> createState() =>
      _DashboardOverviewScreenState();
}

class _DashboardOverviewScreenState extends State<DashboardOverviewScreen> {
  bool _loading = true;
  bool _showNewOrderModal = false;
  bool _orderSaved = false;

  Map<String, dynamic> _newOrder = {
    'customer': '',
    'address': '',
    'packages': '1',
    'timeWindow': '',
    'notes': '',
    'priority': 'normal',
  };

  final String _today = 'Monday, March 9, 2026'; // placeholder

  final List<Map<String, dynamic>> _metrics = [
    {
      'label': 'Active Drivers',
      'value': '12',
      'change': '+2',
      'trend': 'up',
      'icon': Icons.people_outline,
      'color': AppColors.success,
    },
    {
      'label': 'Pending Orders',
      'value': '34',
      'change': '-5',
      'trend': 'down',
      'icon': Icons.archive_outlined,
      'color': AppColors.warning,
    },
    {
      'label': 'On-time Rate',
      'value': '94%',
      'change': '+3%',
      'trend': 'up',
      'icon': Icons.trending_up,
      'color': AppColors.success,
    },
    {
      'label': 'Fuel Saved',
      'value': '\$248',
      'change': '+12%',
      'trend': 'up',
      'icon': Icons.payments_outlined,
      'color': AppColors.success,
    },
  ];

  final List<Map<String, dynamic>> _activeDrivers = [
    {
      'name': 'Alex Rivera',
      'location': 'Downtown',
      'stops': 4,
      'eta': '2h 15m',
      'status': 'active',
    },
    {
      'name': 'Sarah Chen',
      'location': 'Midtown',
      'stops': 6,
      'eta': '3h 30m',
      'status': 'active',
    },
    {
      'name': 'Mike Johnson',
      'location': 'Uptown',
      'stops': 3,
      'eta': '1h 45m',
      'status': 'active',
    },
    {
      'name': 'Emma Davis',
      'location': 'Suburb',
      'stops': 5,
      'eta': '2h 50m',
      'status': 'break',
    },
  ];

  final List<Map<String, dynamic>> _recentOrders = [
    {
      'id': 'ORD-1234',
      'customer': 'Acme Corp',
      'address': '123 Main St',
      'time': '10 min ago',
      'status': 'assigned',
    },
    {
      'id': 'ORD-1235',
      'customer': 'Tech Solutions',
      'address': '456 Market St',
      'time': '25 min ago',
      'status': 'in-progress',
    },
    {
      'id': 'ORD-1236',
      'customer': 'Global Industries',
      'address': '789 Oak Ave',
      'time': '1 hour ago',
      'status': 'completed',
    },
    {
      'id': 'ORD-1237',
      'customer': 'Bright Media',
      'address': '321 Park Blvd',
      'time': '2 hours ago',
      'status': 'completed',
    },
  ];

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) setState(() => _loading = false);
    });
  }


  void _handleSaveOrder() {
    setState(() => _orderSaved = true);
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _orderSaved = false;
          _showNewOrderModal = false;
          _newOrder = {
            'customer': '',
            'address': '',
            'packages': '1',
            'timeWindow': '',
            'notes': '',
            'priority': 'normal',
          };
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return DashboardLayout(
        child: Padding(
          padding: EdgeInsets.all(
            MediaQuery.of(context).size.width * 0.04 > 32
                ? 32
                : MediaQuery.of(context).size.width * 0.04 < 16
                ? 16
                : MediaQuery.of(context).size.width * 0.04,
          ), // roughly clamp(16, 4vw, 32)
          child: Column(
            children: [
              GridView.count(
                crossAxisCount: MediaQuery.of(context).size.width > 800
                    ? 4
                    : MediaQuery.of(context).size.width > 500
                    ? 2
                    : 1,
                shrinkWrap: true,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 2.5,
                children: List.generate(
                  4,
                  (index) => Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ), // Skeleton roughly
              ),
              const SizedBox(height: 20),
              Container(
                height: 300,
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Stack(
      children: [
        DashboardLayout(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1400),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Overview',
                                style: TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.6,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Icon(
                                    Icons.calendar_today_rounded,
                                    size: 13,
                                    color: AppColors.textSecondary.withValues(
                                      alpha: 0.6,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    _today,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            OutlinedButton.icon(
                              onPressed: () =>
                                  context.go('/dashboard/tracking'),
                              icon: Container(
                                padding: const EdgeInsets.all(4),
                                decoration: const BoxDecoration(
                                  color: Color(0x2010B981),
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.cell_tower_rounded,
                                  size: 12,
                                  color: AppColors.success,
                                ),
                              ),
                              label: const Text('Live Tracking'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.textPrimary,
                                side: const BorderSide(
                                  color: AppColors.divider,
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                                backgroundColor: AppColors.white,
                                elevation: 0,
                              ),
                            ),
                            const SizedBox(width: 12),
                            ElevatedButton.icon(
                              onPressed: () =>
                                  setState(() => _showNewOrderModal = true),
                              icon: const Icon(
                                Icons.add_rounded,
                                size: 18,
                                color: AppColors.white,
                              ),
                              label: const Text('New Order'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: AppColors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 20,
                                  vertical: 16,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    Wrap(
                      spacing: 16,
                      runSpacing: 16,
                      children: _metrics
                          .map(
                            (m) => SizedBox(
                              width: MediaQuery.of(context).size.width > 1200
                                  ? (MediaQuery.of(context).size.width -
                                            250 -
                                            48 -
                                            48) /
                                        4
                                  : MediaQuery.of(context).size.width > 900
                                  ? (MediaQuery.of(context).size.width -
                                            250 -
                                            48 -
                                            16) /
                                        2
                                  : MediaQuery.of(context).size.width > 600
                                  ? (MediaQuery.of(context).size.width -
                                            48 -
                                            16) /
                                        2
                                  : double.infinity,
                              child: Container(
                                  padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.divider),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.03,
                                      ),
                                      blurRadius: 20,
                                      offset: const Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: (m['color'] as Color)
                                                .withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(
                                              12,
                                            ),
                                          ),
                                          child: Icon(
                                            m['icon'],
                                            size: 20,
                                            color: m['color'],
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 4,
                                          ),
                                          decoration: BoxDecoration(
                                            color: m['trend'] == 'up'
                                                ? const Color(0xFFF0FDF4)
                                                : const Color(0xFFFEF2F2),
                                            borderRadius: BorderRadius.circular(
                                              30,
                                            ),
                                          ),
                                          child: Row(
                                            children: [
                                              Icon(
                                                m['trend'] == 'up'
                                                    ? Icons.trending_up_rounded
                                                    : Icons
                                                          .trending_down_rounded,
                                                size: 14,
                                                color: m['trend'] == 'up'
                                                    ? AppColors.success
                                                    : AppColors.error,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                m['change'],
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                  color: m['trend'] == 'up'
                                                      ? AppColors.success
                                                      : AppColors.error,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 20),
                                    Text(
                                      m['label'].toString(),
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      m['value'],
                                      style: const TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.w800,
                                        color: AppColors.textPrimary,
                                        letterSpacing: -0.8,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 32),

                    // Content Grid
                    LayoutBuilder(
                      builder: (context, constraints) {
                        bool isWide = constraints.maxWidth > 700;
                        return Flex(
                          direction: isWide ? Axis.horizontal : Axis.vertical,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            // Active Drivers
                            Flexible(
                              flex: 1,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.divider),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.03,
                                      ),
                                      blurRadius: 24,
                                      offset: const Offset(0, 12),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.all(24),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              const Text(
                                                'Active Drivers',
                                                style: TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w800,
                                                  color: AppColors.textPrimary,
                                                  letterSpacing: -0.4,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              const Text(
                                                '12 drivers currently on duty',
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textMuted,
                                                ),
                                              ),
                                            ],
                                          ),
                                          TextButton(
                                            onPressed: () => context.go(
                                              '/dashboard/drivers',
                                            ),
                                            style: TextButton.styleFrom(
                                              foregroundColor:
                                                  AppColors.primary,
                                              textStyle: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w700,
                                              ),
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 12,
                                                    vertical: 8,
                                              ),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text('Manage'),
                                                SizedBox(width: 4),
                                                Icon(
                                                  Icons.arrow_forward_rounded,
                                                  size: 14,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Divider(
                                      height: 1,
                                      color: AppColors.divider,
                                    ),
                                    ListView.separated(
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      padding: const EdgeInsets.all(16),
                                      itemCount: _activeDrivers.length,
                                      separatorBuilder: (context, index) =>
                                          const SizedBox(height: 4),
                                      itemBuilder: (context, index) {
                                        final driver = _activeDrivers[index];
                                        return InkWell(
                                          onTap: () =>
                                              context.go('/dashboard/tracking'),
                                          borderRadius:
                                              BorderRadius.circular(
                                            12,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 12,
                                            ),
                                            child: Row(
                                              children: [
                                                Stack(
                                                  children: [
                                                    Container(
                                                      width: 44,
                                                      height: 44,
                                                      decoration: BoxDecoration(
                                                        borderRadius:
                                                            BorderRadius.circular(
                                                              12,
                                                            ),
                                                        color: AppColors
                                                            .primaryLight,
                                                      ),
                                                      alignment:
                                                          Alignment.center,
                                                      child: Text(
                                                        driver['name']
                                                            .split(' ')
                                                            .map((n) => n[0])
                                                            .join(''),
                                                        style: const TextStyle(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w800,
                                                          color:
                                                              AppColors.primary,
                                                        ),
                                                      ),
                                                    ),
                                                    Positioned(
                                                      bottom: -1,
                                                      right: -1,
                                                      child: Container(
                                                        width: 14,
                                                        height: 14,
                                                        decoration: BoxDecoration(
                                                          color:
                                                              driver['status'] ==
                                                                  'active'
                                                              ? const Color(
                                                                  0xFF10B981,
                                                                )
                                                              : const Color(
                                                                  0xFFF59E0B,
                                                                ),
                                                          shape:
                                                              BoxShape.circle,
                                                          border: Border.all(
                                                            color:
                                                                AppColors.white,
                                                            width: 2.5,
                                                          ),
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(width: 16),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        driver['name'],
                                                        style: const TextStyle(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w700,
                                                          color: AppColors
                                                              .textPrimary,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Row(
                                                        children: [
                                                          Icon(
                                                            Icons
                                                                .location_on_rounded,
                                                            size: 13,
                                                            color: AppColors
                                                                .textSecondary
                                                                .withValues(
                                                                  alpha: 0.5,
                                                                ),
                                                          ),
                                                          const SizedBox(
                                                            width: 4,
                                                          ),
                                                          Text(
                                                            driver['location'],
                                                            style: const TextStyle(
                                                              fontSize: 12,
                                                              color: AppColors
                                                                  .textSecondary,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w500,
                                                            ),
                                                          ),
                                                          const Padding(
                                                            padding:
                                                                EdgeInsets.symmetric(
                                                                  horizontal: 6,
                                                                ),
                                                            child: Text(
                                                              '•',
                                                              style: TextStyle(
                                                                color: AppColors
                                                                    .divider,
                                                              ),
                                                            ),
                                                          ),
                                                          Text(
                                                            '${driver['stops']} stops remaining',
                                                            style:
                                                                const TextStyle(
                                                                  fontSize: 12,
                                                                  color: AppColors
                                                                      .primary,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w700,
                                                                ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.end,
                                                  children: [
                                                    Text(
                                                      driver['eta'],
                                                      style: const TextStyle(
                                                        fontSize: 14,
                                                        fontWeight:
                                                            FontWeight.w800,
                                                        color: AppColors
                                                            .textPrimary,
                                                      ),
                                                    ),
                                                    const SizedBox(height: 2),
                                                    Text(
                                                      'EST. ARRIVAL',
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        fontWeight:
                                                            FontWeight.w700,
                                                        color: AppColors
                                                            .textSecondary
                                                            .withValues(
                                                              alpha: 0.4,
                                                            ),
                                                        letterSpacing: 0.5,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            if (isWide)
                              const SizedBox(width: 16)
                            else
                              const SizedBox(height: 16),
                            // Recent Orders
                            Flexible(
                              flex: 1,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.divider),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.03,
                                      ),
                                      blurRadius: 24,
                                      offset: const Offset(0, 12),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.all(24),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              const Text(
                                                'Recent Orders',
                                                style: TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w700,
                                                  color: AppColors.textPrimary,
                                                  letterSpacing: -0.4,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                'Latest delivery requests from customers',
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  color: AppColors.textSecondary
                                                      .withValues(alpha: 0.8),
                                                ),
                                              ),
                                            ],
                                          ),
                                          TextButton(
                                            onPressed: () =>
                                                context.go('/dashboard/orders'),
                                            style: TextButton.styleFrom(
                                              foregroundColor:
                                                  AppColors.primary,
                                              textStyle: const TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w700,
                                              ),
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 12,
                                                    vertical: 8,
                                              ),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text('View All'),
                                                SizedBox(width: 4),
                                                Icon(
                                                  Icons.arrow_forward_rounded,
                                                  size: 14,
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Divider(
                                      height: 1,
                                      color: AppColors.divider,
                                    ),
                                    ListView.separated(
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      padding: const EdgeInsets.all(16),
                                      itemCount: _recentOrders.length,
                                      separatorBuilder: (context, index) =>
                                          const SizedBox(height: 4),
                                      itemBuilder: (context, index) {
                                        final order = _recentOrders[index];
                                        return InkWell(
                                          onTap: () =>
                                              context.go('/dashboard/orders'),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          child: Padding(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                              vertical: 12,
                                            ),
                                            child: Row(
                                              children: [
                                                Container(
                                                  width: 44,
                                                  height: 44,
                                                  decoration: BoxDecoration(
                                                    color: AppColors.surface,
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          12,
                                                        ),
                                                  ),
                                                  child: Icon(
                                                    order['status'] ==
                                                            'completed'
                                                        ? Icons
                                                              .check_circle_rounded
                                                        : order['status'] ==
                                                              'in-progress'
                                                        ? Icons
                                                              .local_shipping_rounded
                                                        : Icons
                                                              .assignment_rounded,
                                                    size: 20,
                                                    color:
                                                        order['status'] ==
                                                            'completed'
                                                        ? AppColors.success
                                                        : order['status'] ==
                                                              'in-progress'
                                                        ? AppColors.primary
                                                        : const Color(
                                                            0xFFF59E0B,
                                                          ),
                                                  ),
                                                ),
                                                const SizedBox(width: 16),
                                                Expanded(
                                                  child: Column(
                                                    crossAxisAlignment:
                                                        CrossAxisAlignment
                                                            .start,
                                                    children: [
                                                      Text(
                                                        order['id'],
                                                        style: const TextStyle(
                                                          fontSize: 14,
                                                          fontWeight:
                                                              FontWeight.w800,
                                                          color: AppColors
                                                              .textPrimary,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        order['customer'],
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          color: AppColors
                                                              .textSecondary,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                Column(
                                                  crossAxisAlignment:
                                                      CrossAxisAlignment.end,
                                                  children: [
                                                    DashboardStatusBadge(
                                                      label: order['status']!,
                                                    ),
                                                    const SizedBox(height: 6),
                                                    Text(
                                                      order['time'],
                                                      style: TextStyle(
                                                        fontSize: 11,
                                                        fontWeight:
                                                            FontWeight.w700,
                                                        color: AppColors
                                                            .textSecondary
                                                            .withValues(
                                                              alpha: 0.4,
                                                            ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        if (_showNewOrderModal)
          Container(
            color: const Color(0x73000000),
            alignment: Alignment.center,
            child: Material(
              color: Colors.transparent,
              child: Container(
                width: 520,
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x26000000),
                      blurRadius: 60,
                      offset: Offset(0, 20),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.fromLTRB(24, 20, 24, 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'New Order',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Create a delivery order and assign it later',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          IconButton(
                            onPressed: () =>
                                setState(() => _showNewOrderModal = false),
                            icon: const Icon(
                              Icons.close,
                              size: 18,
                              color: AppColors.textMuted,
                            ),
                            padding: const EdgeInsets.all(4),
                            constraints: const BoxConstraints(),
                            style: IconButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: AppColors.divider),
                    Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildInputGroup(
                            'Customer Name',
                            'customer',
                            'e.g. Acme Corporation',
                          ),
                          _buildInputGroup(
                            'Delivery Address',
                            'address',
                            'e.g. 123 Main St, Springfield, IL',
                          ),
                          _buildInputGroup(
                            'Time Window',
                            'timeWindow',
                            'e.g. 9:00 AM – 11:00 AM',
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: _buildInputGroup(
                                  'Packages',
                                  'packages',
                                  '',
                                  type: TextInputType.number,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Padding(
                                  padding: const EdgeInsets.only(bottom: 14),
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Priority',
                                        style: TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      DropdownButtonFormField<String>(
                                        initialValue: _newOrder['priority'],
                                        onChanged: (v) => setState(
                                          () => _newOrder['priority'] = v!,
                                        ),
                                        items: const [
                                          DropdownMenuItem(
                                            value: 'normal',
                                            child: Text('Normal'),
                                          ),
                                          DropdownMenuItem(
                                            value: 'high',
                                            child: Text('High'),
                                          ),
                                        ],
                                        decoration: InputDecoration(
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                horizontal: 12,
                                                vertical: 12,
                                              ),
                                          border: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                            borderSide: const BorderSide(
                                              color: AppColors.border,
                                            ),
                                          ),
                                          enabledBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                            borderSide: const BorderSide(
                                              color: AppColors.border,
                                            ),
                                          ),
                                          focusedBorder: OutlineInputBorder(
                                            borderRadius: BorderRadius.circular(
                                              8,
                                            ),
                                            borderSide: const BorderSide(
                                              color: AppColors.primary,
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
                          _buildInputGroup(
                            'Notes (optional)',
                            'notes',
                            'e.g. Leave at front desk, ring doorbell…',
                            maxLines: 2,
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: AppColors.divider),
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 16,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 1,
                            child: OutlinedButton(
                              onPressed: () =>
                                  setState(() => _showNewOrderModal = false),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.textSecondary,
                                side: const BorderSide(color: AppColors.border),
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              child: const Text('Cancel'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            flex: 2,
                            child: ElevatedButton.icon(
                              onPressed:
                                  (_newOrder['customer'].isEmpty ||
                                      _newOrder['address'].isEmpty)
                                  ? null
                                  : _handleSaveOrder,
                              icon: _orderSaved
                                  ? const Icon(Icons.check, size: 16)
                                  : const SizedBox(),
                              label: Text(
                                _orderSaved ? 'Order Created' : 'Create Order',
                              ),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _orderSaved
                                    ? const Color(0xFFECFDF5)
                                    : AppColors.primary,
                                foregroundColor: _orderSaved
                                    ? AppColors.success
                                    : AppColors.white,
                                disabledBackgroundColor: AppColors.primary
                                    .withValues(alpha: 0.5),
                                disabledForegroundColor: AppColors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                  side: _orderSaved
                                      ? const BorderSide(
                                          color: AppColors.success,
                                        )
                                      : BorderSide.none,
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
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
          ),
      ],
    );
  }

  Widget _buildInputGroup(
    String label,
    String key,
    String hint, {
    int maxLines = 1,
    TextInputType? type,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            initialValue: _newOrder[key],
            onChanged: (v) => setState(() => _newOrder[key] = v),
            maxLines: maxLines,
            keyboardType: type,
            style: const TextStyle(fontSize: 13),
            decoration: InputDecoration(
              hintText: hint,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.primary),
              ),
            ),
          ),
        ],
      ),
    );
  }

}
