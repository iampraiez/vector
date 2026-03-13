import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';
import '../../shared/widgets/empty_state.dart';

class DashboardOrdersScreen extends StatefulWidget {
  const DashboardOrdersScreen({super.key});

  @override
  State<DashboardOrdersScreen> createState() => _DashboardOrdersScreenState();
}

class _DashboardOrdersScreenState extends State<DashboardOrdersScreen> {
  String _searchQuery = '';
  String _activeFilter = 'all';

  final List<Map<String, dynamic>> _orders = [
    {
      'id': 'DEL-001', 'customerName': 'Sarah Chen', 'address': '742 Evergreen Terrace', 'city': 'Springfield, IL',
      'packages': 3, 'priority': 'high', 'timeWindow': '9:00 AM - 11:00 AM', 'status': 'assigned',
      'assignedTo': 'Alex Rivera', 'notes': 'Ring doorbell twice', 'createdAt': 'Today, 8:00 AM'
    },
    {
      'id': 'DEL-002', 'customerName': 'Mike Johnson', 'address': '1428 Elm Street', 'city': 'Springfield, IL',
      'packages': 1, 'priority': 'normal', 'timeWindow': '11:00 AM - 1:00 PM', 'status': 'in-progress',
      'assignedTo': 'Sarah Chen', 'notes': 'Leave at front desk', 'createdAt': 'Today, 8:15 AM'
    },
    {
      'id': 'DEL-003', 'customerName': 'Emma Davis', 'address': '890 Oak Avenue', 'city': 'Springfield, IL',
      'packages': 2, 'priority': 'normal', 'timeWindow': '2:00 PM - 4:00 PM', 'status': 'unassigned',
      'createdAt': 'Today, 8:30 AM'
    },
    {
      'id': 'DEL-004', 'customerName': 'John Smith', 'address': '456 Park Lane', 'city': 'Springfield, IL',
      'packages': 2, 'priority': 'normal', 'timeWindow': '10:00 AM - 12:00 PM', 'status': 'completed',
      'assignedTo': 'Mike Johnson', 'createdAt': 'Today, 7:45 AM'
    },
    {
      'id': 'DEL-005', 'customerName': 'Lisa Anderson', 'address': '123 Main Street', 'city': 'Springfield, IL',
      'packages': 1, 'priority': 'normal', 'timeWindow': '3:00 PM - 5:00 PM', 'status': 'unassigned',
      'createdAt': 'Today, 9:00 AM'
    },
  ];

  final List<String> _drivers = ['Alex Rivera', 'Sarah Chen', 'Mike Johnson', 'Emma Davis'];

