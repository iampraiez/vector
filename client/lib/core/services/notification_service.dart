import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'driver_api_service.dart';

class AppNotification {
  final String id;
  final String type;
  final String title;
  final String message;
  final DateTime createdAt;
  bool read;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.createdAt,
    required this.read,
  });

  factory AppNotification.fromJson(Map<String, dynamic> j) {
    return AppNotification(
      id: j['id'] as String? ?? '',
      type: j['type'] as String? ?? 'notification',
      title: j['title'] as String? ?? '',
      message: j['body'] as String? ?? j['message'] as String? ?? '',
      createdAt: j['created_at'] != null
          ? DateTime.tryParse(j['created_at'] as String) ?? DateTime.now()
          : DateTime.now(),
      read: (j['is_read'] as bool?) ?? (j['read'] as bool?) ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'title': title,
        'body': message,
        'message': message,
        'created_at': createdAt.toIso8601String(),
        'is_read': read,
        'read': read,
      };
}

class NotificationService extends ChangeNotifier {
  static final NotificationService instance = NotificationService._();
  NotificationService._();

  List<AppNotification> _notifications = [];
  List<AppNotification> get notifications => _notifications;

  int get unreadCount => _notifications.where((n) => !n.read).length;

  static const _cacheKey = 'cache_notifications_global';
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    _initialized = true;

    // Load from cache initially
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_cacheKey);
    if (raw != null) {
      try {
        final cached = jsonDecode(raw) as List;
        _notifications = cached
            .cast<Map<String, dynamic>>()
            .map(AppNotification.fromJson)
            .toList();
        notifyListeners();
      } catch (_) {}
    }

    // Fetch live from API (in background)
    fetchLive();
  }

  Future<void> fetchLive() async {
    try {
      final data = await DriverApiService.instance.getNotifications();
      final items = (data['data'] as List? ?? [])
          .cast<Map<String, dynamic>>()
          .map(AppNotification.fromJson)
          .toList();
      _notifications = items;
      _saveToCache();
      notifyListeners();
    } catch (_) {}
  }

  void handleIncomingSocketNotification(Map<String, dynamic> payload) {
    final newNotif = AppNotification.fromJson(payload);
    // Add to top if not strictly already there
    if (!_notifications.any((n) => n.id == newNotif.id)) {
      _notifications.insert(0, newNotif);
      _saveToCache();
      notifyListeners();
    }
  }

  Future<void> markAsRead(String id) async {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1 && !_notifications[idx].read) {
      _notifications[idx].read = true;
      notifyListeners();
      _saveToCache();
      try {
        await DriverApiService.instance.markNotificationRead(id);
      } catch (_) {}
    }
  }

  Future<void> markAllAsRead() async {
    bool changed = false;
    for (var n in _notifications) {
      if (!n.read) {
        n.read = true;
        changed = true;
      }
    }
    if (changed) {
      notifyListeners();
      _saveToCache();
      try {
        await DriverApiService.instance.markAllNotificationsRead();
      } catch (_) {}
    }
  }

  Future<void> deleteNotification(String id) async {
    final idx = _notifications.indexWhere((n) => n.id == id);
    if (idx != -1) {
      _notifications.removeAt(idx);
      notifyListeners();
      _saveToCache();
      try {
        await DriverApiService.instance.deleteNotification(id);
      } catch (_) {}
    }
  }

  void clearCache() async {
    _notifications.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cacheKey);
    notifyListeners();
  }

  void _saveToCache() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(_notifications.map((n) => n.toJson()).toList());
    await prefs.setString(_cacheKey, raw);
  }
}
