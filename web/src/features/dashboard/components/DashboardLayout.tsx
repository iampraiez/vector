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
  TruckIcon,
} from "@heroicons/react/24/outline";
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

const USER_NAME = "Fleet Manager";
const USER_EMAIL = "manager@vector.com";

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpenMobile, isMobile } = useSidebar();

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

  return (
    <Sidebar variant="inset" className="bg-sidebar border-r border-black/5">
      {/* ── Brand header ── */}
      <SidebarHeader className="px-5 py-4 border-b border-black/5">
        <div
          onClick={() => handleNav("/")}
          className="flex items-center gap-2.5 cursor-pointer group w-fit"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800 group-hover:opacity-90 transition-opacity">
            <TruckIcon className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
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
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-3">
            {/* Avatar — single initial */}
            <div className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-emerald-600 to-emerald-800 text-white text-[14px] font-black tracking-tight select-none">
              {getInitial(USER_NAME)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 leading-tight truncate">
                {USER_NAME}
              </p>
              <p className="text-[11px] text-gray-400 truncate font-medium">
                {USER_EMAIL}
              </p>
            </div>
            {/* Sign out icon button */}
            <button
              onClick={() => handleNav("/dashboard/signin")}
              title="Sign out"
              className="shrink-0 p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="w-4.5 h-4.5" />
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
              <TruckIcon className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
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
