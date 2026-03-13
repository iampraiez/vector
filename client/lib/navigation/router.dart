import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';

// Marketing Site
import '../features/marketing_site/web_landing.dart';

// Customer Tracking
import '../features/customer_tracking/customer_tracking.dart';

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

// Fleet Dashboard
import '../features/fleet_dashboard/sign_in.dart' as fleet_signin;
import '../features/fleet_dashboard/sign_up.dart' as fleet_signup;
import '../features/fleet_dashboard/overview.dart';
import '../features/fleet_dashboard/drivers.dart';
import '../features/fleet_dashboard/driver_detail.dart';
import '../features/fleet_dashboard/orders.dart';
import '../features/fleet_dashboard/tracking.dart';
import '../features/fleet_dashboard/billing.dart';
import '../features/fleet_dashboard/settings.dart' as fleet_settings;
import '../features/fleet_dashboard/reports.dart';
import '../features/fleet_dashboard/notifications.dart' as fleet_notifications;

final GoRouter appRouter = GoRouter(
  initialLocation: kIsWeb ? '/' : '/driver',
  redirect: (context, state) {
    final location = state.uri.toString();

    // Web-only paths
    final isWebPath =
        location == '/' ||
        location.startsWith('/dashboard') ||
        location == '/track';

    if (kIsWeb) {
      // On Web, if trying to access driver app paths, redirect to landing
      if (!isWebPath) return '/';
    } else {
      // On Mobile, if trying to access web-only paths, redirect to driver welcome
      if (isWebPath) return '/driver';
    }

    return null;
  },
  routes: <RouteBase>[
    // Web Landing (public marketing page)
    GoRoute(path: '/', builder: (context, state) => const WebLandingScreen()),

    // Customer Tracking (public)
    GoRoute(
      path: '/track',
      builder: (context, state) => const CustomerTrackingScreen(),
    ),

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
      builder: (context, state) => const VerifyEmailScreen(),
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
      builder: (context, state) => const ProofDeliveryScreen(),
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

    // Fleet Dashboard
    GoRoute(
      path: '/dashboard/signin',
      builder: (context, state) => const fleet_signin.DashboardSignInScreen(),
    ),
    GoRoute(
      path: '/dashboard/signup',
      builder: (context, state) => const fleet_signup.DashboardSignUpScreen(),
    ),
    GoRoute(
      path: '/dashboard',
      builder: (context, state) => const DashboardOverviewScreen(),
    ),
    GoRoute(
      path: '/dashboard/drivers',
      builder: (context, state) => const DashboardDriversScreen(),
    ),
    GoRoute(
      path: '/dashboard/driver-detail',
      builder: (context, state) => const DashboardDriverDetailScreen(),
    ),
    GoRoute(
      path: '/dashboard/orders',
      builder: (context, state) => const DashboardOrdersScreen(),
    ),
    GoRoute(
      path: '/dashboard/tracking',
      builder: (context, state) => const DashboardTrackingScreen(),
    ),
    GoRoute(
      path: '/dashboard/billing',
      builder: (context, state) => const DashboardBillingScreen(),
    ),
    GoRoute(
      path: '/dashboard/settings',
      builder: (context, state) =>
          const fleet_settings.DashboardSettingsScreen(),
    ),
    GoRoute(
      path: '/dashboard/reports',
      builder: (context, state) => const DashboardReportsScreen(),
    ),
    GoRoute(
      path: '/dashboard/notifications',
      builder: (context, state) =>
          const fleet_notifications.DashboardNotificationsScreen(),
    ),
  ],
);
