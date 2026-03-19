import 'package:flutter/material.dart';
import 'package:dio/dio.dart';

/// Lightweight offline helper. Works by attempting a quick HEAD request.
/// Falls back to catching socket/connection errors from Dio.
class OfflineService {
  static Future<bool> isOffline() async {
    try {
      final dio = Dio(
        BaseOptions(
          connectTimeout: const Duration(seconds: 5),
          receiveTimeout: const Duration(seconds: 5),
        ),
      );
      await dio.head('https://www.google.com');
      return false;
    } catch (_) {
      return true;
    }
  }

  /// Shows a styled offline snackbar. Returns true if offline.
  static Future<bool> checkAndShowOfflineSnackBar(BuildContext context) async {
    final offline = await isOffline();
    if (offline && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(Icons.wifi_off, color: Colors.white, size: 18),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  "You're offline. This action requires a connection.",
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: const Color(0xFF1F2937),
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          duration: const Duration(seconds: 3),
        ),
      );
    }
    return offline;
  }

  /// Returns an offline banner widget to show at the top of screens.
  static Widget offlineBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: const Color(0xFFFEF3C7),
      child: Row(
        children: const [
          Icon(Icons.wifi_off, size: 15, color: Color(0xFFD97706)),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              'Cached data shown — you appear to be offline',
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF92400E),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
