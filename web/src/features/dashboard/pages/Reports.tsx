import React, { useState } from "react";
import {
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  BanknotesIcon,
  ChartBarIcon,
  XMarkIcon,
  EnvelopeIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const PERIODS = ["7 days", "30 days", "90 days"];

/* --- Export Modal --- */
function ExportModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [selectedRange, setSelectedRange] = useState("30 days");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  const handleClose = () => {
    setSubmitted(false);
    setSelectedRange("30 days");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {submitted ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <EnvelopeIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
              Report Queued
            </h3>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
              Your {selectedRange} report is being generated and will be sent to
              your registered email address shortly.
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3.5 bg-emerald-600 text-white font-bold text-[14px] rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">
                  Export Report
                </h3>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Select a date range for your report
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {["7 days", "30 days", "90 days", "This year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedRange === range
                      ? "border-emerald-600 bg-emerald-50/50"
                      : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon
                      className={`w-5 h-5 ${selectedRange === range ? "text-emerald-600" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-[14px] font-bold ${selectedRange === range ? "text-emerald-700" : "text-gray-700"}`}
                    >
                      {range}
                    </span>
                  </div>
                  {selectedRange === range && (
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 text-white font-bold text-[14px] rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4.5 h-4.5" />
                    Send Report to Email
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
      <p className="text-[17px] font-bold text-gray-400 mb-2 tracking-tight">
        No data for the last {period}
      </p>
      <p className="text-[13px] text-gray-300 max-w-xs font-medium leading-relaxed">
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
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
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
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
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
                  className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activePeriod === p
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 rounded-xl text-[13px] font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-4.5 h-4.5" />
              Export Report
            </button>
          </div>
        </div>

        {hasData ? (
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <KPICard label="Total Deliveries" value="—" icon={TruckIcon} />
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
