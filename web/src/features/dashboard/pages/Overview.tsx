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
} from "@heroicons/react/24/outline";
import { NewOrderModal } from "../components/NewOrderModal";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

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

function CompactEmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 py-6 px-4 bg-gray-50/30 rounded-xl border border-dashed border-gray-100 animate-in fade-in duration-500">
      <div className="w-10 h-10 rounded-xl bg-white border border-black/5 flex items-center justify-center shrink-0 shadow-sm">
        <Icon className="w-5 h-5 text-gray-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-gray-500 tracking-tight">
          {title}
        </p>
        <p className="text-[11.5px] text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
  );
}

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
      value: metrics?.on_time_rate != null ? `${metrics.on_time_rate}%` : "—",
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
          : "—",
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

  const handleSaveOrder = () => {
    setShowNewOrderModal(false);
    fetchDashboardData();
  };

  if (isLoading && !metrics) {
    return (
      <div className="p-4 md:p-8 max-w-350 mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-800 mb-1 tracking-tight">
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
        <div
          id="tour-metrics-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
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
                <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-widest font-semibold">
                  {m.label}
                </p>
                <p className="text-2xl font-bold text-gray-800 tracking-tight">
                  {m.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Active Drivers */}
          <div
            id="tour-active-drivers"
            className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-700 mb-0.5 tracking-tight">
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
              {activeDrivers.length === 0 ? (
                <CompactEmptyState
                  icon={UsersIcon}
                  title="No active drivers"
                  subtitle="Drivers will appear here when they start their route"
                />
              ) : (
                activeDrivers.map((driver, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 group border border-transparent hover:border-black/5"
                    onClick={() => navigate("/dashboard/tracking")}
                  >
                    {/* Avatar/ID Container */}
                    <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 relative border border-black/5 transition-all group-hover:bg-emerald-50 group-hover:border-emerald-100 group-hover:shadow-sm">
                      <div className="flex flex-col items-center justify-center">
                        <UsersIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 mb-0.5" />
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter group-hover:text-emerald-500">
                          {driver.id.slice(-4)}
                        </span>
                      </div>
                      {/* Presence Indicator */}
                      <div
                        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                          driver.status === "active"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-bold text-gray-800 truncate tracking-tight leading-none">
                          {driver.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                        <MapPinIcon className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                        <span className="truncate">
                          {driver.current_location_name ||
                            "Waiting for signal..."}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all shadow-sm ${
                          driver.status === "active"
                            ? "bg-emerald-50/50 border-emerald-100 text-emerald-700 font-bold"
                            : "bg-amber-50/50 border-amber-100 text-amber-700 font-bold"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            driver.status === "active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span className="text-[10px] uppercase tracking-wider">
                          {driver.status === "active" ? "On Delivery" : "Idle"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div
            id="tour-recent-orders"
            className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden"
          >
            <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div>
                <h2 className="text-[15px] font-semibold text-gray-700 mb-0.5 tracking-tight">
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
              {recentOrders.length === 0 ? (
                <CompactEmptyState
                  icon={ArchiveBoxIcon}
                  title="No orders yet"
                  subtitle="Latest deliveries will appear here when created"
                />
              ) : (
                recentOrders.map((order, i) => {
                  const s = statusStyle(order.status);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl transition-all duration-200 cursor-pointer hover:bg-gray-50 group border border-transparent hover:border-black/5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-black/5 flex items-center justify-center shrink-0 transition-all group-hover:bg-amber-50 group-hover:border-amber-100">
                        <ArchiveBoxIcon className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[14px] font-semibold text-gray-800 truncate tracking-tight">
                            {order.customer_name}
                          </p>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider border shrink-0"
                            style={{
                              backgroundColor: s.bg,
                              color: s.color,
                              borderColor: `${s.color}20`,
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                            {order.external_id || `#${recentOrders.length - i}`}
                          </p>
                          <div className="flex items-center gap-1 text-[12px] text-gray-400 font-medium min-w-0">
                            <MapPinIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">
                              {order.address || "No address provided"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
      <NewOrderModal
        open={showNewOrderModal}
        onOpenChange={setShowNewOrderModal}
        onCreate={handleSaveOrder}
      />
    </>
  );
}
