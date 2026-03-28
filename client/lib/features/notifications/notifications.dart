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
          if (unreadCount > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: TextButton.icon(
                onPressed: () {
                  ns.markAllAsRead();
                },
                icon: const Icon(
                  Icons.done_all,
                  size: 16,
                  color: AppColors.textMuted,
                ),
                label: const Text(
                  'Mark all read',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 0,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
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
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: isUnread ? Colors.white : AppColors.surface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isUnread
                                  ? AppColors.primary.withValues(alpha: 0.3)
                                  : AppColors.border,
                              width: isUnread ? 1.5 : 1,
                            ),
                            boxShadow: isUnread
                                ? [
                                    BoxShadow(
                                      color: AppColors.primary.withValues(
                                        alpha: 0.05,
                                      ),
                                      blurRadius: 10,
                                      offset: const Offset(0, 4),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: isUnread
                                      ? AppColors.primary.withValues(alpha: 0.1)
                                      : Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isUnread
                                        ? AppColors.primary.withValues(
                                            alpha: 0.2,
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
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            n.title,
                                            style: TextStyle(
                                              fontSize: 15,
                                              fontWeight: isUnread
                                                  ? FontWeight.w700
                                                  : FontWeight.w600,
                                              color: isUnread
                                                  ? AppColors.textPrimary
                                                  : AppColors.textPrimary
                                                        .withValues(alpha: 0.8),
                                              letterSpacing: -0.2,
                                            ),
                                          ),
                                        ),
                                        if (isUnread) ...[
                                          const SizedBox(width: 8),
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
                                    const SizedBox(height: 4),
                                    Text(
                                      n.message,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: isUnread
                                            ? AppColors.textPrimary.withValues(
                                                alpha: 0.8,
                                              )
                                            : AppColors.textMuted,
                                        height: 1.4,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      _formatTime(n.createdAt),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: AppColors.textMuted,
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
      iconData = Icons.info_outline;
      color = Colors.blue;
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
}
