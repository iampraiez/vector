import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import 'dashboard_layout.dart';
import '../../shared/widgets/empty_state.dart';

class DashboardNotificationsScreen extends StatefulWidget {
  const DashboardNotificationsScreen({super.key});

  @override
  State<DashboardNotificationsScreen> createState() => _DashboardNotificationsScreenState();
}

class _DashboardNotificationsScreenState extends State<DashboardNotificationsScreen> {
  String _activeCategory = 'all';

  late List<Map<String, dynamic>> _notifications;

  @override
  void initState() {
    super.initState();
    _notifications = [
      {'id': 1, 'type': 'alert', 'category': 'drivers', 'title': 'Driver went offline', 'body': 'Emma Davis went offline unexpectedly during an active route.', 'time': '2 min ago', 'read': false},
      {'id': 2, 'type': 'order', 'category': 'orders', 'title': 'New order assigned', 'body': 'DEL-007 assigned to Sarah Chen — 890 Oak Avenue, Springfield.', 'time': '8 min ago', 'read': false},
      {'id': 3, 'type': 'success', 'category': 'orders', 'title': 'Delivery completed', 'body': 'DEL-005 delivered successfully by Mike Johnson. Customer rated 5 ★.', 'time': '14 min ago', 'read': false},
      {'id': 4, 'type': 'alert', 'category': 'orders', 'title': 'Delivery missed time window', 'body': 'DEL-003 (Lisa Anderson) was not delivered within the 3:00–5:00 PM window.', 'time': '32 min ago', 'read': false},
      {'id': 5, 'type': 'driver', 'category': 'drivers', 'title': 'Driver back online', 'body': 'Alex Rivera resumed activity after a 15-min break.', 'time': '1 hour ago', 'read': true},
      {'id': 6, 'type': 'success', 'category': 'orders', 'title': 'Route optimised', 'body': '4 stops re-sequenced for Alex Rivera, saving an estimated 18 min.', 'time': '1 hour ago', 'read': true},
      {'id': 7, 'type': 'system', 'category': 'system', 'title': 'CSV import completed', 'body': '12 orders imported successfully from today\'s upload.', 'time': '2 hours ago', 'read': true},
      {'id': 8, 'type': 'system', 'category': 'system', 'title': 'Weekly report ready', 'body': 'Your fleet performance report for the week of Mar 1–7 is available.', 'time': '8 hours ago', 'read': true},
      {'id': 9, 'type': 'alert', 'category': 'system', 'title': 'Billing renewal upcoming', 'body': 'Your VECTOR Pro plan renews on March 15. Payment method is up to date.', 'time': '1 day ago', 'read': true},
      {'id': 10, 'type': 'driver', 'category': 'drivers', 'title': 'New driver joined', 'body': 'Jordan Lee joined your fleet using company code VECT-2024.', 'time': '2 days ago', 'read': true},
    ];
  }

  final Map<String, IconData> _iconMap = {
    'order': Icons.inventory_2_outlined,
    'driver': Icons.local_shipping_outlined,
    'alert': Icons.warning_amber_rounded,
    'success': Icons.check_circle_outline,
    'system': Icons.info_outline,
  };

  final Map<String, Map<String, Color>> _colorMap = {
    'order': {'bg': const Color(0xFFEFF6FF), 'icon': const Color(0xFF3B82F6)},
    'driver': {'bg': const Color(0xFFF0FDF4), 'icon': const Color(0xFF16A34A)},
    'alert': {'bg': const Color(0xFFFEF3C7), 'icon': const Color(0xFFD97706)},
    'success': {'bg': const Color(0xFFECFDF5), 'icon': const Color(0xFF059669)},
    'system': {'bg': const Color(0xFFF5F3FF), 'icon': const Color(0xFF7C3AED)},
  };

  final List<Map<String, String>> _categories = [
    {'key': 'all', 'label': 'All'},
    {'key': 'orders', 'label': 'Orders'},
    {'key': 'drivers', 'label': 'Drivers'},
    {'key': 'system', 'label': 'System'},
  ];

  int get _unreadCount => _notifications.where((n) => !n['read']).length;

  List<Map<String, dynamic>> get _filtered => _notifications.where((n) => _activeCategory == 'all' || n['category'] == _activeCategory).toList();

  void _markAllRead() {
    setState(() {
      for (var n in _notifications) { n['read'] = true; }
    });
  }

  void _markRead(int id) {
    setState(() {
      final idx = _notifications.indexWhere((n) => n['id'] == id);
      if (idx != -1) _notifications[idx]['read'] = true;
    });
  }

  void _remove(int id) {
    setState(() => _notifications.removeWhere((n) => n['id'] == id));
  }

  void _clearAll() {
    setState(() {
      _notifications.removeWhere((n) => _activeCategory == 'all' ? true : n['category'] == _activeCategory);
    });
  }

