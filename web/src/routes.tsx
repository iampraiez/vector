import { createBrowserRouter } from "react-router";
import { WebLanding as Landing } from "./features/marketing/pages/Landing";
import { CustomerTracking as TrackingPage } from "./features/tracking/pages/Tracking";
import { DashboardOverview as Overview } from "./features/dashboard/pages/Overview";
import { DashboardDrivers as Drivers } from "./features/dashboard/pages/Drivers";
import { DashboardDriverDetail as DriverDetail } from "./features/dashboard/pages/DriverDetail";
import { DashboardOrders as Orders } from "./features/dashboard/pages/Orders";
// import { DashboardOrderDetail as OrderDetail } from "./features/dashboard/pages/OrderDetail";
import { DashboardTracking as Tracking } from "./features/dashboard/pages/Tracking";
import { DashboardBilling as Billing } from "./features/dashboard/pages/Billing";
import { DashboardSettings as Settings } from "./features/dashboard/pages/Settings";
import { DashboardReports as Reports } from "./features/dashboard/pages/Reports";
import { DashboardSignIn as SignIn } from "./features/auth/pages/SignIn";
import { DashboardSignUp as SignUp } from "./features/auth/pages/SignUp";
import { ForgotPassword } from "./features/auth/pages/ForgotPassword";
import { ResetPassword } from "./features/auth/pages/ResetPassword";
import { VerifyEmail } from "./features/auth/pages/VerifyEmail";
import { DashboardNotifications as Notifications } from "./features/dashboard/pages/Notifications";
import { Privacy } from "./features/marketing/pages/Privacy";
import { Terms } from "./features/marketing/pages/Terms";

import { DashboardLayout } from "./features/dashboard/components/DashboardLayout";
import { AuthGuard } from "./features/auth/guards/AuthGuard";
import { GuestGuard } from "./features/auth/guards/GuestGuard";
import { ErrorPage } from "./features/errors/pages/ErrorPage";
import { NotFound } from "./features/errors/pages/NotFound";

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
            <SignIn />
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/signup",
        element: (
          <GuestGuard>
            <SignUp />
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/forgot-password",
        element: (
          <GuestGuard>
            <ForgotPassword />
          </GuestGuard>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <GuestGuard>
            <ResetPassword />
          </GuestGuard>
        ),
      },
      {
        path: "/dashboard/verify-email",
        element: (
          <GuestGuard>
            <VerifyEmail />
          </GuestGuard>
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
          { index: true, Component: Overview },
          { path: "drivers", Component: Drivers },
          { path: "driver-detail/:id", Component: DriverDetail },
          { path: "orders", Component: Orders },
          // { path: "orders/:id", Component: OrderDetail },
          { path: "tracking", Component: Tracking },
          { path: "billing", Component: Billing },
          { path: "settings", Component: Settings },
          { path: "reports", Component: Reports },
          { path: "notifications", Component: Notifications },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
