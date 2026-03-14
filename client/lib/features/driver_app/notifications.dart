import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final List<Map<String, dynamic>> _notifications = [
    {
      'id': 1,
      'type': 'delivery',
      'title': 'Delivery completed',
      'message': '123 Main Street, Downtown',
      'time': '5 minutes ago',
      'read': false,
    },
    {
      'id': 2,
      'type': 'route',
      'title': 'New route assigned',
      'message': 'North Side Route - 6 stops',
      'time': '1 hour ago',
      'read': false,
    },
    {
      'id': 3,
      'type': 'alert',
      'title': 'Route delay detected',
      'message': 'Traffic on I-95 may cause delays',
      'time': '2 hours ago',
      'read': true,
    },
    {
      'id': 4,
      'type': 'achievement',
      'title': 'Milestone reached!',
      'message': 'You completed 250 deliveries',
      'time': 'Yesterday',
      'read': true,
    },
    {
      'id': 5,
      'type': 'delivery',
      'title': 'Delivery completed',
      'message': '789 Oak Avenue, Midtown',
      'time': 'Yesterday',
      'read': true,
    },
  ];

  void _markAllAsRead() {
    setState(() {
      for (var n in _notifications) {
        n['read'] = true;
      }
    });
  }

  void _deleteNotification(int id) {
    setState(() {
      _notifications.removeWhere((n) => n['id'] == id);
    });
  }

  Widget _getIcon(String type) {
    switch (type) {
      case 'delivery':
        return const Icon(
          Icons.inventory_2,
          size: 20,
          color: AppColors.success,
        );
      case 'route':
        return const Icon(
          Icons.location_on,
          size: 20,
          color: AppColors.primary,
        );
      case 'alert':
        return const Icon(
          Icons.error_outline,
          size: 20,
          color: Color(0xFFF59E0B),
        );
      case 'achievement':
        return const Icon(
          Icons.trending_up,
          size: 20,
          color: Color(0xFF8B5CF6),
        );
      default:
        return const Icon(
          Icons.inventory_2,
          size: 20,
          color: AppColors.textMuted,
        );
    }
  }

  Color _getBgColor(String type) {
    switch (type) {
      case 'delivery':
        return const Color(0xFFE8F5E9);
      case 'route':
        return AppColors.primaryLight;
      case 'alert':
        return const Color(0xFFFEF3C7);
      case 'achievement':
        return const Color(0xFFF3E8FF);
      default:
        return AppColors.surface;
    }
  }

  @override
  Widget build(BuildContext context) {
    int unreadCount = _notifications.where((n) => !(n['read'] as bool)).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      body: SafeArea(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
                decoration: BoxDecoration(
                  color: AppColors.white,
                  border: const Border(bottom: BorderSide(color: AppColors.border)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      offset: const Offset(0, 4),
                      blurRadius: 12,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            IconButton(
                              onPressed: () => context.pop(),
                              icon: const Icon(Icons.arrow_back),
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            ),
                            const SizedBox(width: 16),
                            const Text(
                              'Notifications',
                              style: TextStyle(
                                fontSize: 26,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.6,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (unreadCount > 0)
                              Container(
                                margin: const EdgeInsets.only(left: 8),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primaryLight,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  '$unreadCount',
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Icon(
                            Icons.settings,
                            size: 20,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    if (unreadCount > 0)
                      Padding(
                        padding: const EdgeInsets.only(top: 12),
                        child: Align(
                          alignment: Alignment.centerLeft,
                          child: TextButton.icon(
                            onPressed: _markAllAsRead,
                            icon: const Icon(Icons.checklist, size: 16),
                            label: const Text('Mark all as read'),
                            style: TextButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              foregroundColor: AppColors.primary,
                              textStyle: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // List
              Expanded(
                child: _notifications.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 80,
                              height: 80,
                              decoration: const BoxDecoration(
                                color: AppColors.surface,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: const Icon(
                                Icons.inventory_2,
                                size: 36,
                                color: AppColors.textMuted,
                              ),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'No notifications',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              "You're all caught up!",
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final n = _notifications[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: n['read']
                                  ? AppColors.white
                                  : AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: _getBgColor(n['type']),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  alignment: Alignment.center,
                                  child: _getIcon(n['type']),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        n['title'],
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        n['message'],
                                        style: const TextStyle(
                                          fontSize: 14,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        n['time'],
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  onPressed: () => _deleteNotification(n['id']),
                                  icon: const Icon(
                                    Icons.close,
                                    size: 18,
                                    color: AppColors.textMuted,
                                  ),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
