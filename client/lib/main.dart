import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_foreground_task/flutter_foreground_task.dart';
import 'package:client/core/services/offline_service.dart';
import 'package:client/core/theme/app_theme.dart';
import 'package:client/core/theme/theme_controller.dart';
import 'package:client/core/providers/route_progress_provider.dart';
import 'package:client/core/providers/auth_provider.dart';
import 'package:client/navigation/router.dart';
import 'package:client/firebase_options.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:client/core/services/driver_api_service.dart';
import 'package:client/core/services/notification_service.dart';

final themeController = ThemeController();

/// Global route progress provider — holds active stop list and current index.
/// Accessed from any screen using RouteProgressScope.of(context).
final routeProgressProvider = RouteProgressProvider();

/// Global auth provider — handles login state and token persistence.
final authProvider = AuthProvider();

/// Global notification service
final notificationService = NotificationService.instance;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  FlutterForegroundTask.initCommunicationPort();

  // Initialize Firebase (wrapped in try-catch for missing google-services.json)
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );

    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();
    final token = await messaging.getToken();
    if (token != null) {
      // Fire and forget - will 401 fail gracefully if authProvider hasn't logged in yet
      DriverApiService.instance.registerFcmToken(token).catchError((_) {});
    }
  } catch (e) {
    debugPrint('Firebase init failed (missing strict config?): $e');
  }

  // Initialize offline sync (Hive + connectivity monitor)
  await OfflineService.init();

  // Initialize auth state before app startup
  await authProvider.initialize();

  // Initialize notification state and load local cache
  await notificationService.init();

  // Listen to FCM push notifications while app is in foreground
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    if (message.notification != null) {
      notificationService.handleIncomingSocketNotification({
        'id': message.messageId ?? DateTime.now().millisecondsSinceEpoch.toString(),
        'title': message.notification?.title ?? '',
        'body': message.notification?.body ?? '',
        ...message.data,
        'created_at': DateTime.now().toIso8601String(),
      });
    }
  });

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const VectorApp());
}

class VectorApp extends StatelessWidget {
  const VectorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: themeController,
      builder: (context, _) {
        return AuthScope(
          provider: authProvider,
          child: NotificationScope(
            provider: notificationService,
            child: RouteProgressScope(
              provider: routeProgressProvider,
              child: MaterialApp.router(
                debugShowCheckedModeBanner: false,
                title: 'Vector',
                theme: AppTheme.lightTheme,
                darkTheme: AppTheme.darkTheme,
                themeMode: themeController.themeMode,
                routerConfig: appRouter,
              ),
            ),
          ),
        );
      },
    );
  }
}

/// InheritedWidget for AuthProvider
class AuthScope extends InheritedNotifier<AuthProvider> {
  const AuthScope({
    super.key,
    required AuthProvider provider,
    required super.child,
  }) : super(notifier: provider);

  static AuthProvider of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AuthScope>();
    assert(scope != null, 'No AuthScope found in the widget tree.');
    return scope!.notifier!;
  }
}

/// InheritedWidget for NotificationService
class NotificationScope extends InheritedNotifier<NotificationService> {
  const NotificationScope({
    super.key,
    required NotificationService provider,
    required super.child,
  }) : super(notifier: provider);

  static NotificationService of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<NotificationScope>();
    assert(scope != null, 'No NotificationScope found in the widget tree.');
    return scope!.notifier!;
  }
}

/// InheritedWidget that makes [RouteProgressProvider] accessible
/// to any descendant via [RouteProgressScope.of(context)].
class RouteProgressScope extends InheritedNotifier<RouteProgressProvider> {
  const RouteProgressScope({
    super.key,
    required RouteProgressProvider provider,
    required super.child,
  }) : super(notifier: provider);

  static RouteProgressProvider of(BuildContext context) {
    final scope = context
        .dependOnInheritedWidgetOfExactType<RouteProgressScope>();
    assert(scope != null, 'No RouteProgressScope found in the widget tree.');
    return scope!.notifier!;
  }
}
