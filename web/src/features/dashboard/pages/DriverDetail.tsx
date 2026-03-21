import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useDriverStore } from "../../../store/driverStore";

import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { Skeleton } from "../../../components/ui/skeleton";

interface DeliveryHistory {
  id: string;
  customerName: string;
  address: string;
  completedAt: string;
  packages: number;
  signature: boolean;
  timeWindow: string;
}

export function DashboardDriverDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedDriver, recentRoutes, fetchDriverDetail, isLoading } =
    useDriverStore();
  const [timeFilter, setTimeFilter] = useState<
    "today" | "week" | "month" | "all"
  >("today");

  useEffect(() => {
    if (id) {
      fetchDriverDetail(id);
    }
  }, [id, fetchDriverDetail]);

  if (isLoading && !selectedDriver) {
    return (
      <div className="p-4 md:p-8 max-w-300 mx-auto">
        {/* Back Button Skeleton */}
        <Skeleton className="w-32 h-4 mb-8" />

        {/* Driver Profile Skeleton */}
        <div className="bg-white border border-black/8 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
            <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <Skeleton className="w-48 h-10 mb-2" />
                  <Skeleton className="w-24 h-6 rounded-lg" />
                </div>
                <Skeleton className="w-20 h-8 rounded-xl" />
              </div>
              <div className="flex flex-wrap gap-2.5 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-40 h-8 rounded-xl" />
                ))}
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-24 h-3 mb-1.5" />
                    <Skeleton className="w-32 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <Skeleton className="w-16 h-8" />
              </div>
              <Skeleton className="w-24 h-4" />
            </div>
          ))}
        </div>

        {/* Delivery History Table Skeleton */}
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 md:p-6 border-b border-gray-100 flex items-center justify-between">
            <Skeleton className="w-40 h-6" />
            <Skeleton className="w-48 h-10 rounded-xl" />
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDriver) {
    return (
      <div className="p-8 text-center bg-white border border-black/8 rounded-2xl mx-auto max-w-lg mt-20">
        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Driver not found
        </h2>
        <p className="text-gray-500 mb-6">
          The driver you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/dashboard/drivers")}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Back to Drivers
        </button>
      </div>
    );
  }

  const driver = {
    id: selectedDriver.id,
    name: selectedDriver.name,
    email: selectedDriver.email,
    phone: selectedDriver.phone || "N/A",
    vehicle: `${selectedDriver.vehicle_type || "No vehicle"} • ${selectedDriver.vehicle_plate || "No plate"}`,
    rating: selectedDriver.avg_rating || "N/A",
    status: selectedDriver.status,
    lastSession: selectedDriver.last_active_at ? "Active" : "New",
    companyCode: "VECT-D", // Stubbed
    joinedDate: selectedDriver.joined_at
      ? new Date(selectedDriver.joined_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently",
    totalDeliveries: selectedDriver.total_deliveries || 0,
    onTimeRate: 100, // Stubbed
  };

  const historyData: DeliveryHistory[] = recentRoutes.map((route) => ({
    id: route.id,
    customerName: route.name || "Route",
    address: route.start_location_name || "Multiple stops",
    completedAt: route.completed_at
      ? new Date(route.completed_at).toLocaleTimeString()
      : "Pending",
    packages: route.total_stops || 0,
    signature: false,
    timeWindow: route.date || "N/A",
  }));

  const currentHistory = historyData; // Simplify for now as we don't have filtered history from API yet

  const stats = {
    today: {
      completed: 0,
      onTime: 0,
      rating: "N/A",
    },
    week: {
      completed: 0,
      onTime: 0,
      rating: "N/A",
    },
    month: {
      completed: 0,
      onTime: 0,
      rating: "N/A",
    },
  };

  const currentStats = stats[timeFilter as keyof typeof stats] || stats.today;

  return (
    <div className="p-4 md:p-8 max-w-300 mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard/drivers")}
        className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 mb-8 transition-colors hover:text-emerald-600 cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Drivers
      </button>

      {/* Driver Profile */}
      <div className="bg-white border border-black/8 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
            <UserIcon className="w-10 h-10 text-white" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                  {driver.name}
                </h1>
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                    driver.status === "active"
                      ? "bg-emerald-50 text-emerald-600"
                      : driver.status === "idle"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-gray-50 text-gray-400"
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      driver.status === "active"
                        ? "bg-emerald-500 animate-pulse"
                        : driver.status === "idle"
                          ? "bg-amber-500"
                          : "bg-gray-300"
                    }`}
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {driver.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-gray-50 border border-black/5 px-3 py-1.5 rounded-xl">
                <StarIcon className="w-4.5 h-4.5 text-amber-400 fill-amber-400" />
                <span className="text-lg font-bold text-gray-900">
                  {driver.rating}
                </span>
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">
                  avg
                </span>
              </div>
            </div>

            {/* Contact Info Chips */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              {[
                { icon: EnvelopeIcon, text: driver.email },
                { icon: PhoneIcon, text: driver.phone },
                { icon: LocalShippingIcon, text: driver.vehicle },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50/50 border border-black/8 rounded-xl transition-colors hover:border-emerald-600/30"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="text-[12px] text-gray-600 font-medium truncate max-w-50">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
              <InfoItem
                label="Total Deliveries"
                value={driver.totalDeliveries.toString()}
              />
              <InfoItem label="On-Time Rate" value={`${driver.onTimeRate}%`} />
              <InfoItem label="Joined" value={driver.joinedDate} />
              <InfoItem label="Last Session" value={driver.lastSession} />
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard
          label="Completed"
          value={currentStats.completed}
          icon={CheckCircleIcon}
          color="emerald"
        />
        <StatCard
          label="On-Time"
          value={currentStats.onTime}
          icon={ClockIcon}
          color="emerald"
        />
        <StatCard
          label="Rating"
          value={currentStats.rating}
          icon={StarIcon}
          color="amber"
        />
      </div>

      {/* Delivery History */}
      <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 md:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Delivery History
          </h2>

          {/* Time Filter Scrollable */}
          <div className="flex gap-2 p-1 bg-gray-50/50 border border-black/5 rounded-xl overflow-x-auto scrollbar-hide">
            {(["today", "week", "month", "all"] as const).map((f) => (
              <TimeFilterButton
                key={f}
                label={
                  f === "today"
                    ? "Today"
                    : f === "week"
                      ? "Week"
                      : f === "month"
                        ? "Month"
                        : "All"
                }
                active={timeFilter === f}
                onClick={() => setTimeFilter(f)}
              />
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-175">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left">
                {[
                  "ORDER ID",
                  "CUSTOMER",
                  "ADDRESS",
                  "TIME WINDOW",
                  "COMPLETED",
                  "SIG",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-[11px] font-bold text-gray-400 tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <ClockIcon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-[14px] font-bold text-gray-400">
                      No delivery history found
                    </p>
                    <p className="text-[12px] text-gray-300">
                      Deliveries will appear here once completed by the driver.
                    </p>
                  </td>
                </tr>
              ) : (
                currentHistory.map((delivery) => (
                  <tr
                    key={delivery.id}
                    className="transition-colors hover:bg-gray-50/50 group"
                  >
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-bold text-gray-900">
                        {delivery.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-37.5">
                      <p className="text-[13px] font-bold text-gray-800">
                        {delivery.customerName}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {delivery.packages} pkgs
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-gray-500 font-medium truncate max-w-50">
                        {delivery.address}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-gray-500 font-medium">
                        {delivery.timeWindow}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-gray-500 font-medium">
                        {delivery.completedAt}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {delivery.signature ? (
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-300 font-bold">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="text-[14px] font-bold text-gray-900 tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  color: "emerald" | "amber";
}) {
  const colorClasses = {
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-600/5",
    amber: "bg-amber-50 text-amber-600 border-amber-100 shadow-amber-600/5",
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm transition-all duration-200 hover:border-emerald-600/30">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm ${colorClasses[color]}`}
        >
          <Icon className="w-5.5 h-5.5" />
        </div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">
          {value}
        </p>
      </div>
      <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

function TimeFilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
        active
          ? "bg-white text-gray-900 border border-black/8 shadow-sm"
          : "text-gray-400 hover:text-gray-600 bg-transparent border border-transparent"
      }`}
    >
      {label}
    </button>
  );
}
