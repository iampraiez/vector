import { createBrowserRouter } from "react-router";
import { WebLanding as Landing } from "./features/marketing/pages/Landing";
import { CustomerTracking as TrackingPage } from "./features/tracking/pages/Tracking";
import { DashboardOverview as Overview } from "./features/dashboard/pages/Overview";
import { DashboardDrivers as Drivers } from "./features/dashboard/pages/Drivers";
import { DashboardDriverDetail as DriverDetail } from "./features/dashboard/pages/DriverDetail";
import { DashboardOrders as Orders } from "./features/dashboard/pages/Orders";
import { DashboardTracking as Tracking } from "./features/dashboard/pages/Tracking";
import { DashboardBilling as Billing } from "./features/dashboard/pages/Billing";
import { DashboardSettings as Settings } from "./features/dashboard/pages/Settings";
import { DashboardReports as Reports } from "./features/dashboard/pages/Reports";
import { DashboardSignIn as SignIn } from "./features/auth/pages/SignIn";
import { DashboardSignUp as SignUp } from "./features/auth/pages/SignUp";
import { ForgotPassword } from "./features/auth/pages/ForgotPassword";
import { DashboardNotifications as Notifications } from "./features/dashboard/pages/Notifications";
import { Privacy } from "./features/marketing/pages/Privacy";
import { Terms } from "./features/marketing/pages/Terms";

import { DashboardLayout } from "./features/dashboard/components/DashboardLayout";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },

  // ── Marketing & Public Pages ──────────────────────────────
  { path: "/track", Component: TrackingPage },
  { path: "/privacy", Component: Privacy },
  { path: "/terms", Component: Terms },

  { path: "/dashboard/signin", Component: SignIn },
  { path: "/dashboard/signup", Component: SignUp },
  { path: "/dashboard/forgot-password", Component: ForgotPassword },

  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Overview },
      { path: "drivers", Component: Drivers },
      { path: "driver-detail", Component: DriverDetail },
      { path: "orders", Component: Orders },
      { path: "tracking", Component: Tracking },
      { path: "billing", Component: Billing },
      { path: "settings", Component: Settings },
      { path: "reports", Component: Reports },
      { path: "notifications", Component: Notifications },
    ],
  },
]);
