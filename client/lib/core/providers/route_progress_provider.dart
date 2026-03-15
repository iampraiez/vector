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
  bool isCompleted;
  String? photoPath;
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
    this.isCompleted = false,
    this.photoPath,
    this.qrCode,
  });
}

/// Shared state that tracks the active route progress throughout the
/// Navigation → PoD → auto-advance loop.
///
/// Consumed in:
///   - NavigationScreen  (reads currentStop, stopList)
///   - ProofDeliveryScreen (calls completeCurrentStop())
///
/// API swap: replace [_defaultStops] with a real fetch from MockRouteService.
class RouteProgressProvider extends ChangeNotifier {
  // ── Mock route data (replace with API payload) ──────────────────────────
  final List<StopModel> _stops = [
    StopModel(
      id: 'STOP-001',
      customerName: 'Jane Smith',
      address: '456 Market Street, Downtown',
      phone: '+1 (555) 234-5678',
      eta: '8 min',
      distance: '2.3 km',
      packages: 2,
      notes: 'Ring doorbell twice',
    ),
    StopModel(
      id: 'STOP-002',
      customerName: 'Bob Johnson',
      address: '789 Oak Avenue, Midtown',
      phone: '+1 (555) 345-6789',
      eta: '18 min',
      distance: '5.7 km',
      packages: 1,
    ),
    StopModel(
      id: 'STOP-003',
      customerName: 'Sarah Williams',
      address: '321 Pine Road, Uptown',
      phone: '+1 (555) 456-7890',
      eta: '32 min',
      distance: '12.4 km',
      packages: 3,
      notes: 'Leave at back porch if no answer',
    ),
    StopModel(
      id: 'STOP-004',
      customerName: 'Mike Davis',
      address: '654 Elm Street, Eastside',
      phone: '+1 (555) 567-8901',
      eta: '45 min',
      distance: '18.9 km',
      packages: 1,
    ),
    StopModel(
      id: 'STOP-005',
      customerName: 'Emily Chen',
      address: '12 Bloom Lane, Westpark',
      phone: '+1 (555) 678-9012',
      eta: '58 min',
      distance: '23.1 km',
      packages: 2,
      notes: 'Fragile — handle with care',
    ),
  ];

  int _currentIndex = 0;
  bool _isRouteComplete = false;

  // ── Getters ──────────────────────────────────────────────────────────────
  List<StopModel> get allStops => List.unmodifiable(_stops);
  int get currentIndex => _currentIndex;
  bool get isRouteComplete => _isRouteComplete;
  bool get hasMoreStops => _currentIndex < _stops.length;

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

  /// Called by ProofDeliveryScreen when photo + QR + notes are confirmed.
  /// Marks current stop as complete, advances index, notifies listeners.
  /// Returns true if this was the LAST stop (route now complete).
  bool completeCurrentStop({
    String? photoPath,
    String? qrCode,
    String? deliveryNotes,
  }) {
    if (!hasMoreStops) return false;

    final stop = _stops[_currentIndex];
    stop.isCompleted = true;
    stop.photoPath = photoPath;
    stop.qrCode = qrCode ?? 'MOCK-QR-${stop.id}';

    _currentIndex++;

    if (_currentIndex >= _stops.length) {
      _isRouteComplete = true;
    }

    notifyListeners();
    return _isRouteComplete;
  }

  /// Called when a driver explicitly cancels / resets the route (API-ready).
  void resetRoute() {
    for (final stop in _stops) {
      stop.isCompleted = false;
      stop.photoPath = null;
      stop.qrCode = null;
    }
    _currentIndex = 0;
    _isRouteComplete = false;
    notifyListeners();
  }
}
