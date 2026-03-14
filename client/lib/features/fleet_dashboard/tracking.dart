import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';
import 'widgets/dashboard_status_badge.dart';

class DashboardTrackingScreen extends StatefulWidget {
  const DashboardTrackingScreen({super.key});

  @override
  State<DashboardTrackingScreen> createState() => _DashboardTrackingScreenState();
}

class _DashboardTrackingScreenState extends State<DashboardTrackingScreen> {
  Map<String, dynamic>? _selectedDriver;

  final List<Map<String, dynamic>> _drivers = [
    {
      'id': 1, 'name': 'Alex Rivera', 'status': 'active', 'currentLocation': '742 Evergreen Terrace, Springfield',
      'lat': 39.7817, 'lng': -89.6501, 'currentOrder': 'DEL-001', 'nextStop': '1428 Elm Street',
      'completedToday': 3, 'remainingStops': 4, 'lastUpdate': '1 min ago', 'phone': '+1 (555) 123-4567'
    },
    {
      'id': 2, 'name': 'Sarah Chen', 'status': 'active', 'currentLocation': '890 Oak Avenue, Springfield',
      'lat': 39.7892, 'lng': -89.6535, 'currentOrder': 'DEL-002', 'nextStop': '456 Park Lane',
      'completedToday': 5, 'remainingStops': 2, 'lastUpdate': '2 min ago', 'phone': '+1 (555) 234-5678'
    },
    {
      'id': 3, 'name': 'Mike Johnson', 'status': 'idle', 'currentLocation': 'Depot - 100 Main St, Springfield',
      'lat': 39.7990, 'lng': -89.6440, 'completedToday': 8, 'remainingStops': 0, 'lastUpdate': '5 min ago', 'phone': '+1 (555) 345-6789'
    },
    {
      'id': 4, 'name': 'Emma Davis', 'status': 'offline', 'currentLocation': 'Unknown',
      'lat': 39.7800, 'lng': -89.6500, 'completedToday': 0, 'remainingStops': 0, 'lastUpdate': '2 hours ago', 'phone': '+1 (555) 456-7890'
    },
  ];

