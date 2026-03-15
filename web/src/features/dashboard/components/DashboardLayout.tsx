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
  PowerIcon,
  BellIcon,
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
} from "../../../components/ui/sidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-r border-black/5 bg-white">
        <SidebarHeader className="p-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              VECTOR
            </span>
          </div>
          <p className="text-[10px] text-gray-400 tracking-[1px] uppercase font-bold mt-1">
            Fleet Management
          </p>
        </SidebarHeader>

        <SidebarContent className="p-4">
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={active}
                    onClick={() => navigate(item.path)}
                    className={`gap-3 px-4 py-6 rounded-xl transition-all duration-300 ${
                      active
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-black/5">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <Avatar className="w-10 h-10 border-2 border-emerald-100 group-hover:border-emerald-300 transition-colors">
              <AvatarImage src="" />
              <AvatarFallback className="bg-emerald-600 text-white font-bold">
                FM
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">
                Fleet Manager
              </p>
              <p className="text-xs text-gray-400 truncate">
                manager@vector.com
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/dashboard/signin")}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 hover:bg-red-100 transition-all duration-300"
          >
            <PowerIcon className="w-4 h-4" />
            Sign out
          </button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-gray-50/50">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-black/5 bg-white/80 backdrop-blur-md px-6 md:hidden">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-bold text-gray-900">VECTOR</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto w-full max-w-400 mx-auto">
          {children || <Outlet />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
