import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router";
import {
  Squares2X2Icon,
  UsersIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { useAuthStore } from "../../../store/authStore";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useSettingsStore } from "../../../store/settingsStore";
import { useNotificationsStore } from "../../../store/notificationsStore";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from "../../../components/ui/sidebar";
import { OnboardingTour } from "../../../components/ui/OnboardingTour";
import { Toaster } from "../../../components/ui/sonner";
import { Skeleton } from "../../../components/ui/skeleton";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

// Helper to get initials from email or name
function getInitial(identifier: string) {
  if (!identifier) return "U";
  return identifier.trim().charAt(0).toUpperCase();
}

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();
  const { user, logout } = useAuthStore();
  const { company, fetchSettings } = useSettingsStore();
  const { notifications } = useNotificationsStore();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  React.useEffect(() => {
    if (!company) {
      fetchSettings();
    }
  }, [company, fetchSettings]);

  const navItems = [
    { path: "/dashboard", icon: Squares2X2Icon, label: "Overview" },
    { path: "/dashboard/drivers", icon: UsersIcon, label: "Drivers" },
    { path: "/dashboard/orders", icon: ArchiveBoxIcon, label: "Orders" },
    { path: "/dashboard/tracking", icon: MapPinIcon, label: "Live Tracking" },
    { path: "/dashboard/reports", icon: ChartBarIcon, label: "Reports" },
    { path: "/dashboard/billing", icon: CreditCardIcon, label: "Billing" },
    {
      path: "/dashboard/notifications",
      icon: BellIcon,
      label: "Notifications",
    },
    { path: "/dashboard/settings", icon: Cog6ToothIcon, label: "Settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar variant="inset" className="bg-sidebar border-r border-black/5">
      {/* ── Brand header ── */}
      <SidebarHeader className="px-5 py-4 border-b border-black/5">
        <div
          onClick={() => handleNav("/")}
          className="flex items-center gap-2.5 cursor-pointer group w-fit"
        >
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-emerald-600 group-hover:bg-emerald-700 transition-colors shadow-[0_2px_8px_rgba(5,150,105,0.35),0_0_0_1px_rgba(5,150,105,0.1)]">
            <LocalShippingIcon size={20} className="text-white" />
          </div>
          <span className="text-[17px] font-black tracking-[-0.5px] text-gray-900">
            VECTOR
          </span>
        </div>
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="p-3 flex-1 pb-24 md:pb-3">
        <SidebarMenu className="gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={active}
                  onClick={() => handleNav(item.path)}
                  className={`px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="font-semibold text-[13px]">
                      {item.label}
                    </span>
                  </div>
                  {item.path === "/dashboard/notifications" &&
                    unreadCount > 0 && (
                      <div
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {unreadCount}
                      </div>
                    )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* ── User footer ── */}
      <SidebarFooter className="p-3 border-t border-black/5">
        <div className="bg-white border border-black/5 rounded-xl p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            {/* Avatar — single initial */}
            <div className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white text-[13px] font-black tracking-tight select-none shadow-sm">
              {getInitial(user?.full_name || "User")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="mb-1.5">
                {!company?.name ? (
                  <Skeleton className="h-3 w-24 bg-black/5" />
                ) : (
                  <p className="text-[12px] font-bold text-gray-900 leading-none truncate">
                    {company.name}
                  </p>
                )}
              </div>
              <div>
                {!user?.email ? (
                  <Skeleton className="h-2.5 w-32 bg-black/5" />
                ) : (
                  <p className="text-[10px] text-gray-400 truncate font-medium tracking-tight">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
            {/* Sign out icon button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              title="Sign out"
              className="shrink-0 p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-9 min-h-9"
            >
              {isLoggingOut ? (
                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
              ) : (
                <ArrowRightStartOnRectangleIcon className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addNotificationToState, fetchNotifications } =
    useNotificationsStore();

  React.useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  React.useEffect(() => {
    if (!user?.id) return;

    // Connect to backend WebSocket
    const socket: Socket = io(
      import.meta.env.VITE_API_URL || "http://localhost:8080",
      {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      },
    );

    socket.on("connect", () => {
      // console.log("Connected to notifications socket (ID:", socket.id, ")");
      socket.emit("join", user.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection error:", err.message);
    });

    socket.on("notification", (payload: Record<string, unknown>) => {
      addNotificationToState(payload);

      const title = payload.title as string;
      const body = payload.body as string;
      const isTelemetry = title?.includes("Telemetry");
      const isOnline = body?.includes("connected");

      if (isTelemetry) {
        if (isOnline) {
          toast.success(title, {
            description: body,
            action: {
              label: "View",
              onClick: () => navigate("/dashboard/notifications"),
            },
          });
        } else {
          toast.error(title, {
            description: body,
            action: {
              label: "View",
              onClick: () => navigate("/dashboard/notifications"),
            },
          });
        }
      } else {
        toast.message(title, {
          description: body,
          icon: <BellIcon className="w-4 h-4 text-emerald-600" />,
          action: {
            label: "View",
            onClick: () => navigate("/dashboard/notifications"),
          },
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, navigate, addNotificationToState]);

  const location = useLocation();

  const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": {
      title: "Overview",
      subtitle: "Fleet summary & key metrics",
    },
    "/dashboard/drivers": {
      title: "Drivers",
      subtitle: "Manage your driver roster",
    },
    "/dashboard/orders": {
      title: "Orders",
      subtitle: "View & dispatch deliveries",
    },
    "/dashboard/tracking": {
      title: "Live Tracking",
      subtitle: "Real-time fleet positions",
    },
    "/dashboard/reports": {
      title: "Reports",
      subtitle: "Analytics & export data",
    },
    "/dashboard/billing": {
      title: "Billing",
      subtitle: "Plans & payment info",
    },
    "/dashboard/notifications": {
      title: "Notifications",
      subtitle: "Activity & alerts",
    },
    "/dashboard/settings": {
      title: "Settings",
      subtitle: "Account & company settings",
    },
  };

  const currentPage = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(
      ([path]) =>
        location.pathname === path ||
        (path !== "/dashboard" && location.pathname.startsWith(path)),
    );

  const pageTitle = currentPage?.[1].title ?? "Dashboard";
  const pageSubtitle = currentPage?.[1].subtitle ?? "";

  return (
    <SidebarProvider>
      <OnboardingTour />
      <DashboardSidebar />
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand={false}
        theme="light"
        toastOptions={{
          style: {
            borderRadius: "18px",
            border: "1px solid rgba(0,0,0,0.05)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
          },
        }}
      />

      {/* ── Main content area ── */}
      <SidebarInset className="bg-gray-50/50 min-w-0 overflow-x-hidden">
        {/* ── Top header (mobile: logo + trigger / desktop: page title + trigger) ── */}
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-black/5 bg-white/90 backdrop-blur-sm px-4 gap-3">
          <SidebarTrigger className="shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg w-8 h-8 flex items-center justify-center transition-all duration-200" />

          {/* Mobile: show logo */}
          <div
            onClick={() => navigate("/")}
            className="flex md:hidden items-center gap-2.5 cursor-pointer group"
          >
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-emerald-600 group-hover:bg-emerald-700 transition-colors shadow-[0_2px_8px_rgba(5,150,105,0.35),0_0_0_1px_rgba(5,150,105,0.1)]">
              <LocalShippingIcon size={20} className="text-white" />
            </div>
            <span className="text-[17px] font-black tracking-[-0.5px] text-gray-900">
              VECTOR
            </span>
          </div>

          {/* Desktop: show page title with a subtle separator */}
          <div className="hidden md:flex items-center gap-3 flex-1 min-w-0">
            <div className="w-px h-4 bg-black/8 shrink-0" />
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-900 leading-none truncate">
                {pageTitle}
              </p>
              {pageSubtitle && (
                <p className="text-[11px] text-gray-400 font-medium leading-none mt-0.5 truncate">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 px-1 w-full max-w-400 mx-auto min-w-0 overflow-x-hidden">
          <BillingLockoutGuard>{children || <Outlet />}</BillingLockoutGuard>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function BillingLockoutGuard({ children }: { children: React.ReactNode }) {
  const { billing, fetchBillingInfo } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchBillingInfo();
  }, [fetchBillingInfo]);

  const isBillingRoute =
    location.pathname.includes("/dashboard/billing") ||
    location.pathname.includes("/dashboard/settings");

  if (!billing) return <>{children}</>;

  const isTrialExpired =
    billing.status === "trialing" &&
    new Date() > new Date(billing.current_period_end);
  const isPastDue = billing.status === "past_due";
  const isLocked = isTrialExpired || isPastDue;

  if (isLocked && !isBillingRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <CreditCardIcon className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Subscription Required
        </h2>
        <p className="text-gray-500 max-w-md mb-8">
          {isTrialExpired
            ? "Your 14-day free trial has expired. To continue using Vector Fleet, please select a plan and add a payment method."
            : "Your account is past due. Please update your payment method to restore access."}
        </p>
        <button
          onClick={() => navigate("/dashboard/billing")}
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
        >
          Go to Billing
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
