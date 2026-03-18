import 'package:go_router/go_router.dart';

// Driver App
import '../features/driver_app/welcome.dart';
import '../features/driver_app/sign_in.dart' as driver_signin;
import '../features/driver_app/sign_up.dart' as driver_signup;
import '../features/driver_app/verify_email.dart';
import '../features/driver_app/forgot_password.dart';
import '../features/driver_app/onboarding.dart';
import '../features/driver_app/home.dart';
import '../features/driver_app/assignments.dart';
import '../features/driver_app/new_route.dart';
import '../features/driver_app/route_preview.dart';
import '../features/driver_app/navigation.dart';
import '../features/driver_app/proof_delivery.dart';
import '../features/driver_app/history.dart';
import '../features/driver_app/profile.dart';
import '../features/driver_app/settings.dart' as driver_settings;
import '../features/driver_app/notifications.dart' as driver_notifications;

import 'package:client/main.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/driver',
  refreshListenable: authProvider,
  redirect: (context, state) {
    final auth = authProvider;
    final isAuth = auth.isAuthenticated;

    final authPaths = ['/driver', '/signin', '/signup'];
    // We explicitly allow /forgot-password even if authenticated as per user request
    // and /verify-email might be needed after signup

    final isGoingToAuth = authPaths.contains(state.uri.path);

    if (!isAuth &&
        !isGoingToAuth &&
        state.uri.path != '/forgot-password' &&
        state.uri.path != '/verify-email') {
      return '/driver';
    }

    if (isAuth && isGoingToAuth) {
      return '/home';
    }

    return null;
  },
  routes: <RouteBase>[
    // Driver App - Welcome & Auth
    GoRoute(
      path: '/driver',
      builder: (context, state) => const WelcomeScreen(),
    ),
    GoRoute(
      path: '/signin',
      builder: (context, state) => const driver_signin.SignInScreen(),
    ),
    GoRoute(
      path: '/signup',
      builder: (context, state) => const driver_signup.SignUpScreen(),
    ),
    GoRoute(
      path: '/verify-email',
      builder: (context, state) {
        final email = state.uri.queryParameters['email'] ?? '';
        return VerifyEmailScreen(email: email);
      },
    ),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),

    // Driver App - Onboarding & Main
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
    GoRoute(
      path: '/assignments',
      builder: (context, state) => const AssignmentsScreen(),
    ),
    GoRoute(
      path: '/new-route',
      builder: (context, state) => const NewRouteScreen(),
    ),
    GoRoute(
      path: '/route-preview',
      builder: (context, state) => const RoutePreviewScreen(),
    ),
    GoRoute(
      path: '/navigation',
      builder: (context, state) => const NavigationScreen(),
    ),
    GoRoute(
      path: '/proof-delivery',
      builder: (context, state) {
        final fromNav = state.uri.queryParameters['fromNav'] == 'true';
        return ProofDeliveryScreen(fromNav: fromNav);
      },
    ),
    GoRoute(
      path: '/history',
      builder: (context, state) => const HistoryScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (context, state) => const ProfileScreen(),
    ),
    GoRoute(
      path: '/settings',
      builder: (context, state) => const driver_settings.SettingsScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (context, state) =>
          const driver_notifications.NotificationsScreen(),
    ),
  ],
);
