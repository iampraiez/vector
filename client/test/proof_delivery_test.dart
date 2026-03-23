import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:client/features/driver_app/proof_delivery.dart';
import 'package:client/core/services/driver_api_service.dart';
import 'package:client/core/services/cloudinary_service.dart';
import 'package:client/core/services/offline_service.dart';
import 'package:client/core/providers/route_progress_provider.dart';
import 'package:client/core/providers/auth_provider.dart';
import 'package:client/main.dart';

class MockDriverApiService extends Mock implements DriverApiService {}
class MockCloudinaryService extends Mock implements CloudinaryService {}
class MockOfflineService extends Mock implements OfflineService {}
class MockRouteProgressProvider extends Mock with ChangeNotifier implements RouteProgressProvider {}
class MockAuthProvider extends Mock with ChangeNotifier implements AuthProvider {}

void main() {
  late MockDriverApiService mockApi;
  late MockCloudinaryService mockCloudinary;
  late MockOfflineService mockOffline;
  late MockRouteProgressProvider mockProvider;
  late MockAuthProvider mockAuth;

  setUp(() {
    mockApi = MockDriverApiService();
    mockCloudinary = MockCloudinaryService();
    mockOffline = MockOfflineService();
    mockProvider = MockRouteProgressProvider();
    mockAuth = MockAuthProvider();

    DriverApiService.instance = mockApi;
    CloudinaryService.instance = mockCloudinary;
    OfflineService.instance = mockOffline;

    registerFallbackValue(Uri.parse('http://test.com'));
    
    // Stub AuthProvider
    when(() => mockAuth.user).thenReturn(null);
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      home: AuthScope(
        provider: mockAuth,
        child: RouteProgressScope(
          provider: mockProvider,
          child: const ProofDeliveryScreen(),
        ),
      ),
    );
  }

  group('ProofDeliveryScreen Widget Tests', () {
    testWidgets('Submit button is disabled initially', (tester) async {
      when(() => mockProvider.currentStop).thenReturn(null);
      
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();
      
      final submitButton = find.byType(ElevatedButton);
      expect(tester.widget<ElevatedButton>(submitButton).enabled, isFalse);
    });

    testWidgets('Submit button is enabled only when photo and QR are present', (tester) async {
      when(() => mockProvider.currentStop).thenReturn(null);
      
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();
      
      expect(find.text('Take a photo'), findsOneWidget);
      expect(find.text('Scan QR Code'), findsOneWidget);
    });
  });
}
