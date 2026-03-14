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
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Text(
                                'Notifications',
                                style: TextStyle(
                                  fontSize: 32,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                  letterSpacing: -1,
                                ),
                              ),
                              if (_unreadCount > 0) ...[
                                const SizedBox(width: 14),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEF4444),
                                    borderRadius: BorderRadius.circular(10),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(
                                          0xFFEF4444,
                                        ).withValues(alpha: 0.2),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: Text(
                                    _unreadCount.toString(),
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                )
                              ]
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Latest updates across your fleet and system',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Row(
                      children: [
                        if (_unreadCount > 0)
                          _buildHeaderAction(
                            label: 'Mark all as read',
                            icon: Icons.done_all_rounded,
                            onPressed: _markAllRead,
                          ),
                        if (_filtered.isNotEmpty) ...[
                          const SizedBox(width: 12),
                          _buildHeaderAction(
                            label: 'Clear',
                            icon: Icons.delete_sweep_rounded,
                            onPressed: _clearAll,
                          ),
                        ]
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 32),

                // Category Tabs
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: _categories.map((cat) {
                        final count = cat['key'] == 'all'
                            ? _notifications.where((n) => !n['read']).length
                            : _notifications
                                  .where(
                                    (n) =>
                                        n['category'] == cat['key'] &&
                                        !n['read'],
                                  )
                                  .length;
                        final active = _activeCategory == cat['key'];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: InkWell(
                            onTap: () =>
                                setState(() => _activeCategory = cat['key']!),
                            borderRadius: BorderRadius.circular(10),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                              decoration: BoxDecoration(
                                color: active
                                    ? AppColors.white
                                    : Colors.transparent,
                                borderRadius: BorderRadius.circular(10),
                                boxShadow: active
                                    ? [
                                        BoxShadow(
                                          color: Colors.black.withValues(
                                            alpha: 0.04,
                                          ),
                                          blurRadius: 10,
                                          offset: const Offset(0, 4),
                                        ),
                                      ]
                                    : [],
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    cat['label']!,
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: active
                                          ? FontWeight.w700
                                          : FontWeight.w600,
                                      color: active
                                          ? AppColors.textPrimary
                                          : AppColors.textSecondary,
                                    ),
                                  ),
                                  if (count > 0) ...[
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 2,
                                      ),
                                      decoration: BoxDecoration(
                                        color: active
                                            ? const Color(
                                                0xFFEF4444,
                                              ).withValues(alpha: 0.1)
                                            : AppColors.divider,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        count.toString(),
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.w800,
                                          color: active
                                              ? const Color(0xFFEF4444)
                                              : AppColors.textSecondary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Notification List
                if (_filtered.isEmpty)
                  const EmptyState(
                    title: 'No notifications',
                    message:
                        'You\'re all caught up. New notifications will appear here.',
                    icon: Icons.notifications_none,
                  )
                else
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.divider),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      children: _filtered.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final notif = entry.value;
                        final isLast = idx == _filtered.length - 1;
                        final colors = _colorMap[notif['type']]!;
                        final icon = _iconMap[notif['type']];
                        final isUnread = !notif['read'];

                        return InkWell(
                          onTap: () => _markRead(notif['id']),
                          child: Container(
                            padding: const EdgeInsets.all(24),
                            decoration: BoxDecoration(
                              border: Border(
                                bottom: isLast
                                    ? BorderSide.none
                                    : const BorderSide(
                                        color: AppColors.divider,
                                      ),
                              ),
                              color: isUnread
                                  ? AppColors.primary.withValues(alpha: 0.02)
                                  : Colors.transparent,
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Icon
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: colors['bg'],
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    icon,
                                    size: 20,
                                    color: colors['icon'],
                                  ),
                                ),
                                const SizedBox(width: 20),

                                // Content
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Row(
                                              children: [
                                                if (isUnread) ...[
                                                  Container(
                                                    width: 8,
                                                    height: 8,
                                                    decoration:
                                                        const BoxDecoration(
                                                          color:
                                                              AppColors.primary,
                                                          shape:
                                                              BoxShape.circle,
                                                        ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                ],
                                                Text(
                                                  notif['title'],
                                                  style: TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: isUnread
                                                        ? FontWeight.w700
                                                        : FontWeight.w600,
                                                    color:
                                                        AppColors.textPrimary,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          Text(
                                            notif['time'],
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        notif['body'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w500,
                                          color: AppColors.textSecondary,
                                          height: 1.5,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 20),

                                // Delete Button
                                IconButton(
                                  onPressed: () => _remove(notif['id']),
                                  icon: const Icon(
                                    Icons.delete_outline_rounded,
                                    size: 18,
                                  ),
                                  color: AppColors.textMuted,
                                  hoverColor: const Color(0xFFFEF2F2),
                                  splashRadius: 24,
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

  Widget _buildHeaderAction({
    required String label,
    required IconData icon,
    required VoidCallback onPressed,
  }) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.textSecondary,
        backgroundColor: AppColors.white,
        side: const BorderSide(color: AppColors.divider),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
      ),
    );
  }
}
