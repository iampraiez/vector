import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';
import 'widgets/dashboard_status_badge.dart';
import '../../shared/widgets/empty_state.dart';

class DashboardDriversScreen extends StatefulWidget {
  const DashboardDriversScreen({super.key});

  @override
  State<DashboardDriversScreen> createState() => _DashboardDriversScreenState();
}

class _DashboardDriversScreenState extends State<DashboardDriversScreen> {
  String _searchQuery = '';
  String _viewMode = 'board';

  final List<Map<String, dynamic>> _drivers = [
    {
      'id': 1,
      'name': 'Alex Rivera',
      'email': 'alex.rivera@email.com',
      'phone': '+1 (555) 123-4567',
      'vehicle': 'Van • ABC-1234',
      'todayStops': 4,
      'completedRoutes': 234,
      'rating': 4.9,
      'status': 'active',
      'lastSession': '2 min ago',
      'companyCode': 'FLEET-2024',
    },
    {
      'id': 2,
      'name': 'Sarah Chen',
      'email': 'sarah.chen@email.com',
      'phone': '+1 (555) 234-5678',
      'vehicle': 'Truck • XYZ-5678',
      'todayStops': 6,
      'completedRoutes': 189,
      'rating': 4.8,
      'status': 'active',
      'lastSession': '5 min ago',
      'companyCode': 'FLEET-2024',
    },
    {
      'id': 3,
      'name': 'Mike Johnson',
      'email': 'mike.j@email.com',
      'phone': '+1 (555) 345-6789',
      'vehicle': 'Van • DEF-9012',
      'todayStops': 3,
      'completedRoutes': 412,
      'rating': 5.0,
      'status': 'active',
      'lastSession': '1 min ago',
      'companyCode': 'FLEET-2024',
    },
    {
      'id': 4,
      'name': 'Emma Davis',
      'email': 'emma.d@email.com',
      'phone': '+1 (555) 456-7890',
      'vehicle': 'Car • GHI-3456',
      'todayStops': 0,
      'completedRoutes': 156,
      'rating': 4.7,
      'status': 'offline',
      'lastSession': '2 hours ago',
      'companyCode': 'FLEET-2024',
    },
  ];