  Color _getStatusColor(String status) {
    switch (status) {
      case 'active': return const Color(0xFF059669);
      case 'idle': return const Color(0xFFF59E0B);
      case 'offline': return const Color(0xFF9CA3AF);
      default: return const Color(0xFF9CA3AF);
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'active': return 'On Delivery';
      case 'idle': return 'Idle';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeDrivers = _drivers.where((d) => d['status'] == 'active').toList();
    final bool isMobile = MediaQuery.of(context).size.width < 768;

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
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Live Tracking',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Monitor your fleet and driver routes in real-time',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // Stats
                LayoutBuilder(
                  builder: (context, constraints) {
                    final itemWidth = (constraints.maxWidth - (24 * 3)) / 4;
                    return Wrap(
                      spacing: 24,
                      runSpacing: 24,
                      children: [
                        _buildStatCard(
                          'Active Drivers',
                          activeDrivers.length,
                          total: _drivers.length,
                          icon: Icons.local_shipping_rounded,
                          color: AppColors.success,
                          width: itemWidth,
                        ),
                        _buildStatCard(
                          'Total Deliveries',
                          _drivers.fold<int>(
                            0,
                            (sum, d) => sum + (d['completedToday'] as int),
                          ),
                          icon: Icons.check_circle_rounded,
                          color: AppColors.primary,
                          width: itemWidth,
                        ),
                        _buildStatCard(
                          'Remaining Stops',
                          _drivers.fold<int>(
                            0,
                            (sum, d) => sum + (d['remainingStops'] as int),
                          ),
                          icon: Icons.timer_rounded,
                          color: const Color(0xFFF59E0B),
                          width: itemWidth,
                        ),
                        _buildStatCard(
                          'Completion Rate',
                          '94%',
                          icon: Icons.analytics_rounded,
                          color: const Color(0xFF8B5CF6),
                          width: itemWidth,
                        ),
                      ],
                    );
                  },
                ),
                const SizedBox(height: 32),

                // Map + Detail Panel
                Flex(
                  direction: isMobile ? Axis.vertical : Axis.horizontal,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Map Area
                    Flexible(
                      flex: (_selectedDriver != null && !isMobile) ? 2 : 1,
                      child: Container(
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
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 24,
                                vertical: 20,
                              ),
                              decoration: const BoxDecoration(
                                border: Border(
                                  bottom: BorderSide(color: AppColors.divider),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withValues(
                                            alpha: 0.1,
                                          ),
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: const Icon(
                                          Icons.map_rounded,
                                          size: 18,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Text(
                                        _selectedDriver != null
                                            ? "${_selectedDriver!['name']}'s Route"
                                            : 'Fleet Overview Map',
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (_selectedDriver != null)
                                    TextButton.icon(
                                      onPressed: () => setState(
                                        () => _selectedDriver = null,
                                      ),
                                      icon: const Icon(
                                        Icons.close_rounded,
                                        size: 16,
                                      ),
                                      label: const Text('Clear Selection'),
                                      style: TextButton.styleFrom(
                                        foregroundColor:
                                            AppColors.textSecondary,
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 12,
                                          vertical: 8,
                                        ),
                                        textStyle: const TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                    )
                                ],
                              ),
                            ),
                            Container(
                              height: isMobile ? 300 : 540,
                              color: AppColors.surface,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Map Background Grid (Mock)
                                  Positioned.fill(
                                    child: CustomPaint(
                                      painter: MapGridPainter(),
                                    ),
                                  ),
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(16),
                                        decoration: BoxDecoration(
                                          color: AppColors.white,
                                          shape: BoxShape.circle,
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withValues(
                                                alpha: 0.05,
                                              ),
                                              blurRadius: 10,
                                            ),
                                          ],
                                        ),
                                        child: const Icon(
                                          Icons.near_me_rounded,
                                          size: 32,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                      const SizedBox(height: 16),
                                      const Text(
                                        'Live Fleet Map',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Showing ${_selectedDriver != null ? '1 driver route' : '${activeDrivers.length} active drivers'}',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (_selectedDriver == null)
                                    ...List.generate(activeDrivers.length, (index) {
                                      final driver = activeDrivers[index];
                                      return Positioned(
                                        left:
                                            MediaQuery.of(context).size.width *
                                                0.15 +
                                            (index * 90),
                                        top: 120 + (index * 45),
                                        child: _buildMapMarker(driver),
                                      );
                                    })
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    ),
                    if (!isMobile && _selectedDriver != null) const SizedBox(width: 24),
                    if (!isMobile && _selectedDriver != null)
                      Flexible(
                        flex: 1,
                        child: Container(
                          padding: const EdgeInsets.all(32),
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
                          child: _buildDriverDetailPanel(_selectedDriver!),
                        ),
                      )
                  ],
                ),
                if (isMobile && _selectedDriver != null) const SizedBox(height: 24),
                if (isMobile && _selectedDriver != null)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Driver Details', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                            IconButton(onPressed: () => setState(() => _selectedDriver = null), icon: const Icon(Icons.close, size: 18, color: AppColors.textMuted)),
                          ],
                        ),
                        _buildDriverDetailPanel(_selectedDriver!),
                      ],
                    ),
                  ),

                const SizedBox(height: 32),

                // All Drivers Section Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'All Drivers',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.5,
                      ),
                    ),
                    Text(
                      '${_drivers.length} TOTAL',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMuted,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 24,
                  runSpacing: 24,
                  children: _drivers.map((driver) {
                    final bool isSelected =
                        _selectedDriver?['id'] == driver['id'];
                    return SizedBox(
                      width: MediaQuery.of(context).size.width > 1200
                          ? (MediaQuery.of(context).size.width -
                                    256 -
                                    48 -
                                    48) /
                                3
                          : MediaQuery.of(context).size.width > 800
                          ? (MediaQuery.of(context).size.width - 48 - 24) / 2
                          : double.infinity,
                      child: InkWell(
                        onTap: () => setState(() => _selectedDriver = driver),
        borderRadius: BorderRadius.circular(14),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: AppColors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.primary
                                  : AppColors.divider,
                              width: isSelected ? 2 : 1,
                            ),
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
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 44,
                                        height: 44,
                                        decoration: BoxDecoration(
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          color: _getStatusColor(
                                            driver['status'] as String,
                                          ).withValues(alpha: 0.15),
                                        ),
                                        alignment: Alignment.center,
                                        child: Icon(
                                          Icons.local_shipping_rounded,
                                          size: 20,
                                          color: _getStatusColor(
                                            driver['status'] as String,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            driver['name'],
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.w700,
                                              color: AppColors.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            _getStatusLabel(
                                              driver['status'] as String,
                                            ),
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w800,
                                              color: _getStatusColor(
                                                driver['status'] as String,
                                              ),
                                              letterSpacing: 0.2,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                  Icon(
                                    Icons.arrow_forward_ios_rounded,
                                    size: 14,
                                    color: isSelected
                                        ? AppColors.primary
                                        : AppColors.textMuted,
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              Container(
                                padding: const EdgeInsets.only(top: 20),
                                decoration: const BoxDecoration(
                                  border: Border(
                                    top: BorderSide(color: AppColors.divider),
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: _buildMiniStat(
                                        'COMPLETED',
                                        driver['completedToday'].toString(),
                                      ),
                                    ),
                                    Expanded(
                                      child: _buildMiniStat(
                                        'REMAINING',
                                        driver['remainingStops'].toString(),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                )
              ],
            ),
          ),
        ),
      )
    );
  }

  Widget _buildDriverDetailPanel(Map<String, dynamic> driver) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Driver Live Status',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            DashboardStatusBadge(
              label: driver['status'],
              type: DashboardStatusBadgeType.status,
              size: DashboardStatusBadgeSize.small,
            ),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.divider),
          ),
          child: Column(
            children: [
              Row(
                children: [
                  Container(
                    width: 52,
                    height: 52,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(16),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          _getStatusColor(driver['status']),
                          _getStatusColor(
                            driver['status'],
                          ).withValues(alpha: 0.7),
                        ],
                      ),
                    ),
                    alignment: Alignment.center,
                    child: const Icon(
                      Icons.person_rounded,
                      size: 24,
                      color: AppColors.white,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          driver['name'],
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'ID: DRV-00${driver['id']}',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary.withValues(
                              alpha: 0.6,
                            ),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  _buildPanelInfo(Icons.phone_rounded, driver['phone']),
                  const SizedBox(width: 16),
                  _buildPanelInfo(Icons.update_rounded, driver['lastUpdate']),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: _buildProgressStat(
                'Completed',
                driver['completedToday'].toString(),
                AppColors.success,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildProgressStat(
                'Remaining',
                driver['remainingStops'].toString(),
                const Color(0xFFF59E0B),
              ),
            ),
          ],
        ),
        const SizedBox(height: 28),
        _buildLocationLabel('CURRENT LOCATION'),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.white,
            border: Border.all(color: AppColors.divider),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(
                Icons.location_on_rounded,
                size: 18,
                color: AppColors.primary,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  driver['currentLocation'],
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (driver['currentOrder'] != null) ...[
          const SizedBox(height: 24),
          _buildLocationLabel('CURRENT ORDER'),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.05),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.1),
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.local_mall_rounded,
                  size: 18,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 12),
                Text(
                  driver['currentOrder'],
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
        if (driver['nextStop'] != null) ...[
          const SizedBox(height: 24),
          _buildLocationLabel('NEXT STOP'),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.white,
              border: Border.all(color: AppColors.divider),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.flag_rounded,
                  size: 18,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    driver['nextStop'],
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ]
      ],
    );
  }

  Widget _buildPanelInfo(IconData icon, String text) {
    return Row(
      children: [
        Icon(
          icon,
          size: 14,
          color: AppColors.textSecondary.withValues(alpha: 0.5),
        ),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildProgressStat(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.white,
        border: Border.all(color: AppColors.divider),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w800,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLocationLabel(String label) {
    return Text(
      label,
      style: const TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w800,
        color: AppColors.textMuted,
        letterSpacing: 1,
      ),
    );
  }

  Widget _buildMapMarker(Map<String, dynamic> driver) {
    return InkWell(
      onTap: () => setState(() => _selectedDriver = driver),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: _getStatusColor(driver['status'] as String),
          shape: BoxShape.circle,
          border: Border.all(color: AppColors.white, width: 3),
          boxShadow: [
            BoxShadow(
              color: _getStatusColor(
                driver['status'] as String,
              ).withValues(alpha: 0.4),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: const Icon(
          Icons.local_shipping_rounded,
          size: 20,
          color: AppColors.white,
        ),
      ),
    );
  }

  Widget _buildStatCard(
    String label,
    dynamic value, {
    int? total,
    required IconData icon,
    required Color color,
    required double width,
  }) {
    final isDesktop = MediaQuery.of(context).size.width > 900;
    return Container(
      width: isDesktop ? width : (MediaQuery.of(context).size.width - 64) / 2,
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
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                value.toString(),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              if (total != null)
                Text(
                  ' / $total',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary.withValues(alpha: 0.5),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w800,
            color: AppColors.textMuted,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.divider.withValues(alpha: 0.5)
      ..strokeWidth = 1.0;

    const spacing = 40.0;

    for (double i = 0; i < size.width; i += spacing) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }

    for (double i = 0; i < size.height; i += spacing) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
