import React, { useState } from "react";
import { useNavigate } from "react-router";

import {
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  TruckIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

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
  const [timeFilter, setTimeFilter] = useState<
    "today" | "week" | "month" | "all"
  >("today");

  // Mock driver data
  const driver = {
    id: 1,
    name: "Alex Rivera",
    email: "alex.rivera@email.com",
    phone: "+1 (555) 123-4567",
    vehicle: "Van • ABC-1234",
    rating: 4.9,
    status: "active",
    lastSession: "2 min ago",
    companyCode: "FLEET-2024",
    joinedDate: "Jan 15, 2024",
    totalDeliveries: 234,
    onTimeRate: 96,
  };

  const historyData: Record<string, DeliveryHistory[]> = {
    today: [
      {
        id: "DEL-001",
        customerName: "Sarah Chen",
        address: "742 Evergreen Terrace, Springfield",
        completedAt: "10:45 AM",
        packages: 3,
        signature: true,
        timeWindow: "9:00 AM - 11:00 AM",
      },
      {
        id: "DEL-005",
        customerName: "Mike Johnson",
        address: "1428 Elm Street, Springfield",
        completedAt: "9:30 AM",
        packages: 1,
        signature: true,
        timeWindow: "9:00 AM - 10:00 AM",
      },
      {
        id: "DEL-012",
        customerName: "Emma Davis",
        address: "890 Oak Avenue, Springfield",
        completedAt: "8:15 AM",
        packages: 2,
        signature: true,
        timeWindow: "8:00 AM - 9:00 AM",
      },
    ],
    week: [
      {
        id: "DEL-001",
        customerName: "Sarah Chen",
        address: "742 Evergreen Terrace, Springfield",
        completedAt: "Today, 10:45 AM",
        packages: 3,
        signature: true,
        timeWindow: "9:00 AM - 11:00 AM",
      },
      {
        id: "DEL-097",
        customerName: "John Smith",
        address: "456 Park Lane, Springfield",
        completedAt: "Yesterday, 3:30 PM",
        packages: 2,
        signature: true,
        timeWindow: "3:00 PM - 5:00 PM",
      },
      {
        id: "DEL-089",
        customerName: "Lisa Anderson",
        address: "123 Main Street, Springfield",
        completedAt: "Feb 16, 2:15 PM",
        packages: 1,
        signature: false,
        timeWindow: "2:00 PM - 4:00 PM",
      },
    ],
  };

  const currentHistory = historyData[timeFilter] || historyData.today;

  const stats = {
    today: {
      completed: 3,
      onTime: 3,
      rating: 5.0,
    },
    week: {
      completed: 18,
      onTime: 17,
      rating: 4.9,
    },
    month: {
      completed: 72,
      onTime: 69,
      rating: 4.9,
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Active
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
                { icon: TruckIcon, text: driver.vehicle },
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
              {currentHistory.map((delivery) => (
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
              ))}
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
