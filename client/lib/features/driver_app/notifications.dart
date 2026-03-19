import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/colors.dart';
import '../../core/services/driver_api_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationItem {
  final String id;
  final String type;
  final String title;
  final String message;
  final DateTime createdAt;
  bool read;

  _NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.createdAt,
    required this.read,
  });

  factory _NotificationItem.fromJson(Map<String, dynamic> j) {
    return _NotificationItem(
      id: j['id'] as String? ?? '',
      type: j['type'] as String? ?? 'notification',
      title: j['title'] as String? ?? '',
      message: j['body'] as String? ?? j['message'] as String? ?? '',
      createdAt: j['created_at'] != null
          ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
      read: j['read'] as bool? ?? false,
    );
  }
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _api = DriverApiService.instance;

  List<_NotificationItem> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    try {
      final data = await _api.getNotifications();
      final items = (data['data'] as List? ?? [])
          .cast<Map<String, dynamic>>()
          .map(_NotificationItem.fromJson)
          .toList();
      if (mounted) {
        setState(() {
          _notifications = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString();
        });
      }
    }
  }

  Future<void> _markAllAsRead() async {
    // Optimistic UI update
    setState(() {
      for (final n in _notifications) {
        n.read = true;
      }
    });
    try {
      await _api.markAllNotificationsRead();
    } catch (_) {
      // Silently fail — UI is already updated
    }
  }

  Future<void> _markRead(String id) async {
    setState(() {
      final idx = _notifications.indexWhere((n) => n.id == id);
      if (idx != -1) _notifications[idx].read = true;
    });
    try {
      await _api.markNotificationRead(id);
    } catch (_) {}
  }

  Widget _getIcon(String type) {
    switch (type) {
      case 'delivery':
        return const Icon(Icons.inventory_2, size: 20, color: AppColors.success);
      case 'route':
        return const Icon(Icons.location_on, size: 20, color: AppColors.primary);
      case 'alert':
        return const Icon(Icons.error_outline, size: 20, color: Color(0xFFF59E0B));
      case 'achievement':
        return const Icon(Icons.trending_up, size: 20, color: Color(0xFF8B5CF6));
      default:
        return const Icon(Icons.notifications, size: 20, color: AppColors.textMuted);
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

  String _formatTime(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays == 1) return 'Yesterday';
    return '${diff.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = _notifications.where((n) => !n.read).length;

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
                                  horizontal: 8, vertical: 4,
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
                                horizontal: 16, vertical: 8,
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
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(color: AppColors.primary),
                      )
                    : _errorMessage != null
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.error_outline,
                                size: 40, color: AppColors.error),
                            const SizedBox(height: 12),
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: AppColors.textSecondary),
                            ),
                            const SizedBox(height: 12),
                            TextButton(
                              onPressed: _loadData,
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: _loadData,
                        child: _notifications.isEmpty
                            ? ListView(
                                physics: const AlwaysScrollableScrollPhysics(),
                                children: [
                                  const SizedBox(height: 60),
                                  Center(
                                    child: Column(
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
                                            Icons.notifications_none,
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
                                  ),
                                ],
                              )
                            : ListView.builder(
                                physics: const AlwaysScrollableScrollPhysics(),
                                padding: const EdgeInsets.all(16),
                                itemCount: _notifications.length,
                                itemBuilder: (context, index) {
                                  final n = _notifications[index];
                                  return GestureDetector(
                                    onTap: () => _markRead(n.id),
                                    child: Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: n.read
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
                                              color: _getBgColor(n.type),
                                              borderRadius: BorderRadius.circular(12),
                                            ),
                                            alignment: Alignment.center,
                                            child: _getIcon(n.type),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  n.title,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w600,
                                                    color: AppColors.textPrimary,
                                                  ),
                                                ),
                                                const SizedBox(height: 4),
                                                Text(
                                                  n.message,
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                    color: AppColors.textSecondary,
                                                  ),
                                                ),
                                                const SizedBox(height: 6),
                                                Text(
                                                  _formatTime(n.createdAt),
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    color: AppColors.textMuted,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          if (!n.read)
                                            Container(
                                              width: 8,
                                              height: 8,
                                              margin: const EdgeInsets.only(top: 4),
                                              decoration: const BoxDecoration(
                                                color: AppColors.primary,
                                                shape: BoxShape.circle,
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
