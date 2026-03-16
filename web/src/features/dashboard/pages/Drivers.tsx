import React, { useState } from "react";
import { useNavigate } from "react-router";

import {
  MagnifyingGlassIcon,
  StarIcon,
  TruckIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  TrashIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

export function DashboardDrivers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("list");
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: "Alex Rivera",
      email: "alex.rivera@email.com",
      phone: "+1 (555) 123-4567",
      vehicle: "Van • ABC-1234",
      todayStops: 4,
      completedRoutes: 234,
      rating: 4.9,
      status: "active",
      lastSession: "2 min ago",
      companyCode: "FLEET-2024",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      phone: "+1 (555) 234-5678",
      vehicle: "Truck • XYZ-5678",
      todayStops: 6,
      completedRoutes: 189,
      rating: 4.8,
      status: "active",
      lastSession: "5 min ago",
      companyCode: "FLEET-2024",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.j@email.com",
      phone: "+1 (555) 345-6789",
      vehicle: "Van • DEF-9012",
      todayStops: 3,
      completedRoutes: 412,
      rating: 5.0,
      status: "active",
      lastSession: "1 min ago",
      companyCode: "FLEET-2024",
    },
    {
      id: 4,
      name: "Emma Davis",
      email: "emma.d@email.com",
      phone: "+1 (555) 456-7890",
      vehicle: "Car • GHI-3456",
      todayStops: 0,
      completedRoutes: 156,
      rating: 4.7,
      status: "offline",
      lastSession: "2 hours ago",
      companyCode: "FLEET-2024",
    },
  ]);

  const handleRemoveDriver = (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your fleet?`)) {
      setDrivers(drivers.filter((d) => d.id !== id));
    }
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-8 max-w-350 mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
            Drivers
          </h1>
          <p className="text-[13px] text-gray-500">Manage your delivery team</p>
        </div>
        {/* View toggle */}
        <div className="flex bg-gray-50 border border-black/8 rounded-xl p-0.75 gap-0.5">
          {(
            [
              { mode: "board", Icon: Squares2X2Icon, label: "Board" },
              { mode: "list", Icon: ListBulletIcon, label: "List" },
            ] as const
          ).map(({ mode, Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                viewMode === mode
                  ? "bg-white text-gray-900 border border-black/8 shadow-sm"
                  : "bg-transparent text-gray-400 border border-transparent hover:text-gray-600"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatsCard label="Total Drivers" value="4" />
        <StatsCard label="Active Now" value="3" />
        <StatsCard label="Total Routes" value="991" />
        <StatsCard label="Avg Rating" value="4.8" />
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-black/8 mb-6 shadow-sm">
        <div className="relative group">
          <MagnifyingGlassIcon className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600" />
          <input
            type="text"
            placeholder="Search drivers by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-black/8 rounded-xl text-[13px] outline-none transition-all duration-200 focus:border-emerald-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)] placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Drivers — Board view */}
      {viewMode === "board" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.map((driver) => (
            <div
              key={driver.id}
              onClick={() => navigate("/dashboard/driver-detail")}
              className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm transition-all duration-300 group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-600/5 cursor-pointer relative overflow-hidden"
            >
              {/* Active Glow Effect on Hover */}
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Driver Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-13 h-13 rounded-full bg-gray-50 border border-black/5 flex items-center justify-center shrink-0 relative transition-all duration-300 group-hover:bg-emerald-50 group-hover:border-emerald-100">
                  <span className="text-gray-500 font-bold text-[14px] tracking-tight group-hover:text-emerald-600">
                    {driver.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  {driver.status === "active" && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-bold text-gray-900 mb-0.5 truncate tracking-tight">
                    {driver.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                        driver.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-gray-50 text-gray-400 border border-gray-100"
                      }`}
                    >
                      {driver.status}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium truncate">
                      {driver.companyCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact & Vehicle Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-black/5 group-hover:bg-white transition-colors">
                    <EnvelopeIcon className="w-4 h-4 shrink-0 opacity-70" />
                  </div>
                  <span className="text-[13px] font-medium truncate">
                    {driver.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-black/5 group-hover:bg-white transition-colors">
                    <PhoneIcon className="w-4 h-4 shrink-0 opacity-70" />
                  </div>
                  <span className="text-[13px] font-medium">
                    {driver.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-600 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-black/5 group-hover:bg-white transition-colors">
                    <TruckIcon className="w-4 h-4 shrink-0 opacity-60" />
                  </div>
                  <span className="text-[13px] font-semibold tracking-tight">
                    {driver.vehicle}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50/50 rounded-xl p-3 mb-6 border border-black/5 transition-colors group-hover:bg-emerald-50/30 group-hover:border-emerald-100/50">
                <div className="text-center border-r border-black/5 last:border-0">
                  <p className="text-lg font-bold text-gray-900 mb-0">
                    {driver.todayStops}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Stops
                  </p>
                </div>
                <div className="text-center border-r border-black/5 last:border-0">
                  <p className="text-lg font-bold text-gray-900 mb-0">
                    {driver.completedRoutes}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Routes
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <p className="text-lg font-bold text-gray-900">
                      {driver.rating}
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    Rating
                  </p>
                </div>
              </div>

              {/* Last Session & Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    {driver.lastSession}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveDriver(driver.id, driver.name);
                  }}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-black/5 rounded-lg text-gray-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-50 hover:text-red-500 cursor-pointer shadow-sm"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Drivers — List view */}
      {viewMode === "list" && (
        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "DRIVER",
                    "VEHICLE",
                    "TODAY",
                    "ROUTES",
                    "RATING",
                    "LAST SEEN",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-bold text-gray-400 tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDrivers.map((driver) => (
                  <tr
                    key={driver.id}
                    onClick={() => navigate("/dashboard/driver-detail")}
                    className="transition-colors cursor-pointer hover:bg-gray-50 group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-600/10 flex items-center justify-center shrink-0 relative transition-colors group-hover:bg-emerald-100">
                          <span className="text-[12px] font-bold text-emerald-600">
                            {driver.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          {driver.status === "active" && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-gray-900 mb-0.5 truncate">
                            {driver.name}
                          </p>
                          <p className="text-[12px] text-gray-400 truncate tracking-tight">
                            {driver.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] text-gray-500 font-medium">
                        {driver.vehicle}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center sm:text-left">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-gray-900">
                          {driver.todayStops}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          stops
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-bold text-gray-900">
                        {driver.completedRoutes}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-[13px] font-bold text-gray-900">
                          {driver.rating}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <ClockIcon className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-[12px] text-gray-400 font-medium">
                          {driver.lastSession}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDriver(driver.id, driver.name);
                        }}
                        className="p-1.5 bg-transparent border border-black/8 rounded-lg text-gray-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/8 transition-all duration-200 hover:border-emerald-600 hover:shadow-sm">
      <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}
