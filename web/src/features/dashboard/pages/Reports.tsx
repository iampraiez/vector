import React, { useState, useEffect } from "react";
import {
  ArrowDownTrayIcon,
  ClockIcon,
  MapPinIcon,
  ChartBarIcon,
  XMarkIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { TrendingUpIcon } from "lucide-react";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { api } from "../../../lib/api";
import { Skeleton } from "../../../components/ui/skeleton";
import { useReportsStore } from "../../../store/reportsStore";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";

const PERIODS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
];

function ExportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const QUICK_RANGES = [
    { label: "7D", days: 7 },
    { label: "30D", days: 30 },
    { label: "90D", days: 90 },
  ];

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    setDateRange({
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/dashboard/reports/request", {
        start_date: dateRange.start,
        end_date: dateRange.end,
      });
      setSubmitted(true);
      toast.success("Report queued successfully!");
    } catch (err) {
      console.error("Failed to request report:", err);
      toast.error("Failed to request report");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-4xl w-full max-w-md shadow-2xl border border-black/5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        {submitted ? (
          <div className="p-10 text-center animate-in fade-in zoom-in-90 duration-500">
            <div className="w-20 h-20 bg-emerald-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-[28px] animate-ping" />
              <CheckCircleIcon className="w-10 h-10 text-emerald-600 relative z-10" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
              Report Queued!
            </h3>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-10 px-4">
              We're compiling your data. The report will be sent to your
              registered email address in a few minutes.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-4 bg-emerald-600 text-white font-semibold text-[15px] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/10 active:scale-[0.98]"
            >
              Back to Reports
            </button>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 tracking-tight">
                  Export Settings
                </h3>
                <p className="text-[13px] text-gray-500 mt-1 font-normal">
                  Select your preferred date range
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-black/5"
              >
                <XMarkIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="px-8 pb-8 space-y-8">
              {/* Quick Select */}
              <div className="space-y-3">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pl-1">
                  Quick Select
                </label>
                <div className="flex gap-2">
                  {QUICK_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleQuickSelect(range.days)}
                      className="flex-1 py-2.5 rounded-xl border border-black/5 bg-gray-50 text-[13px] font-medium text-gray-600 hover:bg-white hover:border-emerald-500/30 hover:text-emerald-600 transition-all active:scale-95"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Range */}
              <div className="space-y-4">
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-widest pl-1">
                  Custom Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[12px] font-medium text-gray-500 pl-1">
                      Start Date
                    </span>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50/50 border border-black/5 rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[12px] font-medium text-gray-500 pl-1">
                      End Date
                    </span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-gray-50/50 border border-black/5 rounded-xl text-[13px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-4 py-4 bg-emerald-600 text-white font-semibold text-[15px] rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <EnvelopeIcon className="w-5 h-5" />
                {loading ? "Sending..." : "Send to my Email"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* --- Empty State --- */
function EmptyReports() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-3xl flex items-center justify-center mb-6">
        <ChartBarIcon className="w-10 h-10 text-emerald-600" />
      </div>
      <p className="text-[17px] font-semibold text-gray-700 mb-2 tracking-tight">
        No data available yet
      </p>
      <p className="text-[13px] text-gray-500 max-w-xs font-normal leading-relaxed">
        Once your fleet completes deliveries, performance metrics and analytics
        will appear here automatically.
      </p>
    </div>
  );
}

/* --- KPI Card --- */
function KPICard({
  label,
  value,
  icon: Icon,
  isLoading,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  isLoading?: boolean;
  subtext?: string;
}) {
  return (
    <div className="group bg-white border border-black/8 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
        <Icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
      </div>
      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="w-24 h-8 mb-1" />
      ) : (
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {value || "—"}
        </p>
      )}
      {subtext && !isLoading && (
        <p className="text-[12px] text-gray-500 mt-2">{subtext}</p>
      )}
    </div>
  );
}

