import 'package:go_router/go_router.dart';

// Driver App
// Auth
import '../features/auth/welcome.dart';
import '../features/auth/sign_in.dart' as driver_signin;
import '../features/auth/sign_up.dart' as driver_signup;
import '../features/auth/verify_email.dart';
import '../features/auth/forgot_password.dart';
import '../features/auth/onboarding.dart';

// Home & Core Features
import '../features/home/home.dart';
import '../features/routes/assignments.dart';
import '../features/routes/new_route.dart';
import '../features/routes/route_preview.dart';
import '../features/routes/navigation.dart';
import '../features/routes/proof_delivery.dart';
import '../features/history/history.dart';
import '../features/profile/profile.dart';
import '../features/settings/settings.dart' as driver_settings;
import '../features/notifications/notifications.dart' as driver_notifications;

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
      if (!auth.user!.emailVerified) return '/verify-email?email=${auth.user!.email}';
      if (!auth.user!.isOnboarded) return '/onboarding';
      return '/home';
    }

    if (isAuth) {
      if (!auth.user!.emailVerified && state.uri.path != '/verify-email') {
        return '/verify-email?email=${auth.user!.email}';
      }
      if (auth.user!.emailVerified && !auth.user!.isOnboarded && state.uri.path != '/onboarding') {
        return '/onboarding';
      }
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
      builder: (context, state) {
        final tab = state.uri.queryParameters['tab'];
        return NewRouteScreen(isManualTab: tab != 'import');
      },
    ),
    GoRoute(
      path: '/route-preview',
      builder: (context, state) => RoutePreviewScreen(
        routeData: state.extra as Map<String, dynamic>?,
      ),
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
