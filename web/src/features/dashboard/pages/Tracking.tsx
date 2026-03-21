import React, { useState, useEffect } from "react";
import { useDriverStore } from "../../../store/driverStore";
import { useRouteStore } from "../../../store/routeStore";
import MapView from "../../../components/ui/MapView";

import {
  MapPinIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  XMarkIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { Driver } from "../../../store/driverStore";
import { Skeleton } from "../../../components/ui/skeleton";

export function DashboardTracking() {
  const { drivers, isLoading, fetchDrivers } = useDriverStore();
  const { routes, fetchRoutes } = useRouteStore();

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    fetchDrivers({ limit: 100 });
    fetchRoutes({ limit: 100 });

    // Poll for driver updates every 10 seconds
    const interval = setInterval(() => {
      fetchDrivers({ limit: 100 });
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDrivers, fetchRoutes]);

  const activeDrivers = drivers.filter((d) => d.status === "active");

  const totalDeliveriesToday = drivers.reduce(
    (sum, d) => sum + (d.total_deliveries || 0),
    0,
  );
  const remainingStops = routes.filter(
    (r) => r.status === "in_progress" || r.status === "pending",
  ).length;

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500 shadow-emerald-500/20";
      case "idle":
        return "bg-amber-500 shadow-amber-500/20";
      case "offline":
        return "bg-gray-400 shadow-gray-400/20";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabelColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-emerald-600";
      case "idle":
        return "text-amber-600";
      case "offline":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setSelectedDriver(null); // Clear selected driver to focus on user
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleResetView = () => {
    setSelectedDriver(null);
    setUserLocation(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-350 mx-auto">
      {/* Header & Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
            Live Tracking
          </h1>
          <p className="text-[13px] text-gray-500">
            Monitor your drivers in real-time
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-50 border border-black/8 rounded-xl p-0.75 gap-0.5 self-start md:self-auto">
          {(
            [
              { mode: "board", label: "Board" },
              { mode: "list", label: "List" },
            ] as const
          ).map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                viewMode === mode
                  ? "bg-white text-gray-900 border border-black/8 shadow-sm"
                  : "bg-transparent text-gray-400 border border-transparent hover:text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Active Drivers"
          value={activeDrivers.length}
          total={drivers.length}
          color="emerald"
          isLoading={isLoading && drivers.length === 0}
        />
        <StatCard
          label="Total Deliveries Today"
          value={totalDeliveriesToday}
          color="emerald"
          isLoading={isLoading && drivers.length === 0}
        />
        <StatCard
          label="Remaining Stops"
          value={remainingStops}
          color="amber"
          isLoading={isLoading && drivers.length === 0}
        />
        <StatCard
          label="Avg Completion Rate"
          value={
            drivers.length > 0
              ? `${Math.round((activeDrivers.length / drivers.length) * 100)}%`
              : "—"
          }
          color="emerald"
          isLoading={isLoading && drivers.length === 0}
        />
      </div>

      {isLoading && drivers.length === 0 ? (
        <>
          <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm h-150 lg:h-180 mb-12">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-24 h-8" />
            </div>
            <div className="flex-1 p-8">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          </div>

          <div className="space-y-6">
            <Skeleton className="w-48 h-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-black/8 rounded-2xl p-5 shadow-sm"
                >
                  <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                  <Skeleton className="w-32 h-4 mb-2" />
                  <Skeleton className="w-16 h-3" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Map + Detail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* Map Area */}
            <div
              className={`${selectedDriver ? "lg:col-span-8" : "lg:col-span-12"} transition-all duration-500`}
            >
              <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm flex flex-col h-150 lg:h-180">
                {/* Map Toolbar */}
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-emerald-600" />
                    <span className="text-[14px] font-bold text-gray-900 tracking-tight">
                      {selectedDriver
                        ? `${selectedDriver.name}'s Current Position`
                        : "Fleet Overview"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleLocateMe}
                      disabled={isLocating}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isLocating ? (
                        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <MapPinIcon className="w-3.5 h-3.5" />
                      )}
                      Locate Me
                    </button>
                    {(selectedDriver || userLocation) && (
                      <button
                        onClick={handleResetView}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-black/5 rounded-xl text-[11px] font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <XMarkIcon className="w-3.5 h-3.5" />
                        Reset View
                      </button>
                    )}
                  </div>
                </div>

                {/* Map Component Container */}
                <div id="tour-live-map" className="flex-1 relative">
                  <MapView
                    drivers={drivers}
                    selectedDriverId={selectedDriver?.id}
                    userLocation={userLocation}
                  />
                </div>
              </div>
            </div>

            {/* Side Info Panel (Selected Driver) */}
            {selectedDriver && (
              <div className="lg:col-span-4 animate-in slide-in-from-right duration-500 lg:sticky lg:top-8 self-start">
                <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm h-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${getStatusClasses(selectedDriver.status)}`}
                    >
                      <UserIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {selectedDriver.name}
                      </h3>
                      <p
                        className={`text-[11px] font-bold uppercase tracking-wider ${getStatusLabelColor(selectedDriver.status)}`}
                      >
                        {selectedDriver.status === "active"
                          ? "On Route"
                          : selectedDriver.status}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <InfoGroup
                      icon={PhoneIcon}
                      label="Contact Number"
                      value={selectedDriver.phone || "N/A"}
                    />
                    <InfoGroup
                      icon={MapPinIcon}
                      label="Current Location"
                      value={
                        selectedDriver.location_lat
                          ? `${selectedDriver.location_lat}, ${selectedDriver.location_lng}`
                          : "Unknown"
                      }
                      highlight
                    />

                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100">
                      <MiniStat
                        label="Completed"
                        value={selectedDriver.total_deliveries || 0}
                        color="emerald"
                      />
                      <MiniStat
                        label="Remaining"
                        value={
                          routes.filter(
                            (r) =>
                              r.driver_id === selectedDriver.id &&
                              (r.status === "pending" ||
                                r.status === "in_progress"),
                          ).length
                        }
                        color="amber"
                      />
                    </div>

                    {selectedDriver.current_route_id && (
                      <InfoGroup
                        icon={ClockIcon}
                        label="Current Active Route"
                        value={selectedDriver.current_route_id}
                      />
                    )}

                    <div className="pt-4 flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Last telemetry update:{" "}
                      {selectedDriver.last_active_at
                        ? new Date(
                            selectedDriver.last_active_at,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Active"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Drivers Directory Grid */}
          <div id="tour-fleet-directory" className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Active Fleet Directory
            </h2>
            {drivers.length === 0 ? (
              <div className="bg-white border border-black/8 rounded-2xl flex flex-col items-center justify-center py-16 text-center shadow-sm">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <LocalShippingIcon size={28} className="text-gray-300" />
                </div>
                <p className="text-[15px] font-bold text-gray-400 mb-1">
                  No active fleet
                </p>
                <p className="text-[13px] text-gray-300 font-medium">
                  Drivers will appear here once they join your fleet
                </p>
              </div>
            ) : viewMode === "board" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {drivers.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDriver(d)}
                    className={`group bg-white border rounded-2xl p-5 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer ${
                      selectedDriver?.id === d.id
                        ? "border-emerald-600 shadow-lg shadow-emerald-600/5"
                        : "border-black/8 shadow-sm hover:border-emerald-600/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:scale-110 duration-300 ${getStatusClasses(d.status)}`}
                      >
                        <LocalShippingIcon size={20} className="text-white" />
                      </div>
                      <ChevronRightIcon
                        className={`w-4 h-4 text-gray-300 transition-transform group-hover:translate-x-1 ${selectedDriver?.id === d.id ? "text-emerald-500 translate-x-1" : ""}`}
                      />
                    </div>

                    <h4 className="text-[14px] font-bold text-gray-900 mb-0.5 group-hover:text-emerald-600 transition-colors">
                      {d.name}
                    </h4>
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${getStatusLabelColor(d.status)}`}
                    >
                      {d.status}
                    </p>

                    <div className="flex gap-4 pt-4 border-t border-gray-50">
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                          Completed
                        </p>
                        <p className="text-[14px] font-bold text-gray-900">
                          {d.total_deliveries || 0}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                          Remain
                        </p>
                        <p className="text-[14px] font-bold text-amber-500">
                          {
                            routes.filter(
                              (r) =>
                                r.driver_id === d.id &&
                                (r.status === "pending" ||
                                  r.status === "in_progress"),
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        {[
                          "DRIVER",
                          "STATUS",
                          "LOCATION",
                          "DELIVERIES",
                          "LAST SEEN",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {drivers.map((d) => (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDriver(d)}
                          className={`cursor-pointer transition-colors ${selectedDriver?.id === d.id ? "bg-emerald-50/50" : "hover:bg-gray-50/50"}`}
                        >
                          <td className="px-6 py-4">
                            <p className="text-[13px] font-bold text-gray-900">
                              {d.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {d.email}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusLabelColor(d.status)} bg-gray-50 border border-black/5`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[13px] text-gray-500 font-medium truncate max-w-40">
                              {d.current_location_name || "Unknown"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[13px] font-bold text-gray-900">
                              {d.total_deliveries || 0}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[12px] text-gray-400 font-medium">
                              {d.last_active_at
                                ? new Date(d.last_active_at).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : "Active"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ChevronRightIcon
                              className={`w-4 h-4 text-gray-300 ml-auto ${selectedDriver?.id === d.id ? "text-emerald-500" : ""}`}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* --- Sub-components --- */

function StatCard({
  label,
  value,
  total,
  color,
  isLoading,
}: {
  label: string;
  value: number | string;
  total?: number;
  color: "emerald" | "amber";
  isLoading?: boolean;
}) {
  const colorClasses = {
    emerald: "text-emerald-600 border-emerald-100 shadow-emerald-600/5",
    amber: "text-amber-600 border-amber-100 shadow-amber-600/5",
  };

  return (
    <div
      className={`bg-white border rounded-2xl p-6 transition-all hover:shadow-md border-black/8 ${colorClasses[color]}`}
    >
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="w-20 h-8" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </p>
          {total && (
            <p className="text-[14px] font-bold text-gray-300">/ {total}</p>
          )}
        </div>
      )}
    </div>
  );
}

function InfoGroup({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-9 h-9 shrink-0 bg-gray-50 border border-black/5 rounded-xl flex items-center justify-center">
        <Icon
          className={`w-4.5 h-4.5 ${highlight ? "text-emerald-600" : "text-gray-400"}`}
        />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p
          className={`text-[13px] font-bold leading-tight ${highlight ? "text-gray-900" : "text-gray-600"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "amber";
}) {
  const textColor = color === "emerald" ? "text-emerald-600" : "text-amber-600";
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className={`text-[18px] font-bold ${textColor}`}>{value}</p>
    </div>
  );
}
