/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { WebLanding as Landing } from "./features/marketing/pages/Landing";
import { CustomerTracking as TrackingPage } from "./features/tracking/pages/Tracking";
import { BillingVerify } from "./features/dashboard/pages/BillingVerify";

// Lazy load dashboard pages for better code splitting
const DashboardOverview = lazy(() =>
  import("./features/dashboard/pages/Overview").then((m) => ({
    default: m.DashboardOverview,
  })),
);
const DashboardDrivers = lazy(() =>
  import("./features/dashboard/pages/Drivers").then((m) => ({
    default: m.DashboardDrivers,
  })),
);
const DashboardDriverDetail = lazy(() =>
  import("./features/dashboard/pages/DriverDetail").then((m) => ({
    default: m.DashboardDriverDetail,
  })),
);
const DashboardOrders = lazy(() =>
  import("./features/dashboard/pages/Orders").then((m) => ({
    default: m.DashboardOrders,
  })),
);
const DashboardOrderDetail = lazy(() =>
  import("./features/dashboard/pages/OrderDetail").then((m) => ({
    default: m.DashboardOrderDetail,
  })),
);
const DashboardTracking = lazy(() =>
  import("./features/dashboard/pages/Tracking").then((m) => ({
    default: m.DashboardTracking,
  })),
);
const DashboardBilling = lazy(() =>
  import("./features/dashboard/pages/Billing").then((m) => ({
    default: m.DashboardBilling,
  })),
);
const DashboardSettings = lazy(() =>
  import("./features/dashboard/pages/Settings").then((m) => ({
    default: m.DashboardSettings,
  })),
);
const DashboardReports = lazy(() =>
  import("./features/dashboard/pages/Reports").then((m) => ({
    default: m.DashboardReports,
  })),
);
const DashboardNotifications = lazy(() =>
  import("./features/dashboard/pages/Notifications").then((m) => ({
    default: m.DashboardNotifications,
  })),
);
const DashboardSignIn = lazy(() =>
  import("./features/auth/pages/SignIn").then((m) => ({
    default: m.DashboardSignIn,
  })),
);
const DashboardSignUp = lazy(() =>
  import("./features/auth/pages/SignUp").then((m) => ({
    default: m.DashboardSignUp,
  })),
);
const ForgotPassword = lazy(() =>
  import("./features/auth/pages/ForgotPassword").then((m) => ({
    default: m.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import("./features/auth/pages/ResetPassword").then((m) => ({
    default: m.ResetPassword,
  })),
);
const VerifyEmail = lazy(() =>
  import("./features/auth/pages/VerifyEmail").then((m) => ({
    default: m.VerifyEmail,
  })),
);
const Privacy = lazy(() =>
  import("./features/marketing/pages/Privacy").then((m) => ({
    default: m.Privacy,
  })),
);
const Terms = lazy(() =>
  import("./features/marketing/pages/Terms").then((m) => ({
    default: m.Terms,
  })),
);

import { DashboardLayout } from "./features/dashboard/components/DashboardLayout";
import { AuthGuard } from "./features/auth/guards/AuthGuard";
import { GuestGuard } from "./features/auth/guards/GuestGuard";
import { ErrorPage } from "./features/errors/pages/ErrorPage";
import { NotFound } from "./features/errors/pages/NotFound";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Suspense fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner />
  </div>
);

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      { path: "/", Component: Landing },

      // ── Marketing & Public Pages ──────────────────────────────
      { path: "/track", Component: TrackingPage },
      { path: "/privacy", Component: Privacy },
      { path: "/terms", Component: Terms },

      {
        path: "/dashboard/signin",
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <DashboardSignIn />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/signup",
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <DashboardSignUp />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/forgot-password",
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <ForgotPassword />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <ResetPassword />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/verify-email",
        element: (
          <GuestGuard>
            <Suspense fallback={<PageLoader />}>
              <VerifyEmail />
            </Suspense>
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/billing/verify",
        element: (
          <AuthGuard>
            <BillingVerify />
          </AuthGuard>
        ),
      },

      {
        path: "/dashboard",
        element: (
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardOverview />
              </Suspense>
            ),
          },
          {
            path: "drivers",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardDrivers />
              </Suspense>
            ),
          },
          {
            path: "driver-detail/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardDriverDetail />
              </Suspense>
            ),
          },
          {
            path: "orders",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardOrders />
              </Suspense>
            ),
          },
          {
            path: "orders/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardOrderDetail />
              </Suspense>
            ),
          },
          {
            path: "tracking",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardTracking />
              </Suspense>
            ),
          },
          {
            path: "billing",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardBilling />
              </Suspense>
            ),
          },
          {
            path: "settings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardSettings />
              </Suspense>
            ),
          },
          {
            path: "reports",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardReports />
              </Suspense>
            ),
          },
          {
            path: "notifications",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DashboardNotifications />
              </Suspense>
            ),
          },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
