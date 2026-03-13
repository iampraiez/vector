import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';

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

  Map<String, dynamic> _statusStyle(String status) {
    switch (status) {
      case 'completed':
        return {'bg': const Color(0xFFECFDF5), 'color': AppColors.success};
      case 'in-progress':
        return {
          'bg': const Color(0xFFEFF6FF),
          'color': const Color(0xFF3B82F6),
        };
      case 'assigned':
        return {
          'bg': const Color(0xFFFEF3C7),
          'color': const Color(0xFFD97706),
        };
      default:
        return {'bg': AppColors.surface, 'color': AppColors.textSecondary};
    }
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
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -0.48,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                _today,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            OutlinedButton.icon(
                              onPressed: () =>
                                  context.go('/dashboard/tracking'),
                              icon: const Icon(
                                Icons.cell_tower,
                                size: 16,
                                color: AppColors.success,
                              ),
                              label: const Text('Live Tracking'),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: AppColors.textPrimary,
                                side: const BorderSide(color: AppColors.border),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                                backgroundColor: AppColors.white,
                                elevation: 1,
                                shadowColor: const Color(0x0D000000),
                              ),
                            ),
                            const SizedBox(width: 10),
                            ElevatedButton.icon(
                              onPressed: () =>
                                  setState(() => _showNewOrderModal = true),
                              icon: const Icon(
                                Icons.add,
                                size: 16,
                                color: AppColors.white,
                              ),
                              label: const Text('New Order'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: AppColors.white,
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 14,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                textStyle: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                                elevation: 2,
                                shadowColor: const Color(0x4D059669),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Metrics
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: _metrics
                          .map(
                            (m) => SizedBox(
                              width: MediaQuery.of(context).size.width > 900
                                  ? (MediaQuery.of(context).size.width -
                                            252 -
                                            48 -
                                            36) /
                                        4
                                  : MediaQuery.of(context).size.width > 500
                                  ? (MediaQuery.of(context).size.width -
                                            48 -
                                            12) /
                                        2
                                  : double.infinity,
                              child: Container(
                                padding: const EdgeInsets.all(20),
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Container(
                                          width: 36,
                                          height: 36,
                                          decoration: BoxDecoration(
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                            color: AppColors.primaryLight,
                                          ),
                                          alignment: Alignment.center,
                                          child: Icon(
                                            m['icon'],
                                            size: 18,
                                            color: AppColors.primary,
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 7,
                                            vertical: 3,
                                          ),
                                          decoration: BoxDecoration(
                                            color: m['trend'] == 'up'
                                                ? const Color(0xFFECFDF5)
                                                : const Color(0xFFFEF2F2),
                                            borderRadius: BorderRadius.circular(
                                              6,
                                            ),
                                          ),
                                          child: Text(
                                            m['change'],
                                            style: TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: m['trend'] == 'up'
                                                  ? AppColors.success
                                                  : AppColors.error,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      m['label'],
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textSecondary,
                                        fontWeight: FontWeight.w500,
                                        letterSpacing: 0.5,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      m['value'],
                                      style: const TextStyle(
                                        fontSize: 28,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                        letterSpacing: -0.56,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          )
                          .toList(),
                    ),
                    const SizedBox(height: 20),

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
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Column(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                        20,
                                        18,
                                        20,
                                        14,
                                      ),
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
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                              const SizedBox(height: 1),
                                              Text(
                                                '${_activeDrivers.where((d) => d['status'] == 'active').length} on delivery right now',
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  color:
                                                      AppColors.textSecondary,
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
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text('View all'),
                                                Icon(
                                                  Icons.chevron_right,
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
                                    Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Column(
                                        children: _activeDrivers
                                            .map(
                                              (driver) => InkWell(
                                                onTap: () => context.go(
                                                  '/dashboard/tracking',
                                                ),
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                                child: Padding(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 12,
                                                        vertical: 10,
                                                      ),
                                                  child: Row(
                                                    children: [
                                                      Stack(
                                                        children: [
                                                          Container(
                                                            width: 36,
                                                            height: 36,
                                                            decoration: BoxDecoration(
                                                              borderRadius:
                                                                  BorderRadius.circular(
                                                                    18,
                                                                  ),
                                                              color: AppColors
                                                                  .primaryLight,
                                                            ),
                                                            alignment: Alignment
                                                                .center,
                                                            child: Text(
                                                              (driver['name']
                                                                      as String)
                                                                  .split(' ')
                                                                  .map(
                                                                    (n) => n[0],
                                                                  )
                                                                  .join(''),
                                                              style: const TextStyle(
                                                                fontSize: 12,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w700,
                                                                color: AppColors
                                                                    .primary,
                                                              ),
                                                            ),
                                                          ),
                                                          Positioned(
                                                            bottom: 0,
                                                            right: 0,
                                                            child: Container(
                                                              width: 10,
                                                              height: 10,
                                                              decoration: BoxDecoration(
                                                                color:
                                                                    driver['status'] ==
                                                                        'active'
                                                                    ? const Color(
                                                                        0xFF10B981,
                                                                      )
                                                                    : AppColors
                                                                          .warning,
                                                                shape: BoxShape
                                                                    .circle,
                                                                border: Border.all(
                                                                  color:
                                                                      AppColors
                                                                          .white,
                                                                  width: 2,
                                                                ),
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                      const SizedBox(width: 12),
                                                      Expanded(
                                                        child: Column(
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Text(
                                                              driver['name'],
                                                              style: const TextStyle(
                                                                fontSize: 13,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                color: AppColors
                                                                    .textPrimary,
                                                              ),
                                                            ),
                                                            const SizedBox(
                                                              height: 2,
                                                            ),
                                                            Row(
                                                              children: [
                                                                const Icon(
                                                                  Icons
                                                                      .location_on_outlined,
                                                                  size: 12,
                                                                  color: AppColors
                                                                      .textSecondary,
                                                                ),
                                                                Text(
                                                                  ' ${driver['location']} ',
                                                                  style: const TextStyle(
                                                                    fontSize:
                                                                        12,
                                                                    color: AppColors
                                                                        .textSecondary,
                                                                  ),
                                                                ),
                                                                const Text(
                                                                  '·',
                                                                  style: TextStyle(
                                                                    color: AppColors
                                                                        .border,
                                                                  ),
                                                                ),
                                                                Text(
                                                                  ' ${driver['stops']} stops',
                                                                  style: const TextStyle(
                                                                    fontSize:
                                                                        12,
                                                                    color: AppColors
                                                                        .textSecondary,
                                                                  ),
                                                                ),
                                                              ],
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                      Row(
                                                        children: [
                                                          const Icon(
                                                            Icons.schedule,
                                                            size: 12,
                                                            color: AppColors
                                                                .textMuted,
                                                          ),
                                                          const SizedBox(
                                                            width: 4,
                                                          ),
                                                          Text(
                                                            driver['eta'],
                                                            style: const TextStyle(
                                                              fontSize: 12,
                                                              fontWeight:
                                                                  FontWeight
                                                                      .w500,
                                                              color: AppColors
                                                                  .textSecondary,
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            )
                                            .toList(),
                                      ),
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
                                  border: Border.all(color: AppColors.border),
                                ),
                                child: Column(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                        20,
                                        18,
                                        20,
                                        14,
                                      ),
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
                                                  fontSize: 15,
                                                  fontWeight: FontWeight.w600,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                              const SizedBox(height: 1),
                                              const Text(
                                                'Latest deliveries and status',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color:
                                                      AppColors.textSecondary,
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
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            child: const Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                                Text('View all'),
                                                Icon(
                                                  Icons.chevron_right,
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
                                    Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: Column(
                                        children: _recentOrders.map((order) {
                                          var s = _statusStyle(order['status']);
                                          return InkWell(
                                            onTap: () =>
                                                context.go('/dashboard/orders'),
                                            borderRadius: BorderRadius.circular(
                                              10,
                                            ),
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 12,
                                                    vertical: 10,
                                                  ),
                                              child: Row(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.center,
                                                children: [
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Row(
                                                          children: [
                                                            Text(
                                                              order['id'],
                                                              style: const TextStyle(
                                                                fontSize: 13,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w600,
                                                                color: AppColors
                                                                    .textPrimary,
                                                              ),
                                                            ),
                                                            const SizedBox(
                                                              width: 8,
                                                            ),
                                                            Container(
                                                              padding:
                                                                  const EdgeInsets.symmetric(
                                                                    horizontal:
                                                                        6,
                                                                    vertical: 2,
                                                                  ),
                                                              decoration: BoxDecoration(
                                                                color:
                                                                    s['bg']
                                                                        as Color,
                                                                borderRadius:
                                                                    BorderRadius.circular(
                                                                      5,
                                                                    ),
                                                              ),
                                                              child: Text(
                                                                order['status'],
                                                                style: TextStyle(
                                                                  fontSize: 11,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                  color:
                                                                      s['color']
                                                                          as Color,
                                                                ),
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                        const SizedBox(
                                                          height: 3,
                                                        ),
                                                        Text(
                                                          '${order['customer']} — ${order['address']}',
                                                          style: const TextStyle(
                                                            fontSize: 12,
                                                            color: AppColors
                                                                .textSecondary,
                                                          ),
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  Row(
                                                    children: [
                                                      const Icon(
                                                        Icons.schedule,
                                                        size: 12,
                                                        color:
                                                            AppColors.textMuted,
                                                      ),
                                                      const SizedBox(width: 4),
                                                      Text(
                                                        order['time'],
                                                        style: const TextStyle(
                                                          fontSize: 11,
                                                          color: AppColors
                                                              .textMuted,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          );
                                        }).toList(),
                                      ),
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
