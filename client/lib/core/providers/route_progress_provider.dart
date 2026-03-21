import 'package:flutter/foundation.dart';

/// A single delivery stop in the active route.
class StopModel {
  final String id;
  final String customerName;
  final String address;
  final String phone;
  final String eta;
  final String distance;
  final int packages;
  final String? notes;
  final double? lat;
  final double? lng;
  bool isCompleted;
  String? photoPath;
  String? photoUrl;
  String? qrCode;

  StopModel({
    required this.id,
    required this.customerName,
    required this.address,
    required this.phone,
    required this.eta,
    required this.distance,
    required this.packages,
    this.notes,
    this.lat,
    this.lng,
    this.isCompleted = false,
    this.photoPath,
    this.photoUrl,
    this.qrCode,
  });

  /// Build a [StopModel] from a server stop response object.
  factory StopModel.fromJson(Map<String, dynamic> json) {
    return StopModel(
      id: json['id'] as String? ?? '',
      customerName: json['customer_name'] as String? ?? 'Customer',
      address: json['address'] as String? ?? '',
      phone: json['customer_phone'] as String? ?? '',
      eta: json['eta'] as String? ?? '--',
      distance: json['distance'] as String? ?? '--',
      packages: (json['packages'] as num?)?.toInt() ?? 1,
      notes: json['notes'] as String?,
      lat: (json['lat'] as num?)?.toDouble(),
      lng: (json['lng'] as num?)?.toDouble(),
    );
  }
}

/// Shared state that tracks the active route progress throughout the
/// Navigation → PoD → auto-advance loop.
///
/// Consumed in:
///   - NavigationScreen  (reads currentStop, stopList)
///   - ProofDeliveryScreen (calls completeCurrentStop())
///
/// Populated by:
///   - AssignmentsScreen via [loadStops] after fetching the route from the API.
class RouteProgressProvider extends ChangeNotifier {
  List<StopModel> _stops = [];
  int _currentIndex = 0;
  bool _isRouteComplete = false;

  // ── Getters ──────────────────────────────────────────────────────────────
  List<StopModel> get allStops => List.unmodifiable(_stops);
  int get currentIndex => _currentIndex;
  bool get isRouteComplete => _isRouteComplete;
  bool get hasMoreStops => _currentIndex < _stops.length;
  bool get isEmpty => _stops.isEmpty;

  /// The stop the driver is currently heading to / delivering.
  StopModel? get currentStop =>
      hasMoreStops ? _stops[_currentIndex] : null;

  /// Stops after the current one (shown as "upcoming" in navigation).
  List<StopModel> get upcomingStops =>
      _currentIndex + 1 < _stops.length
          ? _stops.sublist(_currentIndex + 1)
          : [];

  int get totalStops => _stops.length;
  int get completedCount => _stops.where((s) => s.isCompleted).length;

  // ── Actions ──────────────────────────────────────────────────────────────

  /// Load stops from API response; resets progress.
  /// [stopsJson] — list of stop objects from the server.
  void loadStops(List<dynamic> stopsJson) {
    _stops = stopsJson
        .map((s) => StopModel.fromJson(s as Map<String, dynamic>))
        .toList();
    _currentIndex = 0;
    _isRouteComplete = false;
    notifyListeners();
  }

  /// Called by ProofDeliveryScreen when photo + QR + notes are confirmed.
  /// Marks current stop as complete, advances index, notifies listeners.
  /// Returns true if this was the LAST stop (route now complete).
  bool completeCurrentStop({
    String? photoPath,
    String? photoUrl,
    String? qrCode,
    String? deliveryNotes,
  }) {
    if (!hasMoreStops) return false;

    final stop = _stops[_currentIndex];
    stop.isCompleted = true;
    stop.photoPath = photoPath;
    stop.photoUrl = photoUrl;
    stop.qrCode = qrCode ?? '';

    _currentIndex++;

    if (_currentIndex >= _stops.length) {
      _isRouteComplete = true;
    }

    notifyListeners();
    return _isRouteComplete;
  }

  /// Called when a driver explicitly cancels / resets the route.
  void resetRoute() {
    for (final stop in _stops) {
      stop.isCompleted = false;
      stop.photoPath = null;
      stop.photoUrl = null;
      stop.qrCode = null;
    }
    _currentIndex = 0;
    _isRouteComplete = false;
    notifyListeners();
  }
}
