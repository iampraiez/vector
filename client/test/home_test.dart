import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:client/features/driver_app/home.dart';
import 'package:client/core/services/driver_api_service.dart';
import 'package:client/core/services/location_service.dart';
import 'package:client/core/providers/auth_provider.dart';
import 'package:client/core/providers/route_progress_provider.dart';
import 'package:client/main.dart';
import 'package:geolocator/geolocator.dart';
import 'package:shared_preferences/shared_preferences.dart';

class MockDriverApiService extends Mock implements DriverApiService {}
class MockLocationService extends Mock implements LocationService {}
class MockAuthProvider extends Mock with ChangeNotifier implements AuthProvider {}
class MockRouteProgressProvider extends Mock with ChangeNotifier implements RouteProgressProvider {}

void main() {
  late MockDriverApiService mockApi;
  late MockLocationService mockLocation;
  late MockAuthProvider mockAuth;
  late MockRouteProgressProvider mockRouteProgress;

  setUp(() {
    mockApi = MockDriverApiService();
    mockLocation = MockLocationService();
    mockAuth = MockAuthProvider();
    mockRouteProgress = MockRouteProgressProvider();

    DriverApiService.instance = mockApi;
    LocationService.instance = mockLocation;
    
    // Stub AuthProvider
    when(() => mockAuth.user).thenReturn(null);
    
    // Stub LocationService
    when(() => mockLocation.isServiceEnabled()).thenAnswer((_) async => true);
    when(() => mockLocation.checkPermission()).thenAnswer((_) async => LocationPermission.always);
    when(() => mockLocation.getServiceStatusStream()).thenAnswer((_) => const Stream.empty());
    
    SharedPreferences.setMockInitialValues({});
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: AuthScope(
        provider: mockAuth,
        child: RouteProgressScope(
          provider: mockRouteProgress,
          child: const HomeScreen(),
        ),
      ),
    );
  }

  group('HomeScreen Widget Tests', () {
    testWidgets('Shows greeting and offline status by default', (tester) async {
      tester.view.physicalSize = const Size(1200, 1600);
      addTearDown(() => tester.view.resetPhysicalSize());

      when(() => mockApi.getHomeSummary()).thenAnswer((_) async => {
        'status': 'offline',
        'deliveries_today': 0,
        'total_deliveries': 0,
        'pending_stops': 0,
        'rating': 5.0,
      });

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pump(const Duration(milliseconds: 500)); // Initial load

      expect(find.textContaining('Offline'), findsOneWidget);
    });

    testWidgets('Duty toggle triggers API call', (tester) async {
      tester.view.physicalSize = const Size(1200, 1600);
      addTearDown(() => tester.view.resetPhysicalSize());

      int callCount = 0;
      when(() => mockApi.getHomeSummary()).thenAnswer((_) async {
        if (callCount == 0) {
          callCount++;
          return {
            'status': 'offline',
            'deliveries_today': 0,
            'total_deliveries': 0,
            'pending_stops': 0,
            'rating': 5.0,
          };
        }
        return {
          'status': 'active',
          'deliveries_today': 0,
          'total_deliveries': 0,
          'pending_stops': 0,
          'rating': 5.0,
          'last_active_at': DateTime.now().toIso8601String(),
        };
      });
      
      when(() => mockApi.updateStatus(any())).thenAnswer((_) async => {});

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pump(const Duration(milliseconds: 500)); // Wait for initial load

      final dutySwitchFinder = find.byType(Switch);
      final dutySwitch = tester.widget<Switch>(dutySwitchFinder);
      expect(dutySwitch.value, isFalse);

      // Manually trigger onChanged
      dutySwitch.onChanged!(true);
      
      // Pump several times to handle the sequence updateStatus -> loadData -> setState(_isToggling = false)
      await tester.pump(); // setState(true)
      await tester.pump(const Duration(milliseconds: 100)); // updateStatus
      await tester.pump(const Duration(milliseconds: 100)); // loadData
      await tester.pump(const Duration(milliseconds: 100)); // setState(false)

      verify(() => mockApi.updateStatus('active')).called(1);
    });
  });
}