  @override
  Widget build(BuildContext context) {
    return DashboardLayout(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 760),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Text('Notifications', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary, letterSpacing: -0.5)),
                              if (_unreadCount > 0) ...[
                                const SizedBox(width: 10),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(color: const Color(0xFFEF4444), borderRadius: BorderRadius.circular(99)),
                                  child: Text(_unreadCount.toString(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
                                )
                              ]
                            ],
                          ),
                          const SizedBox(height: 4),
                          const Text('Stay updated on deliveries, drivers, and system events', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        if (_unreadCount > 0)
                          OutlinedButton.icon(
                            onPressed: _markAllRead,
                            icon: const Icon(Icons.check, size: 14),
                            label: const Text('Mark all read'),
                            style: OutlinedButton.styleFrom(foregroundColor: AppColors.textSecondary, side: const BorderSide(color: AppColors.border), padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                          ),
                        if (_filtered.isNotEmpty) ...[
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: _clearAll,
                            icon: const Icon(Icons.delete_outline, size: 14),
                            label: Text('Clear ${_activeCategory != 'all' ? _activeCategory : 'all'}'),
                            style: OutlinedButton.styleFrom(foregroundColor: AppColors.textSecondary, side: const BorderSide(color: AppColors.border), padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                          )
                        ]
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 24),

                // Category Tabs
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: _categories.map((cat) {
                        final count = cat['key'] == 'all' ? _notifications.where((n) => !n['read']).length : _notifications.where((n) => n['category'] == cat['key'] && !n['read']).length;
                        final active = _activeCategory == cat['key'];
                        return InkWell(
                          onTap: () => setState(() => _activeCategory = cat['key']!),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                            decoration: BoxDecoration(color: active ? Colors.white : Colors.transparent, border: Border.all(color: active ? AppColors.border : Colors.transparent), borderRadius: BorderRadius.circular(8)),
                            child: Row(
                              children: [
                                Text(cat['label']!, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: active ? AppColors.textPrimary : AppColors.textMuted)),
                                if (count > 0) ...[
                                  const SizedBox(width: 5),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                    decoration: BoxDecoration(color: active ? const Color(0xFFEF4444) : AppColors.border, borderRadius: BorderRadius.circular(99)),
                                    constraints: const BoxConstraints(minWidth: 16),
                                    alignment: Alignment.center,
                                    child: Text(count.toString(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: active ? Colors.white : AppColors.textMuted)),
                                  )
                                ]
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Notification List
                if (_filtered.isEmpty)
                  const EmptyState(
                    title: 'No notifications',
                    message: 'You\'re all caught up. New notifications will appear here.',
                    icon: Icons.notifications_none,
                  )
                else
                  Container(
                    decoration: BoxDecoration(color: Colors.white, border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(14)),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      children: _filtered.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final notif = entry.value;
                        final isLast = idx == _filtered.length - 1;
                        final colors = _colorMap[notif['type']]!;
                        final icon = _iconMap[notif['type']];
                        return InkWell(
                          onTap: () => _markRead(notif['id']),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                            decoration: BoxDecoration(border: Border(bottom: isLast ? BorderSide.none : const BorderSide(color: AppColors.divider)), color: notif['read'] ? Colors.white : const Color(0x08059669)),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Unread Dot
                                SizedBox(
                                  width: 14,
                                  child: !notif['read'] ? Container(margin: const EdgeInsets.only(top: 14), width: 5, height: 5, decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)) : null,
                                ),

                                // Icon
                                Container(
                                  width: 36, height: 36,
                                  decoration: BoxDecoration(color: colors['bg'], borderRadius: BorderRadius.circular(10)),
                                  child: Icon(icon, size: 18, color: colors['icon']),
                                ),
                                const SizedBox(width: 14),

                                // Content
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(child: Text(notif['title'], style: TextStyle(fontSize: 13, fontWeight: notif['read'] ? FontWeight.w500 : FontWeight.w600, color: AppColors.textPrimary))),
                                          Text(notif['time'], style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                                        ],
                                      ),
                                      const SizedBox(height: 3),
                                      Text(notif['body'], style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 14),

                                // Delete Button
                                IconButton(
                                  onPressed: () => _remove(notif['id']),
                                  icon: const Icon(Icons.delete_outline, size: 14),
                                  color: AppColors.textMuted,
                                  hoverColor: const Color(0xFFFEF2F2),
                                  splashRadius: 20,
                                  constraints: const BoxConstraints(),
                                )
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                // Footer
                if (_filtered.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 14),
                    child: Text('Showing ${_filtered.length} notification${_filtered.length != 1 ? 's' : ''} · Notifications older than 30 days are removed automatically', textAlign: TextAlign.center, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                  )
              ],
            ),
          ),
        ),
      )
    );
  }
}