  void _handleRemoveDriver(int id, String name) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Driver'),
        content: Text('Are you sure you want to remove $name from your fleet?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              setState(() => _drivers.removeWhere((d) => d['id'] == id));
              Navigator.pop(context);
            },
            child: const Text(
              'Remove',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredDrivers = _drivers
        .where(
          (d) =>
              d['name'].toString().toLowerCase().contains(
                _searchQuery.toLowerCase(),
              ) ||
              d['email'].toString().toLowerCase().contains(
                _searchQuery.toLowerCase(),
              ),
        )
        .toList();

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
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Fleet Drivers',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            letterSpacing: -1,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Monitor and manage your delivery team in real-time',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      height: 44,
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.divider),
                      ),
                      child: Row(
                        children: [
                          _buildViewToggle(
                            'board',
                            Icons.grid_view_rounded,
                            'Board',
                          ),
                          _buildViewToggle(
                            'list',
                            Icons.format_list_bulleted_rounded,
                            'List',
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Stats
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Total Drivers',
                        '4',
                        Icons.people_alt_rounded,
                        AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'Active Now',
                        '3',
                        Icons.check_circle_rounded,
                        AppColors.success,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'Total Routes',
                        '991',
                        Icons.route_rounded,
                        const Color(0xFF8B5CF6),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'Avg Rating',
                        '4.8',
                        Icons.star_rounded,
                        const Color(0xFFF59E0B),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // Search
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.divider),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.03),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: TextField(
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    decoration: InputDecoration(
                      hintText: 'Search drivers by name, email or vehicle...',
                      fillColor: AppColors.surface,
                      filled: true,
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                      hintStyle: TextStyle(
                        color: AppColors.textSecondary.withValues(alpha: 0.5),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Drivers view
                if (filteredDrivers.isEmpty)
                  const EmptyState(
                    title: 'No drivers found',
                    message: 'Try adjusting your search query or add a new driver to your fleet.',
                    icon: Icons.person_search_outlined,
                  )
                else if (_viewMode == 'board')
                  Wrap(
                    spacing: 24,
                    runSpacing: 24,
                    children: filteredDrivers
                        .map(
                          (driver) => SizedBox(
                            width: MediaQuery.of(context).size.width > 900
                                ? (MediaQuery.of(context).size.width -
                                          252 -
                                          48 -
                                          48) /
                                      3
                                : MediaQuery.of(context).size.width > 600
                                ? (MediaQuery.of(context).size.width -
                                          48 -
                                          24) /
                                      2
                                : double.infinity,
                            child: MouseRegion(
                              cursor: SystemMouseCursors.click,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.all(24),
                                decoration: BoxDecoration(
                                  color: AppColors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(color: AppColors.border),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withValues(
                                        alpha: 0.02,
                                      ),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ],
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.stretch,
                                  children: [
                                    Row(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Stack(
                                          children: [
                                            Container(
                                              width: 52,
                                              height: 52,
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(14),
                                                gradient: LinearGradient(
                                                  colors: [
                                                    AppColors.surface,
                                                    const Color(0xFFF1F5F9),
                                                  ],
                                                  begin: Alignment.topLeft,
                                                  end: Alignment.bottomRight,
                                                ),
                                                border: Border.all(
                                                  color: AppColors.divider,
                                                ),
                                              ),
                                              alignment: Alignment.center,
                                              child: Text(
                                                (driver['name'] as String)
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join(''),
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.w800,
                                                  color:
                                                      AppColors.textPrimary,
                                                ),
                                              ),
                                            ),
                                            if (driver['status'] == 'active')
                                              Positioned(
                                                bottom: 0,
                                                right: 0,
                                                child: Container(
                                                  width: 16,
                                                  height: 16,
                                                  decoration: BoxDecoration(
                                                    color: AppColors.success,
                                                    shape: BoxShape.circle,
                                                    border: Border.all(
                                                      color: AppColors.white,
                                                      width: 3,
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
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                driver['name'],
                                                style: const TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w800,
                                                  color: AppColors.textPrimary,
                                                  letterSpacing: -0.4,
                                                ),
                                              ),
                                              const SizedBox(height: 6),
                                              DashboardStatusBadge(
                                                label: driver['status'],
                                                type: DashboardStatusBadgeType.status,
                                                size: DashboardStatusBadgeSize.small,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 24),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 16,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.surface.withValues(
                                          alpha: 0.5,
                                        ),
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                          color: AppColors.divider,
                                        ),
                                      ),
                                      child: Column(
                                        children: [
                                          _buildContactRow(
                                            Icons.email_outlined,
                                            driver['email'],
                                          ),
                                          const SizedBox(height: 12),
                                          _buildContactRow(
                                            Icons.phone_outlined,
                                            driver['phone'],
                                          ),
                                          const SizedBox(height: 12),
                                          _buildContactRow(
                                            Icons.local_shipping_outlined,
                                            driver['vehicle'],
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(height: 24),
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceEvenly,
                                      children: [
                                        _buildMiniStat(
                                          driver['todayStops'].toString(),
                                          'Today',
                                        ),
                                        Container(
                                          width: 1,
                                          height: 24,
                                          color: AppColors.divider,
                                        ),
                                        _buildMiniStat(
                                          driver['completedRoutes'].toString(),
                                          'Routes',
                                        ),
                                        Container(
                                          width: 1,
                                          height: 24,
                                          color: AppColors.divider,
                                        ),
                                        _buildMiniStat(
                                          driver['rating'].toString(),
                                          'Rating',
                                          isRating: true,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 24),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: OutlinedButton(
                                            onPressed: () => context.go(
                                              '/dashboard/driver-detail',
                                            ),
                                            style: OutlinedButton.styleFrom(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    vertical: 14,
                                                  ),
                                              side: const BorderSide(
                                                color: AppColors.divider,
                                              ),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(14),
                                              ),
                                            ),
                                            child: const Text(
                                              'View Details',
                                              style: TextStyle(
                                                fontSize: 13,
                                                fontWeight: FontWeight.w700,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        IconButton(
                                          onPressed: () => _handleRemoveDriver(
                                            driver['id'],
                                            driver['name'],
                                          ),
                                          icon: const Icon(
                                            Icons.delete_outline_rounded,
                                            size: 20,
                                            color: AppColors.error,
                                          ),
                                          style: IconButton.styleFrom(
                                            backgroundColor: const Color(
                                              0xFFFEF2F2,
                                            ),
                                            padding: const EdgeInsets.all(12),
                                            shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        )
                        .toList(),
                  ),

                if (_viewMode == 'list')
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.divider),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingRowColor: WidgetStateProperty.all(
                          AppColors.surface,
                        ),
                        dataRowMinHeight: 72,
                        dataRowMaxHeight: 72,
                        showBottomBorder: true,
                        horizontalMargin: 24,
                        columnSpacing: 32,
                        showCheckboxColumn: false,
                        columns: const [
                          DataColumn(
                            label: Text(
                              'DRIVER',
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
                              'VEHICLE',
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
                              'TODAY',
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
                              'ROUTES',
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
                              'RATING',
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
                              'LAST SEEN',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textSecondary,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          DataColumn(label: Text('')),
                        ],
                        rows: filteredDrivers
                            .map(
                              (driver) => DataRow(
                                onSelectChanged: (_) =>
                                    context.go('/dashboard/driver-detail'),
                                cells: [
                                  DataCell(
                                    Row(
                                      children: [
                                        Stack(
                                          children: [
                                            Container(
                                              width: 40,
                                              height: 40,
                                              decoration: BoxDecoration(
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                color: AppColors.surface,
                                                border: Border.all(
                                                  color: AppColors.divider,
                                                ),
                                              ),
                                              alignment: Alignment.center,
                                              child: Text(
                                                (driver['name'] as String)
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join(''),
                                                style: const TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w800,
                                                  color: AppColors.textPrimary,
                                                ),
                                              ),
                                            ),
                                            if (driver['status'] == 'active')
                                              Positioned(
                                                bottom: 0,
                                                right: 0,
                                                child: Container(
                                                  width: 12,
                                                  height: 12,
                                                  decoration: BoxDecoration(
                                                    color: AppColors.success,
                                                    shape: BoxShape.circle,
                                                    border: Border.all(
                                                      color: AppColors.white,
                                                      width: 2.5,
                                                    ),
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                        const SizedBox(width: 12),
                                        Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              driver['name'],
                                              style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                            Text(
                                              driver['email'],
                                              style: TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.w500,
                                                color: AppColors.textSecondary
                                                    .withValues(alpha: 0.6),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                  DataCell(
                                    Text(
                                      driver['vehicle'],
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
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
                                          driver['todayStops'].toString(),
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        const Text(
                                          'stops today',
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w600,
                                            color: AppColors.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  DataCell(
                                    Text(
                                      driver['completedRoutes'].toString(),
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    Row(
                                      children: [
                                        const Icon(
                                          Icons.star_rounded,
                                          size: 16,
                                          color: Color(0xFFF59E0B),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          driver['rating'].toString(),
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w700,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  DataCell(
                                    Text(
                                      driver['lastSession'],
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    IconButton(
                                      onPressed: () => _handleRemoveDriver(
                                        driver['id'],
                                        driver['name'],
                                      ),
                                      icon: const Icon(
                                        Icons.more_vert_rounded,
                                        size: 20,
                                        color: AppColors.textMuted,
                                      ),
                                      style: IconButton.styleFrom(
                                        hoverColor: AppColors.surface,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            )
                            .toList(),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildViewToggle(String mode, IconData icon, String label) {
    bool active = _viewMode == mode;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => setState(() => _viewMode = mode),
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: active ? AppColors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: active
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color: active ? AppColors.primary : AppColors.textSecondary,
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: active ? FontWeight.w800 : FontWeight.w600,
                  color: active ? AppColors.primary : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
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
          const SizedBox(height: 16),
          Text(
            value,
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
              letterSpacing: -1,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, size: 15, color: AppColors.textMuted),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMiniStat(String value, String label, {bool isRating = false}) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (isRating) ...[
              const Icon(
                Icons.star_rounded,
                size: 16,
                color: Color(0xFFFBBF24),
              ),
              const SizedBox(width: 4),
            ],
            Text(
              value,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                letterSpacing: -0.36,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: AppColors.textMuted,
          ),
        ),
      ],
    );
  }
}
