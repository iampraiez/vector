import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../models/pending_delivery.dart';
import './cloudinary_service.dart';
import './driver_api_service.dart';

/// Lightweight offline helper. Works by attempting a quick HEAD request.
/// Falls back to catching socket/connection errors from Dio.
class OfflineService {
  static const String _boxName = 'pending_deliveries';

  static Future<void> init() async {
    await Hive.initFlutter();
    Hive.registerAdapter(PendingDeliveryAdapter());
    await Hive.openBox<PendingDelivery>(_boxName);

    // Listen for connectivity changes to trigger sync
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      if (results.any((result) => result != ConnectivityResult.none)) {
        syncPendingDeliveries();
      }
    });

  }

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

  /// Saves a delivery to local Hive box for later sync.
  static Future<void> queueDelivery({
    required String stopId,
    required String localPhotoPath,
    String? qrCode,
    String? notes,
  }) async {
    final box = Hive.box<PendingDelivery>(_boxName);
    final pending = PendingDelivery(
      stopId: stopId,
      localPhotoPath: localPhotoPath,
      qrCode: qrCode,
      notes: notes,
      createdAt: DateTime.now(),
    );
    await box.add(pending);
    debugPrint('Delivery for stop $stopId queued offline.');
  }

  /// Attempts to sync all pending deliveries in the box.
  static Future<void> syncPendingDeliveries() async {
    final box = Hive.box<PendingDelivery>(_boxName);
    if (box.isEmpty) return;

    debugPrint('Syncing ${box.length} pending deliveries...');
    final offline = await isOffline();
    if (offline) return;

    final List<int> syncedIndices = [];

    for (int i = 0; i < box.length; i++) {
      final pending = box.getAt(i);
      if (pending == null) continue;

      try {
        // 1. Upload photo to Cloudinary
        final cloudPhotoUrl = await CloudinaryService.upload(
          filePath: pending.localPhotoPath,
        );

        // 2. Complete delivery on backend
        await DriverApiService.instance.completeDelivery(
          pending.stopId,
          photoUrl: cloudPhotoUrl,
          qrCode: pending.qrCode,
          notes: pending.notes,
        );

        syncedIndices.add(i);
        debugPrint('Successfully synced stop ${pending.stopId}');
      } catch (e) {
        debugPrint('Failed to sync stop ${pending.stopId}: $e');
        // Break to avoid spamming failures if network is flaky
        break;
      }
    }

    // Remove synced items from back to front to preserve indices
    for (final index in syncedIndices.reversed) {
      await box.deleteAt(index);
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
                  "You're offline. Action will be synced when you return online.",
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

