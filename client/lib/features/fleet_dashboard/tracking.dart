import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';

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
                    Text('Live Tracking', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                    SizedBox(height: 4),
                    Text('Monitor your drivers in real-time', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                  ],
                ),
                const SizedBox(height: 24),

                // Stats
                Wrap(
                  spacing: 16, runSpacing: 16,
                  children: [
                    _buildStatCard('Active Drivers', activeDrivers.length, total: _drivers.length, color: const Color(0xFF059669)),
                    _buildStatCard('Total Deliveries Today', _drivers.fold<int>(0, (sum, d) => sum + (d['completedToday'] as int)), color: const Color(0xFF16A34A)),
                    _buildStatCard('Remaining Stops', _drivers.fold<int>(0, (sum, d) => sum + (d['remainingStops'] as int)), color: const Color(0xFFF59E0B)),
                    _buildStatCard('Avg Completion Rate', '94%', color: const Color(0xFF059669)),
                  ],
                ),
                const SizedBox(height: 24),

                // Map + Detail Panel
                Flex(
                  direction: isMobile ? Axis.vertical : Axis.horizontal,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Map Area
                    Flexible(
                      flex: (_selectedDriver != null && !isMobile) ? 2 : 1,
                      child: Container(
                        decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(24),
                              decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.border))),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      const Icon(Icons.location_on, size: 20, color: AppColors.primary),
                                      const SizedBox(width: 8),
                                      Text(_selectedDriver != null ? "${_selectedDriver!['name']}'s Route" : 'All Drivers', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                    ],
                                  ),
                                  if (_selectedDriver != null)
                                    OutlinedButton.icon(
                                      onPressed: () => setState(() => _selectedDriver = null),
                                      icon: const Icon(Icons.close, size: 13),
                                      label: const Text('View All'),
                                      style: OutlinedButton.styleFrom(foregroundColor: AppColors.textSecondary, side: const BorderSide(color: AppColors.border), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8), textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                    )
                                ],
                              ),
                            ),
                            Container(
                              height: isMobile ? 260 : 500,
                              color: const Color(0xFFF3F4F6),
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.location_on_outlined, size: 48, color: AppColors.textMuted),
                                      const SizedBox(height: 16),
                                      const Text('Interactive map would display here', style: TextStyle(fontSize: 14, color: AppColors.textMuted)),
                                      const SizedBox(height: 4),
                                      Text('Showing ${_selectedDriver != null ? '1 driver' : '${activeDrivers.length} active drivers'}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                    ],
                                  ),
                                  if (_selectedDriver == null)
                                    ...List.generate(activeDrivers.length, (index) {
                                      final driver = activeDrivers[index];
                                      return Positioned(
                                        left: MediaQuery.of(context).size.width * 0.1 + index * 50,
                                        top: 100 + index * 30, // Mock positions
                                        child: InkWell(
                                          onTap: () => setState(() => _selectedDriver = driver),
                                          child: Container(
                                            width: 40, height: 40,
                                            decoration: BoxDecoration(color: _getStatusColor(driver['status'] as String), shape: BoxShape.circle, border: Border.all(color: AppColors.white, width: 3), boxShadow: const [BoxShadow(color: Color(0x33000000), blurRadius: 6, offset: Offset(0, 2))]),
                                            child: const Icon(Icons.local_shipping, size: 20, color: AppColors.white),
                                          ),
                                        ),
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
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
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

                // All Drivers List
                const Text('All Drivers', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 24, runSpacing: 24,
                  children: _drivers.map((driver) => SizedBox(
                    width: MediaQuery.of(context).size.width > 900 ? (MediaQuery.of(context).size.width - 252 - 48 - 48) / 3 : MediaQuery.of(context).size.width > 600 ? (MediaQuery.of(context).size.width - 48 - 24) / 2 : double.infinity,
                    child: InkWell(
                      onTap: () => setState(() => _selectedDriver = driver),
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _selectedDriver?['id'] == driver['id'] ? AppColors.primary : AppColors.border)
                        ),
                        child: Column(
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      width: 40, height: 40, decoration: BoxDecoration(borderRadius: BorderRadius.circular(20), color: _getStatusColor(driver['status'] as String)),
                                      alignment: Alignment.center,
                                      child: const Icon(Icons.local_shipping, size: 20, color: AppColors.white),
                                    ),
                                    const SizedBox(width: 16),
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(driver['name'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                        Text(_getStatusLabel(driver['status'] as String), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _getStatusColor(driver['status'] as String))),
                                      ],
                                    )
                                  ],
                                ),
                                const Icon(Icons.chevron_right, size: 20, color: AppColors.textMuted)
                              ],
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.only(top: 16),
                              decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                              child: Row(
                                children: [
                                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Completed', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), Text(driver['completedToday'].toString(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary))])),
                                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Remaining', style: TextStyle(fontSize: 12, color: AppColors.textMuted)), Text(driver['remainingStops'].toString(), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary))])),
                                ],
                              ),
                            )
                          ],
                        ),
                      ),
                    ),
                  )).toList(),
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
        const Text('Driver Details', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12)),
          child: Column(
            children: [
              Row(
                children: [
                  Container(width: 48, height: 48, decoration: BoxDecoration(borderRadius: BorderRadius.circular(24), color: _getStatusColor(driver['status'] as String)), alignment: Alignment.center, child: const Icon(Icons.person, size: 24, color: AppColors.white)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(driver['name'], style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        Text(_getStatusLabel(driver['status'] as String), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _getStatusColor(driver['status'] as String))),
                      ],
                    ),
                  )
                ],
              ),
              const SizedBox(height: 16),
              Row(children: [const Icon(Icons.phone_outlined, size: 14, color: AppColors.textMuted), const SizedBox(width: 6), Text(driver['phone'], style: const TextStyle(fontSize: 14, color: AppColors.textSecondary))]),
              const SizedBox(height: 8),
              Row(children: [const Icon(Icons.schedule, size: 14, color: AppColors.textMuted), const SizedBox(width: 6), Text('Last updated ${driver['lastUpdate']}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted))]),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)), child: Column(children: [Text(driver['completedToday'].toString(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFF16A34A))), const Text('Completed', style: TextStyle(fontSize: 12, color: AppColors.textSecondary))]))),
            const SizedBox(width: 16),
            Expanded(child: Container(padding: const EdgeInsets.all(16), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)), child: Column(children: [Text(driver['remainingStops'].toString(), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFFF59E0B))), const Text('Remaining', style: TextStyle(fontSize: 12, color: AppColors.textSecondary))]))),
          ],
        ),
        const SizedBox(height: 24),
        const Text('CURRENT LOCATION', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.4)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(16), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.location_on, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Expanded(child: Text(driver['currentLocation'], style: const TextStyle(fontSize: 14, color: AppColors.textPrimary))),
            ],
          ),
        ),
        if (driver['currentOrder'] != null) ...[
          const SizedBox(height: 24),
          const Text('CURRENT ORDER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.4)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)),
            child: Text(driver['currentOrder'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
          ),
        ],
        if (driver['nextStop'] != null) ...[
          const SizedBox(height: 24),
          const Text('NEXT STOP', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary, letterSpacing: 0.4)),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)),
            child: Text(driver['nextStop'], style: const TextStyle(fontSize: 14, color: AppColors.textPrimary)),
          ),
        ]
      ],
    );
  }

  Widget _buildStatCard(String label, dynamic value, {int? total, Color? color}) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(value.toString(), style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: color ?? AppColors.textPrimary)),
              if (total != null)
                Padding(
                  padding: const EdgeInsets.only(left: 8),
                  child: Text('/ $total', style: const TextStyle(fontSize: 16, color: AppColors.textMuted)),
                )
            ],
          ),
        ],
      ),
    );
  }
}
