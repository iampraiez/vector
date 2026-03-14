import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';

class DashboardReportsScreen extends StatefulWidget {
  const DashboardReportsScreen({super.key});

  @override
  State<DashboardReportsScreen> createState() => _DashboardReportsScreenState();
}

class _DashboardReportsScreenState extends State<DashboardReportsScreen> {
  String _activePeriod = 'Last 7 days';
  final List<String> _periods = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];

  final List<Map<String, dynamic>> _kpis = [
    {'label': 'Total Deliveries', 'value': '1,247', 'change': '+12.5%', 'trend': 'up', 'icon': Icons.local_shipping},
    {'label': 'On-Time Rate', 'value': '94.2%', 'change': '+3.1%', 'trend': 'up', 'icon': Icons.schedule},
    {'label': 'Avg. Delivery Time', 'value': '38 min', 'change': '-8.2%', 'trend': 'down', 'icon': Icons.location_on},
    {'label': 'Distance Saved', 'value': '342 km', 'change': '+15.7%', 'trend': 'up', 'icon': Icons.attach_money},
  ];

  final List<Map<String, dynamic>> _driverPerformance = [
    {'name': 'Mike Johnson', 'deliveries': 156, 'rating': 5.0, 'onTime': 98, 'color': const Color(0xFF059669)},
    {'name': 'Alex Rivera', 'deliveries': 142, 'rating': 4.9, 'onTime': 95, 'color': const Color(0xFF34D399)},
    {'name': 'Sarah Chen', 'deliveries': 138, 'rating': 4.8, 'onTime': 93, 'color': const Color(0xFF6EE7B7)},
    {'name': 'Emma Davis', 'deliveries': 124, 'rating': 4.7, 'onTime': 91, 'color': const Color(0xFFA7F3D0)},
  ];

  final List<Map<String, dynamic>> _summaryRows = [
    {'metric': 'Total Distance', 'current': '1,842 km', 'previous': '1,956 km', 'change': '-5.8%', 'positive': true},
    {'metric': 'Avg. Fuel Cost', 'current': '\$0.46/km', 'previous': '\$0.47/km', 'change': '-2.1%', 'positive': true},
    {'metric': 'Deliveries Completed', 'current': '342', 'previous': '318', 'change': '+7.5%', 'positive': true},
    {'metric': 'Average Stop Time', 'current': '4.2 min', 'previous': '4.8 min', 'change': '-12.5%', 'positive': true},
    {'metric': 'Failed Deliveries', 'current': '8', 'previous': '14', 'change': '-42.9%', 'positive': true},
    {'metric': 'Customer Rating', 'current': '4.85 ★', 'previous': '4.72 ★', 'change': '+2.7%', 'positive': true},
  ];

  @override
  Widget build(BuildContext context) {
    return DashboardLayout(
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Reports & Analytics', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary, letterSpacing: -0.5)),
                        SizedBox(height: 4),
                        Text('Performance insights across your fleet', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                      ],
                    ),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(3),
                          decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)),
                          child: Row(
                            children: _periods.take(3).map((p) => InkWell(
                              onTap: () => setState(() => _activePeriod = p),
                              borderRadius: BorderRadius.circular(7),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(color: _activePeriod == p ? AppColors.primary : Colors.transparent, borderRadius: BorderRadius.circular(7)),
                                child: Text(p.replaceAll('Last ', ''), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: _activePeriod == p ? Colors.white : AppColors.textSecondary)),
                              ),
                            )).toList(),
                          ),
                        ),
                        const SizedBox(width: 10),
                        ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.download, size: 16),
                          label: const Text('Export'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                        )
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 28),

                // KPI Cards
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: _kpis
                      .map(
                        (kpi) => SizedBox(
                          width: MediaQuery.of(context).size.width > 900
                              ? (MediaQuery.of(context).size.width -
                                        252 -
                                        48 -
                                        48) /
                                    4
                              : MediaQuery.of(context).size.width > 600
                              ? (MediaQuery.of(context).size.width - 48 - 16) /
                                    2
                              : double.infinity,
                          child: Container(
                            padding: const EdgeInsets.all(28),
                            decoration: BoxDecoration(
                              color: AppColors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.divider),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 16,
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
                                      width: 42,
                                      height: 42,
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryLight,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Icon(
                                        kpi['icon'],
                                        size: 20,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFECFDF5),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            kpi['trend'] == 'up'
                                                ? Icons.trending_up_rounded
                                                : Icons.trending_down_rounded,
                                            size: 14,
                                            color: const Color(0xFF10B981),
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            kpi['change'],
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w700,
                                              color: Color(0xFF10B981),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  kpi['label'],
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.textMuted,
                                    letterSpacing: 0.2,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  kpi['value'],
                                  style: const TextStyle(
                                    fontSize: 28,
                                    fontWeight: FontWeight.w800,
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
                const SizedBox(height: 16),

                // Charts Row
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 2,
                      child: _buildChartPlaceholder('Deliveries Over Time', 'Total vs on-time deliveries this week'),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 1,
                      child: _buildChartPlaceholder('Monthly Volume', 'Deliveries per month'),
                    )
                  ],
                ),
                const SizedBox(height: 16),

                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 1,
                      child: _buildChartPlaceholder('Delivery Status', 'Current period breakdown'),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 1,
                      child: Container(
                        padding: const EdgeInsets.all(28),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.divider),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Driver Performance', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                            const SizedBox(height: 4),
                            const Text('Deliveries & rating this period', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            const SizedBox(height: 16),
                            ..._driverPerformance.map((driver) => Padding(
                              padding: const EdgeInsets.only(bottom: 14),
                              child: Column(
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Row(
                                        children: [
                                          Container(width: 28, height: 28, decoration: BoxDecoration(color: driver['color'], shape: BoxShape.circle), alignment: Alignment.center, child: Text((driver['name'] as String).split(' ').map((n) => n[0]).join(''), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white))),
                                          const SizedBox(width: 8),
                                          Text(driver['name'], style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          const Icon(Icons.star, size: 12, color: Color(0xFFFBBF24)),
                                          const SizedBox(width: 4),
                                          Text(driver['rating'].toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                          const SizedBox(width: 4),
                                          Text(driver['deliveries'].toString(), style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                        ],
                                      )
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  LinearProgressIndicator(value: driver['deliveries'] / 160, backgroundColor: AppColors.surface, color: driver['color'], minHeight: 4, borderRadius: BorderRadius.circular(99))
                                ],
                              ),
                            ))
                          ],
                        ),
                      )
                    )
                  ],
                ),
                const SizedBox(height: 16),

                // Summary Table
                Container(
                  decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(14)),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Route Efficiency Summary', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                            Row(children: const [Icon(Icons.calendar_month, size: 14, color: AppColors.textMuted), SizedBox(width: 6), Text('vs last period', style: TextStyle(fontSize: 12, color: AppColors.textSecondary))])
                          ],
                        ),
                      ),
                      const Divider(height: 1, color: AppColors.divider),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          headingRowColor: WidgetStateProperty.all(AppColors.surface),
                          dataRowMaxHeight: 56,
                          dataRowMinHeight: 56,
                          columns: const [
                            DataColumn(label: Text('METRIC', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5))),
                            DataColumn(label: Text('THIS PERIOD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5))),
                            DataColumn(label: Text('LAST PERIOD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5))),
                            DataColumn(label: Text('CHANGE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.5))),
                          ],
                          rows: _summaryRows.map((row) => DataRow(
                            cells: [
                                    DataCell(
                                      Text(
                                        row['metric'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        row['current'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Text(
                                        row['previous'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: row['positive']
                                              ? const Color(0xFFECFDF5)
                                              : const Color(0xFFFEF2F2),
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(
                                              row['positive']
                                                  ? Icons.trending_up_rounded
                                                  : Icons.trending_down_rounded,
                                              size: 14,
                                              color: row['positive']
                                                  ? const Color(0xFF10B981)
                                                  : const Color(0xFFEF4444),
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              row['change'],
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w700,
                                                color: row['positive']
                                                    ? const Color(0xFF10B981)
                                                    : const Color(0xFFEF4444),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                          )).toList(),
                        ),
                      )
                    ],
                  ),
                )
              ],
            ),
          ),
        ),
      )
    );
  }

  Widget _buildChartPlaceholder(String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 16),
          Container(
            height: 240, width: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppColors.surface, AppColors.surface.withValues(alpha: 0.5)],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.divider.withValues(alpha: 0.5)),
            ),
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _GridPainter(),
                  ),
                ),
                const Center(
                  child: Text(
                    'Chart Component Placeholder\n(Requires additional chart package like fl_chart)',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.divider.withValues(alpha: 0.1)
      ..strokeWidth = 1;

    const verticalCount = 8;
    const horizontalCount = 6;

    for (var i = 1; i < verticalCount; i++) {
      final x = size.width * (i / verticalCount);
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    for (var i = 1; i < horizontalCount; i++) {
      final y = size.height * (i / horizontalCount);
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
