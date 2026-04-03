import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme/colors.dart';
import '../../main.dart' show NotificationScope;

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ns = NotificationScope.of(context);
    final notifications = ns.notifications;
    final unreadCount = ns.unreadCount;
    final hasData = notifications.isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        scrolledUnderElevation: 0,
        elevation: 0,
        titleSpacing: 24,
        title: Row(
          children: [
            InkWell(
              onTap: () => context.pop(),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 16,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            const SizedBox(width: 16),
            const Text(
              'Notifications',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
                letterSpacing: -0.5,
              ),
            ),
            if (unreadCount > 0) ...[
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.errorLight.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: AppColors.errorLight.withValues(alpha: 0.3),
                  ),
                ),
                child: Text(
                  '$unreadCount NEW',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.error,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ]
          ],
        ),
        actions: [
          if (hasData)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: TextButton(
                onPressed: () => _showClearAllConfirm(context, ns),
                child: const Text(
                  'Clear all',
                  style: TextStyle(
                    color: AppColors.error,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          if (unreadCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: IconButton(
                onPressed: () => ns.markAllAsRead(),
                icon: const Icon(
                  Icons.done_all,
                  size: 20,
                  color: AppColors.primary,
                ),
                tooltip: 'Mark all as read',
              ),
            )
        ],
      ),
      body: !hasData
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Icon(
                      Icons.notifications_none,
                      size: 32,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 20),
                  const Text(
                    'No notifications',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'You\'re all caught up for now.',
                    style: TextStyle(
                      fontSize: 15, color: AppColors.textMuted),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              onRefresh: () async {
                await ns.fetchLive();
              },
              backgroundColor: Colors.white,
              color: AppColors.primary,
              child: ListView.separated(
                padding: const EdgeInsets.all(24),
                itemCount: notifications.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final n = notifications[index];
                  final isUnread = !n.read;

                  return Dismissible(
                    key: Key(n.id),
                    direction: DismissDirection.endToStart,
                    background: Container(
                      alignment: Alignment.centerRight,
                      padding: const EdgeInsets.only(right: 24),
                      decoration: BoxDecoration(
                        color: AppColors.error,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.delete_outline,
                        color: Colors.white,
                      ),
                    ),
                    onDismissed: (direction) {
                      ns.deleteNotification(n.id);
                    },
                    child: Material(
                      color: Colors.transparent,
                      child: InkWell(
                        onTap: isUnread
                            ? () {
                                ns.markAsRead(n.id);
                              }
                            : null,
                        borderRadius: BorderRadius.circular(20),
                        child: Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: isUnread ? Colors.white : AppColors.surface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isUnread
                                  ? AppColors.primary.withValues(alpha: 0.15)
                                  : Colors.transparent,
                              width: 1,
                            ),
                            boxShadow: isUnread
                                ? [
                                    BoxShadow(
                                      color: AppColors.primary.withValues(
                                        alpha: 0.05,
                                      ),
                                      blurRadius: 15,
                                      offset: const Offset(0, 4),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 44,
                                height: 44,
                                decoration: BoxDecoration(
                                  color: isUnread
                                      ? AppColors.primary.withValues(alpha: 0.08)
                                      : Colors.white,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isUnread
                                        ? AppColors.primary.withValues(
                                            alpha: 0.1,
                                          )
                                        : AppColors.border,
                                  ),
                                ),
                                child: _getIcon(n.type, isUnread),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            n.title,
                                            style: TextStyle(
                                              fontSize: 16,
                                              fontWeight: isUnread
                                                  ? FontWeight.w800
                                                  : FontWeight.w600,
                                              color: isUnread
                                                  ? AppColors.textPrimary
                                                  : AppColors.textPrimary
                                                        .withValues(alpha: 0.7),
                                              letterSpacing: -0.2,
                                            ),
                                          ),
                                        ),
                                        if (isUnread) ...[
                                          const SizedBox(width: 12),
                                          Container(
                                            width: 8,
                                            height: 8,
                                            margin: const EdgeInsets.only(
                                              top: 6,
                                            ),
                                            decoration: const BoxDecoration(
                                              color: AppColors.primary,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                        ],
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      n.message,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: isUnread
                                            ? AppColors.textSecondary
                                            : AppColors.textMuted,
                                        height: 1.4,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      _formatTime(n.createdAt),
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: isUnread
                                            ? FontWeight.w600
                                            : FontWeight.w500,
                                        color: isUnread
                                            ? AppColors.primary.withValues(alpha: 0.8)
                                            : AppColors.textMuted,
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
                  );
                },
              ),
            ),
    );
  }

  Widget _getIcon(String type, bool isUnread) {
    IconData iconData;
    Color color;

    final lower = type.toLowerCase();
    if (lower.contains('order') || lower.contains('new_assignment')) {
      iconData = Icons.inventory_2_outlined;
      color = AppColors.primary;
    } else if (lower.contains('status') || lower.contains('route')) {
      iconData = Icons.local_shipping_outlined;
      color = AppColors.success;
    } else if (lower.contains('alert') || lower.contains('failed')) {
      iconData = Icons.warning_amber_rounded;
      color = AppColors.error;
    } else if (lower.contains('system')) {
      iconData = Icons.campaign_outlined;
      color = const Color(0xFF3B82F6);
    } else {
      iconData = Icons.notifications_outlined;
      color = AppColors.textMuted;
    }

    if (!isUnread) {
      color = AppColors.textMuted;
    }

    return Icon(iconData, size: 20, color: color);
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 60) {
      final m = diff.inMinutes;
      return m <= 1 ? 'Just now' : '$m mins ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else if (diff.inDays < 7) {
      return '${diff.inDays}d ago';
    } else {
      return DateFormat('MMM d, y').format(time);
    }
  }

  void _showClearAllConfirm(BuildContext context, dynamic ns) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 24),
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const Icon(
                Icons.delete_sweep_outlined,
                color: AppColors.error,
                size: 48,
              ),
              const SizedBox(height: 16),
              const Text(
                'Clear all notifications?',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'This will permanently delete all your notifications. This action cannot be undone.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Cancel',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        ns.deleteAll();
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: const Text(
                        'Clear All',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
