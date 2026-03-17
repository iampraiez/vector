import { useState } from "react";

import {
  BellIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

type NotifCategory = "all" | "orders" | "drivers" | "system";

interface Notification {
  id: number;
  type: "order" | "driver" | "alert" | "success" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
  category: "orders" | "drivers" | "system";
}

const iconMap = {
  order: ArchiveBoxIcon,
  driver: TruckIcon,
  alert: ExclamationTriangleIcon,
  success: CheckCircleIcon,
  system: InformationCircleIcon,
};

const categoryColors = {
  order: "bg-blue-50 text-blue-600",
  driver: "bg-emerald-50 text-emerald-600",
  alert: "bg-amber-50 text-amber-600",
  success: "bg-emerald-50 text-emerald-600",
  system: "bg-indigo-50 text-indigo-600",
};

const CATEGORIES: { key: NotifCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders" },
  { key: "drivers", label: "Drivers" },
  { key: "system", label: "System" },
];

export function DashboardNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCategory, setActiveCategory] = useState<NotifCategory>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter(
    (n) => activeCategory === "all" || n.category === activeCategory,
  );

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const remove = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearCurrent = () => {
    setNotifications((prev) =>
      prev.filter((n) =>
        activeCategory === "all" ? false : n.category !== activeCategory,
      ),
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 tracking-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[11px] font-black rounded-full shadow-sm animate-pulse">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <p className="text-[14px] text-gray-500">
            Stay informed about your fleet, deliveries, and system status
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-black/5 rounded-xl text-[12px] font-bold text-gray-600 hover:bg-white hover:shadow-lg hover:border-emerald-600/30 hover:text-emerald-600 transition-all cursor-pointer"
            >
              <CheckIcon className="w-4 h-4" />
              Mark all as read
            </button>
          )}
          {filtered.length > 0 && (
            <button
              onClick={clearCurrent}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-black/5 rounded-xl text-[12px] font-bold text-gray-500 hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count =
            cat.key === "all"
              ? notifications.length
              : notifications.filter((n) => n.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold border whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.key
                  ? "bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-600/20"
                  : "bg-white text-gray-500 border-black/5 hover:border-emerald-600/30 hover:text-emerald-600"
              }`}
            >
              {cat.label}
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.key
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
            <BellIcon className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-[15px] font-bold text-gray-400 mb-1">
            {activeCategory === "all" ? "No notifications yet" : "All clear"}
          </p>
          <p className="text-[13px] text-gray-300 font-medium">
            {activeCategory === "all"
              ? "Activity from your fleet will appear here"
              : "No notifications in this category"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = iconMap[n.type];
            const colorClass = categoryColors[n.type];
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`group flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                  n.read
                    ? "bg-white border-black/5 hover:border-black/10"
                    : "bg-white border-emerald-600/15 shadow-sm shadow-emerald-600/5 hover:border-emerald-600/25"
                }`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-[14px] leading-snug ${n.read ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}
                    >
                      {n.title}
                      {!n.read && (
                        <span className="ml-2 inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full align-middle" />
                      )}
                    </p>
                    <span className="shrink-0 text-[11px] text-gray-400 font-medium whitespace-nowrap">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-400 mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(n.id);
                  }}
                  className="self-start shrink-0 p-1.5 rounded-lg text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-400 transition-all cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