  Map<String, dynamic> _getStatusColor(String status) {
    switch (status) {
      case 'unassigned': return {'bg': const Color(0xFFF3F4F6), 'text': const Color(0xFF6B7280)};
      case 'assigned': return {'bg': const Color(0xFFDBEAFE), 'text': const Color(0xFF1D4ED8)};
      case 'in-progress': return {'bg': const Color(0xFFD1FAE5), 'text': const Color(0xFF059669)};
      case 'completed': return {'bg': const Color(0xFFDCFCE7), 'text': const Color(0xFF16A34A)};
      case 'failed': return {'bg': const Color(0xFFFEE2E2), 'text': const Color(0xFFDC2626)};
      default: return {'bg': const Color(0xFFF3F4F6), 'text': const Color(0xFF6B7280)};
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'unassigned': return 'Unassigned';
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredOrders = _orders.where((o) {
      final matchesSearch = o['customerName'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            o['id'].toString().toLowerCase().contains(_searchQuery.toLowerCase()) ||
                            o['address'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesFilter = _activeFilter == 'all' || o['status'] == _activeFilter;
      return matchesSearch && matchesFilter;
    }).toList();

    final unassignedCount = _orders.where((o) => o['status'] == 'unassigned').length;
    final inProgressCount = _orders.where((o) => o['status'] == 'in-progress').length;
    final completedCount = _orders.where((o) => o['status'] == 'completed').length;

    final isMobile = MediaQuery.of(context).size.width < 640;

    return DashboardLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1400),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Orders & Deliveries', style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        SizedBox(height: 8),
                        Text('Manage and assign deliveries to your drivers', style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                      ],
                    ),
                    Row(
                      children: [
                        OutlinedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.upload, size: 18),
                          label: const Text('Upload CSV'),
                          style: OutlinedButton.styleFrom(foregroundColor: AppColors.textPrimary, padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.add, size: 16),
                          label: const Text('New Order'),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: AppColors.white, padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        )
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 32),
                Wrap(
                  spacing: 24, runSpacing: 24,
                  children: [
                    _buildStatCard('Total Orders', _orders.length),
                    _buildStatCard('Unassigned', unassignedCount, color: const Color(0xFFF59E0B)),
                    _buildStatCard('In Progress', inProgressCount, color: const Color(0xFF059669)),
                    _buildStatCard('Completed', completedCount, color: const Color(0xFF16A34A)),
                  ],
                ),
                const SizedBox(height: 24),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                  child: Column(
                    children: [
                      TextField(
                        onChanged: (v) => setState(() => _searchQuery = v),
                        decoration: InputDecoration(
                          hintText: 'Search orders by customer, ID, or address...',
                          prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
                          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
                          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.primary)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            {'id': 'all', 'label': 'All'},
                            {'id': 'unassigned', 'label': 'Unassigned'},
                            {'id': 'assigned', 'label': 'Assigned'},
                            {'id': 'in-progress', 'label': 'In Progress'},
                            {'id': 'completed', 'label': 'Completed'},
                            {'id': 'failed', 'label': 'Failed'},
                          ].map((f) => Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: _buildFilterButton(f['label']!, f['id']!, active: _activeFilter == f['id']),
                          )).toList(),
                        ),
                      )
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                if (filteredOrders.isEmpty)
                  const EmptyState(
                    title: 'No orders found',
                    message: 'Try adjusting your search or filter to find specific orders.',
                    icon: Icons.search_off_outlined,
                  )
                else if (isMobile)
                  Column(
                    children: filteredOrders.map((order) {
                      final statusColors = _getStatusColor(order['status'] as String);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    Text(order['id'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                    if (order['priority'] == 'high')
                                      Container(margin: const EdgeInsets.only(left: 8), padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(4)), child: const Text('Priority', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFFDC2626))))
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: statusColors['bg'] as Color, borderRadius: BorderRadius.circular(6)),
                                  child: Text(_getStatusLabel(order['status'] as String), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: statusColors['text'] as Color)),
                                )
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(order['customerName'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textPrimary)),
                            Text('${order['address']}, ${order['city']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            const SizedBox(height: 10),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(children: [Text(order['timeWindow'], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)), const SizedBox(width: 10), Text('${order['packages']} pkg', style: const TextStyle(fontSize: 11, color: AppColors.textMuted))]),
                                Row(
                                  children: [
                                    if (order['assignedTo'] != null) Text(order['assignedTo'], style: const TextStyle(fontSize: 11, color: AppColors.textSecondary))
                                    else DropdownButton<String>(items: _drivers.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 11)))).toList(), onChanged: (v){}, hint: const Text('Assign...', style: TextStyle(fontSize: 11)), underline: const SizedBox(), isDense: true),
                                    const SizedBox(width: 6),
                                    const Icon(Icons.edit, size: 16, color: AppColors.textSecondary)
                                  ]
                                )
                              ]
                            )
                          ],
                        ),
                      );
                    }).toList()
                  )
                else
                  Container(
                    decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                    clipBehavior: Clip.antiAlias,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingRowColor: WidgetStateProperty.all(AppColors.surface),
                        dataRowMinHeight: 60, dataRowMaxHeight: 60,
                        showBottomBorder: true,
                        columns: const [
                          DataColumn(label: Text('ORDER ID', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                          DataColumn(label: Text('CUSTOMER', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                          DataColumn(label: Text('ADDRESS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                          DataColumn(label: Text('TIME WINDOW', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                          DataColumn(label: Text('ASSIGNED TO', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                          DataColumn(label: Text('STATUS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                          DataColumn(label: Text('ACTIONS', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary))),
                        ],
                        rows: filteredOrders.map((order) {
                          final statusColors = _getStatusColor(order['status'] as String);
                          return DataRow(
                            cells: [
                              DataCell(Column(
                                mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(order['id'], style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                                  if (order['priority'] == 'high')
                                    Container(margin: const EdgeInsets.only(top: 4), padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: const Color(0xFFFEE2E2), borderRadius: BorderRadius.circular(4)), child: const Text('Priority', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFDC2626))))
                                ],
                              )),
                              DataCell(Column(
                                mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(order['customerName'], style: const TextStyle(fontSize: 14, color: AppColors.textPrimary)),
                                  Text('${order['packages']} package${order['packages'] > 1 ? 's' : ''}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                ],
                              )),
                              DataCell(Column(
                                mainAxisAlignment: MainAxisAlignment.center, crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(order['address'], style: const TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                                  Text(order['city'], style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
                                ],
                              )),
                              DataCell(Text(order['timeWindow'], style: const TextStyle(fontSize: 14, color: AppColors.textSecondary))),
                              DataCell(
                                order['assignedTo'] != null 
                                  ? Row(children: [const Icon(Icons.person_outline, size: 14, color: AppColors.textMuted), const SizedBox(width: 4), Text(order['assignedTo'], style: const TextStyle(fontSize: 14, color: AppColors.textPrimary))])
                                  : DropdownButton<String>(items: _drivers.map((d) => DropdownMenuItem(value: d, child: Text(d, style: const TextStyle(fontSize: 14)))).toList(), onChanged: (v){}, hint: const Text('Assign driver...', style: TextStyle(fontSize: 14)), underline: const SizedBox())
                              ),
                              DataCell(Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: statusColors['bg'] as Color, borderRadius: BorderRadius.circular(4)),
                                child: Text(_getStatusLabel(order['status'] as String), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: statusColors['text'] as Color)),
                              )),
                              DataCell(IconButton(onPressed: () {}, icon: const Icon(Icons.edit, size: 16), style: IconButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4), side: const BorderSide(color: AppColors.border))))),
                            ]
                          );
                        }).toList(),
                      ),
                    ),
                  )
              ],
            ),
          )
        )
      )
    );
  }

  Widget _buildStatCard(String label, int value, {Color? color}) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(color: AppColors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          Text(value.toString(), style: TextStyle(fontSize: 30, fontWeight: FontWeight.w700, color: color ?? AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, String id, {required bool active}) {
    return InkWell(
      onTap: () => setState(() => _activeFilter = id),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: active ? AppColors.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: active ? AppColors.primary : AppColors.border),
        ),
        child: Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: active ? AppColors.white : AppColors.textSecondary)),
      ),
    );
  }
}
