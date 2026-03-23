import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDriverStore } from "../../../store/driverStore";
import { useSettingsStore } from "../../../store/settingsStore";

import {
  MagnifyingGlassIcon,
  StarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  TrashIcon,
  ListBulletIcon,
  UserGroupIcon,
  UsersIcon,
  Squares2X2Icon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { Skeleton } from "../../../components/ui/skeleton";
import { maskEmail, maskPhone } from "../../../utils/masking";

export function DashboardDrivers() {
  const navigate = useNavigate();
  const { drivers, isLoading, fetchDrivers, deleteDriver } = useDriverStore();
  const { company, fetchSettings } = useSettingsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"board" | "list">("list");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDrivers({ limit: 100 });
    fetchSettings();
  }, [fetchDrivers, fetchSettings]);

  const handleRemoveDriver = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your fleet?`)) {
      setDeletingId(id);
      try {
        await deleteDriver(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredDrivers = (drivers || []).filter(
    (driver) =>
      (driver.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (driver.email || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const activeCount = filteredDrivers.filter(
    (d) => (d.status || "").toLowerCase() === "active",
  ).length;
  const totalRoutes = filteredDrivers.reduce(
    (acc, curr) => acc + (curr.total_deliveries || 0),
    0,
  );
  const ratedDrivers = filteredDrivers.filter(
    (d) => d.avg_rating && d.avg_rating > 0,
  );
  const avgRating = ratedDrivers.length
    ? (
        ratedDrivers.reduce((acc, curr) => acc + (curr.avg_rating || 0), 0) /
        ratedDrivers.length
      ).toFixed(1)
    : "N/A";

  return (
    <div className="p-4 md:p-8 max-w-350 mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-7 font-inter">
        <div>
          <h1
            id="tour-drivers-heading"
            className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight"
          >
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all duration-200 cursor-pointer ${
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
        <StatsCard
          label="Total Drivers"
          value={drivers.length.toString()}
          isLoading={isLoading && drivers.length === 0}
        />
        <StatsCard
          label="Active Now"
          value={activeCount.toString()}
          isLoading={isLoading && drivers.length === 0}
        />
        <StatsCard
          label="Total Routes"
          value={totalRoutes.toString()}
          isLoading={isLoading && drivers.length === 0}
        />
        <StatsCard
          label="Avg Rating"
          value={avgRating}
          isLoading={isLoading && drivers.length === 0}
        />
      </div>

      {/* Search Bar */}
      <div
        id="tour-drivers-search"
        className="bg-white rounded-2xl p-4 md:p-5 border border-black/8 mb-6 shadow-sm"
      >
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
          {isLoading && drivers.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="w-13 h-13 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-32 h-5 mb-2" />
                    <Skeleton className="w-16 h-4" />
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  <Skeleton className="w-full h-8 rounded-lg" />
                  <Skeleton className="w-full h-8 rounded-lg" />
                  <Skeleton className="w-full h-8 rounded-lg" />
                </div>
                <Skeleton className="w-full h-16 rounded-xl" />
              </div>
            ))
          ) : filteredDrivers.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                <UserGroupIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[15px] font-bold text-gray-400 mb-1">
                {searchQuery
                  ? "No drivers match your search"
                  : "No drivers yet"}
              </p>
              {!searchQuery ? (
                <>
                  <p className="text-[13px] text-gray-500 font-medium mb-6 max-w-md">
                    Drivers join the mobile app with your company code. Share it
                    with your team so they can sign up and appear here.
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Company code
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                    <code className="text-2xl sm:text-3xl font-mono font-bold tracking-wide text-gray-900 bg-gray-50 px-4 py-3 rounded-2xl border border-black/8">
                      {company?.company_code || "—"}
                    </code>
                    <button
                      type="button"
                      disabled={!company?.company_code}
                      onClick={async () => {
                        if (!company?.company_code) return;
                        try {
                          await navigator.clipboard.writeText(
                            company.company_code,
                          );
                          toast.success("Company code copied");
                        } catch {
                          toast.error("Could not copy");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-[12px] font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-gray-300 font-medium">
                  Try a different search term
                </p>
              )}
            </div>
          ) : (
            filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => {
                  navigate(`/dashboard/driver-detail/${driver.id}`);
                }}
                className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm transition-all duration-300 group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-600/5 cursor-pointer relative overflow-hidden"
              >
                {/* Active Glow Effect on Hover */}
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Driver Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-black/5 flex items-center justify-center shrink-0 relative transition-all duration-300 group-hover:bg-emerald-50 group-hover:border-emerald-100 group-hover:shadow-sm">
                    <div className="flex flex-col items-center justify-center">
                      <UsersIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 mb-0.5" />
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-tighter group-hover:text-emerald-500">
                        {driver.name
                          ? driver.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                          : "???"}
                      </span>
                    </div>
                    {/* Status Dot */}
                    {(driver.status || "").toLowerCase() === "active" && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1 truncate tracking-tight group-hover:text-emerald-700 transition-colors">
                      {driver.name || "Unknown Driver"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                          (driver.status || "").toLowerCase() === "active"
                            ? "bg-emerald-50/50 text-emerald-700 border-emerald-100"
                            : (driver.status || "").toLowerCase() === "idle"
                              ? "bg-amber-50/50 text-amber-700 border-amber-100"
                              : "bg-gray-50/50 text-gray-400 border-gray-100"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            (driver.status || "").toLowerCase() === "active"
                              ? "bg-emerald-500"
                              : (driver.status || "").toLowerCase() === "idle"
                                ? "bg-amber-500"
                                : "bg-gray-400"
                          }`}
                        />
                        {driver.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact & Vehicle Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-700 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gray-50/50 flex items-center justify-center border border-black/5 group-hover:bg-white transition-colors">
                        <EnvelopeIcon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <span className="text-[12.5px] font-semibold tracking-tight truncate">
                        {maskEmail(driver.email || "") || "No email"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-700 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-gray-50/50 flex items-center justify-center border border-black/5 group-hover:bg-white transition-colors">
                        <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <span className="text-[12.5px] font-semibold tracking-tight">
                        {maskPhone(driver.phone || "") || "No phone"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/50 rounded-xl border border-black/5 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-black/5 shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                        <LocalShippingIcon
                          size={16}
                          className="shrink-0 text-gray-400 group-hover:text-emerald-600"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-0.5">
                          Vehicle
                        </p>
                        <p className="text-[12.5px] font-bold text-gray-700 truncate tracking-tight">
                          {driver.vehicle_type
                            ? `${driver.vehicle_type} • ${driver.vehicle_plate || ""}`
                            : "No Vehicle Assigned"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 bg-gray-50/50 rounded-xl p-3 mb-6 border border-black/5 transition-all group-hover:bg-emerald-50/30 group-hover:border-emerald-100/50">
                  <div className="text-center border-r border-black/5 last:border-0 border-dashed">
                    <p className="text-lg font-extrabold text-gray-900 mb-0 tracking-tight">
                      {driver.total_deliveries || 0}
                    </p>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">
                      Routes
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shadow-sm" />
                      <p className="text-lg font-extrabold text-gray-900 tracking-tight">
                        {driver.avg_rating || "N/A"}
                      </p>
                    </div>
                    <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">
                      Rating
                    </p>
                  </div>
                </div>

                {/* Last Session & Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        (driver.status || "").toLowerCase() === "active"
                          ? "bg-emerald-500 animate-pulse"
                          : "bg-gray-300"
                      }`}
                    />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      {(driver.status || "").toLowerCase() === "active"
                        ? "Active Now"
                        : driver.last_active_at
                          ? new Date(driver.last_active_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Idle"}
                    </span>
                  </div>
                  <button
                    disabled={deletingId === driver.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDriver(driver.id, driver.name || "");
                    }}
                    className="w-8 h-8 flex items-center justify-center bg-white border border-black/5 rounded-lg text-gray-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-50 hover:text-red-500 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === driver.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <TrashIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
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
                    "ROUTES",
                    "RATING",
                    "LAST SEEN",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && drivers.length === 0 ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-9 h-9 rounded-full" />
                          <div>
                            <Skeleton className="w-32 h-4 mb-2" />
                            <Skeleton className="w-48 h-3" />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Skeleton className="w-24 h-4" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Skeleton className="w-8 h-4" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Skeleton className="w-12 h-4" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Skeleton className="w-16 h-4" />
                      </td>
                      <td className="px-5 py-3.5">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <UserGroupIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-[14px] font-bold text-gray-400">
                          {searchQuery
                            ? "No drivers match your search"
                            : "No drivers yet"}
                        </p>
                        {!searchQuery ? (
                          <>
                            <p className="text-[12px] text-gray-500">
                              Drivers join the mobile app with your company
                              code. Share it so they can sign up and appear in
                              this list.
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">
                              Company code
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <code className="text-xl sm:text-2xl font-mono font-bold tracking-wide text-gray-900 bg-gray-50 px-3 py-2 rounded-xl border border-black/8">
                                {company?.company_code || "—"}
                              </code>
                              <button
                                type="button"
                                disabled={!company?.company_code}
                                onClick={async () => {
                                  if (!company?.company_code) return;
                                  try {
                                    await navigator.clipboard.writeText(
                                      company.company_code,
                                    );
                                    toast.success("Company code copied");
                                  } catch {
                                    toast.error("Could not copy");
                                  }
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold text-emerald-700 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <ClipboardDocumentIcon className="w-4 h-4" />
                                Copy
                              </button>
                            </div>
                          </>
                        ) : (
                          <p className="text-[12px] text-gray-300">
                            Try a different name or email
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr
                      key={driver.id}
                      onClick={() => {
                        navigate(`/dashboard/driver-detail/${driver.id}`);
                      }}
                      className="transition-colors cursor-pointer hover:bg-gray-50 group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 border border-black/5 flex items-center justify-center shrink-0 relative transition-all group-hover:bg-emerald-50 group-hover:border-emerald-100 group-hover:shadow-sm">
                            <div className="flex flex-col items-center justify-center">
                              <UsersIcon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 mb-0.5" />
                              <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-tighter group-hover:text-emerald-500">
                                {driver.name
                                  ? driver.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                  : "???"}
                              </span>
                            </div>
                            {(driver.status || "").toLowerCase() ===
                              "active" && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-gray-800 mb-0.5 truncate tracking-tight group-hover:text-emerald-700 transition-colors">
                              {driver.name || "Unknown Driver"}
                            </p>
                            <p className="text-[12px] text-gray-400 truncate tracking-tight font-medium">
                              {maskEmail(driver.email || "")} •{" "}
                              {maskPhone(driver.phone || "")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] text-gray-600 font-medium">
                          {driver.vehicle_type
                            ? `${driver.vehicle_type} • ${driver.vehicle_plate || ""}`
                            : "Unassigned"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[14px] font-extrabold text-gray-900 tracking-tight bg-gray-50/50 px-2.5 py-1 rounded-lg border border-black/5 group-hover:bg-emerald-50/30 group-hover:border-emerald-100/50 transition-colors">
                          {driver.total_deliveries || 0}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 bg-gray-50/50 px-2.5 py-1 rounded-lg border border-black/5 group-hover:bg-emerald-50/30 group-hover:border-emerald-100/50 transition-colors">
                          <StarIcon className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-[14px] font-extrabold text-gray-900 tracking-tight">
                            {driver.avg_rating || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                              (driver.status || "").toLowerCase() === "active"
                                ? "bg-emerald-50/50 text-emerald-700 border-emerald-100"
                                : (driver.status || "").toLowerCase() === "idle"
                                  ? "bg-amber-50/50 text-amber-700 border-amber-100"
                                  : "bg-gray-50/50 text-gray-400 border-gray-100"
                            }`}
                          >
                            <div
                              className={`w-1 h-1 rounded-full ${
                                (driver.status || "").toLowerCase() === "active"
                                  ? "bg-emerald-500"
                                  : (driver.status || "").toLowerCase() ===
                                      "idle"
                                    ? "bg-amber-500"
                                    : "bg-gray-400"
                              }`}
                            />
                            {driver.status || "Unknown"}
                          </span>
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <ClockIcon className="w-3 h-3 text-gray-300" />
                            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                              {(driver.status || "").toLowerCase() === "active"
                                ? "Just Now"
                                : driver.last_active_at
                                  ? new Date(
                                      driver.last_active_at,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "Offline"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={deletingId === driver.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDriver(driver.id, driver.name || "");
                          }}
                          className="p-1.5 bg-transparent border border-black/8 rounded-lg text-gray-300 transition-all duration-200 hover:border-red-500/30 hover:bg-red-50 hover:text-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingId === driver.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <TrashIcon className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm transition-all duration-300 group hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-600/5 hover:-translate-y-0.5">
      <p className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest mb-2 transition-colors group-hover:text-emerald-600">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="w-16 h-8" />
      ) : (
        <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none group-hover:text-gray-800">
          {value}
        </p>
      )}
    </div>
  );
}
