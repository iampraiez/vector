import React, { useState } from "react";
import {
  ArrowDownTrayIcon,
  ClockIcon,
  MapPinIcon,
  BanknotesIcon,
  ChartBarIcon,
  XMarkIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { api } from "../../../lib/api";

const PERIODS = ["7 days", "30 days", "90 days"];

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
    } catch (err) {
      console.error("Failed to request report:", err);
      // In a real app, we'd show a toast here
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
                className="w-full mt-4 py-4 bg-emerald-600 text-white font-semibold text-[15px] rounded-[20px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <EnvelopeIcon className="w-5 h-5" />
                    Send to my Email
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* --- Empty State --- */
function EmptyReports({ period }: { period: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
        <ChartBarIcon className="w-10 h-10 text-gray-300" />
      </div>
      <p className="text-[17px] font-semibold text-gray-400 mb-2 tracking-tight">
        No data for the last {period}
      </p>
      <p className="text-[13px] text-gray-300 max-w-xs font-normal leading-relaxed">
        Once your fleet completes deliveries, performance metrics and analytics
        will appear here.
      </p>
    </div>
  );
}

/* --- KPI Card --- */
function KPICard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="group bg-white border border-black/8 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-0.5">
      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
        <Icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
      </div>
      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-800 tracking-tight">
        {value}
      </p>
    </div>
  );
}

/* --- Main --- */
export function DashboardReports() {
  const [activePeriod, setActivePeriod] = useState("30 days");
  const [showExportModal, setShowExportModal] = useState(false);

  // In a real app these would come from a store/API.
  // For now the reports page shows an empty state until real data is wired.
  const hasData = false;

  return (
    <>
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl md:text-[28px] font-semibold text-gray-800 mb-1 tracking-tight">
              Reports &amp; Analytics
            </h1>
            <p className="text-[14px] text-gray-500">
              Performance insights across your fleet operations
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Range Selector */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl border border-black/5">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePeriod(p)}
                  className={`px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activePeriod === p
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-black/8 rounded-lg text-[13px] font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-4 h-4 text-emerald-600" />
              Export Report
            </button>
          </div>
        </div>

        {hasData ? (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <KPICard
                label="Total Deliveries"
                value="—"
                icon={LocalShippingIcon}
              />
              <KPICard label="On-Time Rate" value="—" icon={ClockIcon} />
              <KPICard label="Avg. Delivery Time" value="—" icon={MapPinIcon} />
              <KPICard label="Distance Saved" value="—" icon={BanknotesIcon} />
            </div>
          </>
        ) : (
          <div className="bg-white border border-black/8 rounded-3xl shadow-sm">
            <EmptyReports period={activePeriod} />
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
