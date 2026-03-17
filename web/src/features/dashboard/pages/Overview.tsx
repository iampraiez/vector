import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDashboardStore } from "../../../store/dashboardStore";

import {
  UsersIcon,
  ArchiveBoxIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  MapPinIcon,
  SignalIcon,
  ChevronRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { NewOrderModal } from "../components/NewOrderModal";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function DashboardOverview() {
  const navigate = useNavigate();
  const {
    metrics,
    activeDrivers,
    recentOrders,
    isLoading,
    fetchDashboardData,
  } = useDashboardStore();
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const metricsData = [
    {
      label: "Active Drivers",
      value: metrics?.active_drivers ?? "—",
      change: metrics?.active_drivers_change ?? "—",
      trend:
        metrics?.active_drivers_change?.startsWith("+") ||
        metrics?.active_drivers_change === "+0"
          ? "up"
          : "down",
      icon: UsersIcon,
    },
    {
      label: "Pending Orders",
      value: metrics?.pending_orders ?? "—",
      change: metrics?.pending_orders_change ?? "—",
      trend:
        metrics?.pending_orders_change?.startsWith("+") ||
        metrics?.pending_orders_change === "+0"
          ? "up"
          : "down",
      icon: ArchiveBoxIcon,
    },
    {
      label: "On-time Rate",
      value: metrics?.on_time_rate != null ? `${metrics.on_time_rate}%` : "N/A",
      change:
        metrics?.on_time_rate != null ? `${metrics.on_time_rate_change}%` : "—",
      trend:
        metrics?.on_time_rate_change?.startsWith("+") ||
        metrics?.on_time_rate_change === "+0"
          ? "up"
          : "down",
      icon: ArrowTrendingUpIcon,
    },
    {
      label: "Fuel Saved",
      value:
        metrics && metrics.fuel_saved_usd > 0
          ? `$${metrics.fuel_saved_usd}`
          : "N/A",
      change: metrics?.fuel_saved_change
        ? `${metrics.fuel_saved_change}%`
        : "—",
      trend:
        metrics?.fuel_saved_change?.startsWith("+") ||
        metrics?.fuel_saved_change === "+0"
          ? "up"
          : "down",
      icon: BanknotesIcon,
    },
  ];

  const statusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return { bg: "#ECFDF5", color: "#059669" };
      case "in-progress":
      case "in_progress":
        return { bg: "#EFF6FF", color: "#3B82F6" };
      case "assigned":
        return { bg: "#FEF3C7", color: "#D97706" };
      default:
        return { bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  const handleSaveOrder = () => {
    setShowNewOrderModal(false);
    fetchDashboardData();
  };

  if (isLoading && !metrics) {
    return (
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-25 bg-gray-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-75 bg-gray-50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
              Overview
            </h1>
            <p className="text-[13px] text-gray-500">{today}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate("/dashboard/tracking")}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-black/5 rounded-lg text-[13px] font-bold text-gray-900 transition-all duration-200 shadow-sm hover:bg-gray-50 hover:border-emerald-600/30 cursor-pointer"
            >
              <SignalIcon className="w-4 h-4 text-emerald-600" />
              Live Tracking
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricsData.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm transition-all duration-300 group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-600/5 hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-black/5 flex items-center justify-center transition-all group-hover:bg-emerald-50 group-hover:border-emerald-100">
                    <Icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                      m.trend === "up"
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : "text-red-500 bg-red-50 border-red-100"
                    }`}
                  >
                    {m.change}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-widest font-bold">
                  {m.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  {m.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Drivers */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-0.5 tracking-tight">
                  Active Drivers
                </h2>
                <p className="text-[12px] text-gray-400">
                  {activeDrivers.filter((d) => d.status === "active").length} on
                  delivery right now
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/drivers")}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-transparent border-none cursor-pointer hover:underline uppercase tracking-wider"
              >
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3">
              {activeDrivers.map((driver, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 group border border-transparent hover:border-black/5"
                  onClick={() => navigate("/dashboard/tracking")}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 relative border border-black/5 transition-all group-hover:bg-emerald-50 group-hover:border-emerald-100">
                    <span className="text-[12px] font-bold text-gray-500 group-hover:text-emerald-600">
                      {driver.name
                        ? driver.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "?"}
                    </span>
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                        driver.status === "active"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-gray-900 mb-0.5 truncate tracking-tight">
                      {driver.name}
                    </p>
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium">
                      <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {driver.current_location_name || "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-black/5 group-hover:border-emerald-600/20 group-hover:bg-emerald-50/50 transition-all shadow-sm">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                      <span className="text-[11px] text-gray-600 font-bold">
                        Online
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-0.5 tracking-tight">
                  Recent Orders
                </h2>
                <p className="text-[12px] text-gray-400">
                  Latest deliveries and status
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-transparent border-none cursor-pointer hover:underline uppercase tracking-wider"
              >
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-3">
              {recentOrders.map((order, i) => {
                const s = statusStyle(order.status);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 group border border-transparent hover:border-black/5"
                    onClick={() => navigate("/dashboard/orders")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-[14px] font-bold text-gray-900 tracking-tight">
                          {order.id}
                        </p>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border"
                          style={{
                            backgroundColor: s.bg,
                            color: s.color,
                            borderColor: `${s.color}20`,
                          }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                        <span className="text-gray-900 truncate">
                          {order.customer_name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <NewOrderModal
        open={showNewOrderModal}
        onOpenChange={setShowNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onCreate={handleSaveOrder}
      />
    </>
  );
}
