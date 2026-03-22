import '../providers/route_progress_provider.dart';

/// Mock service that simulates API calls for route management.
///
/// API swap: Replace each Future with a real HTTP call (Dio / http package).
/// Endpoints suggested:
///   GET  /api/routes/assigned          → getAssignedStops()
///   POST /api/stops/{id}/complete      → completeStop()
///   POST /api/reports/export           → exportReport()
///   POST /api/auth/login               → login()
class MockRouteService {
  // Singleton pattern — one shared instance across the app
  static final MockRouteService instance = MockRouteService._();
  MockRouteService._();

  /// Fetch today's assigned stops (simulates network call with 600ms delay).
  /// API swap: replace with `dio.get('/api/routes/assigned')`
  Future<List<StopModel>> getAssignedStops() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return [
      StopModel(
        id: 'STOP-001',
        customerName: 'Jane Smith',
        address: '456 Market Street, Downtown',
        phone: '+1 (555) 234-5678',
        eta: '8 min',
        distance: '2.3 km',
        packages: 2,
        notes: 'Ring doorbell twice',
        trackingToken: 'mock-tracking-STOP-001',
      ),
      StopModel(
        id: 'STOP-002',
        customerName: 'Bob Johnson',
        address: '789 Oak Avenue, Midtown',
        phone: '+1 (555) 345-6789',
        eta: '18 min',
        distance: '5.7 km',
        packages: 1,
        trackingToken: 'mock-tracking-STOP-002',
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
        trackingToken: 'mock-tracking-STOP-003',
      ),
      StopModel(
        id: 'STOP-004',
        customerName: 'Mike Davis',
        address: '654 Elm Street, Eastside',
        phone: '+1 (555) 567-8901',
        eta: '45 min',
        distance: '18.9 km',
        packages: 1,
        trackingToken: 'mock-tracking-STOP-004',
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
        trackingToken: 'mock-tracking-STOP-005',
      ),
    ];
  }

  /// Mark a stop as complete with PoD data (photo, QR, notes).
  /// API swap: replace with `dio.post('/api/stops/$stopId/complete', data: podData)`
  Future<bool> completeStop({
    required String stopId,
    required String photoPath,
    required String qrCode,
    String? notes,
  }) async {
    await Future.delayed(const Duration(milliseconds: 400));
    // Simulate success — in real API, check response status code
    return true;
  }

  /// Trigger report export for a date range.
  /// API swap: replace with `dio.post('/api/reports/export', data: {range})`
  Future<bool> exportReport({required String range}) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return true;
  }

  /// Mock login — returns a fake JWT token.
  /// API swap: replace with `dio.post('/api/auth/login', data: {email, password})`
  Future<String?> login({
    required String email,
    required String password,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1200));
    // Simulate valid login for any non-empty creds
    if (email.isNotEmpty && password.length >= 8) {
      return 'mock_jwt_token_${email.hashCode}';
    }
    return null; // Null = failed login
  }
}
