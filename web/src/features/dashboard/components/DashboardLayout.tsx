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
import { TruckIcon } from "@heroicons/react/24/solid";
import { useAuthStore } from "../../../store/authStore";
import { useSettingsStore } from "../../../store/settingsStore";
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
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

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
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800 group-hover:opacity-90 transition-opacity">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-[16px] font-extrabold tracking-[0.04em] text-gray-900">
            VECTOR
          </span>
        </div>
      </SidebarHeader>

      {/* ── Nav items ── */}
      <SidebarContent className="p-3 flex-1">
        <SidebarMenu className="gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={active}
                  onClick={() => handleNav(item.path)}
                  className={`gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                  <span className="font-semibold text-[13px]">
                    {item.label}
                  </span>
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
            <div className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-linear-to-br from-emerald-600 to-emerald-800 text-white text-[13px] font-black tracking-tight select-none shadow-sm">
              {getInitial(user?.email || "User")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-gray-900 leading-none truncate mb-1">
                {company?.name || "Loading..."}
              </p>
              <p className="text-[10px] text-gray-400 truncate font-medium tracking-tight">
                {user?.email || "manager@vector.com"}
              </p>
            </div>
            {/* Sign out icon button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              title="Sign out"
              className="shrink-0 p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <div className="w-4.5 h-4.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
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

  return (
    <SidebarProvider>
      <DashboardSidebar />

      {/* ── Main content area ── */}
      <SidebarInset className="bg-gray-50/50">
        {/* Mobile sticky header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-white px-4 md:hidden">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800">
              <TruckIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-[16px] font-extrabold tracking-[0.04em] text-gray-900">
              VECTOR
            </span>
          </div>
          <SidebarTrigger className="text-gray-500 hover:text-gray-900 transition-colors" />
        </header>

        <main className="flex-1 overflow-y-auto w-full max-w-400 mx-auto">
          {children || <Outlet />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