/* --- Main Reports Component --- */
export function DashboardReports() {
  const [activePeriodDays, setActivePeriodDays] = useState(30);
  const [showExportModal, setShowExportModal] = useState(false);

  const { summary, charts, driverPerformance, isLoading, fetchAllData } =
    useReportsStore();

  // Fetch data on mount and when period changes
  useEffect(() => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - activePeriodDays);
    const startDateStr = startDate.toISOString().split("T")[0];

    void fetchAllData(startDateStr);
  }, [activePeriodDays, fetchAllData]);

  const hasData =
    summary &&
    summary.total_deliveries > 0 &&
    charts &&
    charts.deliveries_by_day.length > 0;

  return (
    <>
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-[13px] text-gray-600">
              Real-time performance insights across your delivery operations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Period Selector */}
            <div className="flex bg-gray-100/80 p-1.5 rounded-xl border border-black/5">
              {PERIODS.map((period) => (
                <button
                  key={period.days}
                  onClick={() => setActivePeriodDays(period.days)}
                  className={`px-4 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    activePeriodDays === period.days
                      ? "bg-white text-emerald-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-black/8 rounded-xl text-[13px] font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-emerald-600" />
              Export Report
            </button>
          </div>
        </div>

        {hasData ? (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KPICard
                label="Total Deliveries"
                value={summary?.total_deliveries || 0}
                icon={LocalShippingIcon}
                isLoading={isLoading}
              />
              <KPICard
                label="Success Rate"
                value={`${(summary?.success_rate || 0).toFixed(1)}%`}
                icon={TrendingUpIcon}
                isLoading={isLoading}
              />
              <KPICard
                label="Avg. Delivery Time"
                value={`${(summary?.avg_delivery_time_min || 0).toFixed(0)}min`}
                icon={ClockIcon}
                isLoading={isLoading}
              />
              <KPICard
                label="Total Distance"
                value={`${(summary?.total_distance_km || 0).toFixed(0)}km`}
                icon={MapPinIcon}
                isLoading={isLoading}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Deliveries by Day */}
              {charts?.deliveries_by_day &&
                charts.deliveries_by_day.length > 0 && (
                  <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                        Deliveries by Day
                      </h3>
                      <p className="text-[12px] text-gray-500">
                        Daily delivery completion trend
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={charts.deliveries_by_day}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

              {/* Success Rate Trend */}
              {charts?.success_rate_trend &&
                charts.success_rate_trend.length > 0 && (
                  <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
                    <div className="mb-6">
                      <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                        Success Rate Trend
                      </h3>
                      <p className="text-[12px] text-gray-500">
                        On-time delivery performance
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={charts.success_rate_trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
            </div>

            {/* Driver Performance Table */}
            {driverPerformance?.data && driverPerformance.data.length > 0 && (
              <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm overflow-hidden">
                <div className="mb-6">
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">
                    Driver Performance
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Individual driver metrics and ratings
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Driver Name
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                          Deliveries
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                          On-Time Rate
                        </th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-700">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {driverPerformance.data.map((driver) => (
                        <tr
                          key={driver.driver_id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {driver.name}
                          </td>
                          <td className="py-4 px-4 text-center text-gray-600">
                            {driver.deliveries_completed}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${
                                driver.on_time_rate && driver.on_time_rate >= 80
                                  ? "bg-emerald-50 text-emerald-700"
                                  : driver.on_time_rate &&
                                      driver.on_time_rate >= 60
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {driver.on_time_rate
                                ? `${driver.on_time_rate.toFixed(1)}%`
                                : "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {driver.rating ? (
                              <span className="text-yellow-500 font-semibold">
                                ★ {driver.rating.toFixed(1)}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="space-y-8 animate-pulse mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm"
                >
                  <Skeleton className="w-10 h-10 rounded-xl mb-6" />
                  <Skeleton className="w-24 h-3 mb-3" />
                  <Skeleton className="w-16 h-8" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-black/8 rounded-2xl p-6 h-95 shadow-sm"
                >
                  <Skeleton className="w-48 h-5 mb-2" />
                  <Skeleton className="w-32 h-3 mb-8" />
                  <Skeleton className="w-full h-62.5 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-black/8 rounded-3xl shadow-sm">
            <EmptyReports />
          </div>
        )}
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}
