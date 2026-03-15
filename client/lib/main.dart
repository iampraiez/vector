import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:client/core/theme/app_theme.dart';
import 'package:client/core/theme/theme_controller.dart';
import 'package:client/core/providers/route_progress_provider.dart';
import 'package:client/navigation/router.dart';

final themeController = ThemeController();

/// Global route progress provider — holds active stop list and current index.
/// Accessed from any screen using RouteProgressScope.of(context).
final routeProgressProvider = RouteProgressProvider();

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
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
        return RouteProgressScope(
          provider: routeProgressProvider,
          child: MaterialApp.router(
            debugShowCheckedModeBanner: false,
            title: 'Vector',
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeController.themeMode,
            routerConfig: appRouter,
          ),
        );
      },
    );
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
