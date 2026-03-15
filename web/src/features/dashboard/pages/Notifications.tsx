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

const INITIAL: Notification[] = [
  {
    id: 1,
    type: "alert",
    category: "drivers",
    title: "Driver went offline",
    body: "Emma Davis went offline unexpectedly during an active route.",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "order",
    category: "orders",
    title: "New order assigned",
    body: "DEL-007 assigned to Sarah Chen — 890 Oak Avenue, Springfield.",
    time: "8 min ago",
    read: false,
  },
  {
    id: 3,
    type: "success",
    category: "orders",
    title: "Delivery completed",
    body: "DEL-005 delivered successfully by Mike Johnson. Customer rated 5 ★.",
    time: "14 min ago",
    read: false,
  },
  {
    id: 4,
    type: "alert",
    category: "orders",
    title: "Delivery missed time window",
    body: "DEL-003 (Lisa Anderson) was not delivered within the 3:00–5:00 PM window.",
    time: "32 min ago",
    read: false,
  },
  {
    id: 5,
    type: "driver",
    category: "drivers",
    title: "Driver back online",
    body: "Alex Rivera resumed activity after a 15-min break.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 6,
    type: "success",
    category: "orders",
    title: "Route optimised",
    body: "4 stops re-sequenced for Alex Rivera, saving an estimated 18 min.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: 7,
    type: "system",
    category: "system",
    title: "CSV import completed",
    body: "12 orders imported successfully from today's upload.",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 8,
    type: "system",
    category: "system",
    title: "Weekly report ready",
    body: "Your fleet performance report for the week of Mar 1–7 is available.",
    time: "8 hours ago",
    read: true,
  },
  {
    id: 9,
    type: "alert",
    category: "system",
    title: "Billing renewal upcoming",
    body: "Your VECTOR Pro plan renews on March 15. Payment method is up to date.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 10,
    type: "driver",
    category: "drivers",
    title: "New driver joined",
    body: "Jordan Lee joined your fleet using company code VECT-2024.",
    time: "2 days ago",
    read: true,
  },
];

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
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);
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
    <div className="p-4 md:p-8 max-w-200 mx-auto pb-24">
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-black/5 rounded-xl text-[12px] font-bold text-gray-400 hover:bg-white hover:shadow-lg hover:border-red-600/30 hover:text-red-600 transition-all cursor-pointer"
            >
              <TrashIcon className="w-4 h-4" />
              Clear {activeCategory === "all" ? "All" : activeCategory}
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-2xl w-fit mb-8 overflow-x-auto scrollbar-hide max-w-full">
        {CATEGORIES.map(({ key, label }) => {
          const isActive = activeCategory === key;
          const count =
            key === "all"
              ? notifications.filter((n) => !n.read).length
              : notifications.filter((n) => n.category === key && !n.read)
                  .length;

          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {label}
              {count > 0 && (
                <span
                  className={`w-5 h-5 flex items-center justify-center text-[10px] rounded-full font-extrabold ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* List Content */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-4xl py-16 px-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <BellIcon className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-400">All caught up!</h3>
            <p className="text-[13px] text-gray-300 max-w-xs mx-auto mt-2">
              You don't have any notifications in this category. We'll let you
              know when something happens.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-black/8 rounded-4xl overflow-hidden shadow-sm shadow-black/5 divide-y divide-gray-50">
            {filtered.map((notif) => {
              const Icon = iconMap[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  className={`group relative flex gap-5 p-6 md:p-8 transition-all duration-300 cursor-pointer ${
                    !notif.read
                      ? "bg-gray-50/50 hover:bg-white"
                      : "hover:bg-gray-50/30"
                  }`}
                >
                  {/* Unread Indicator Bar */}
                  {!notif.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 animate-in fade-in duration-700" />
                  )}

                  {/* Notification Icon */}
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ${categoryColors[notif.type]}`}
                  >
                    <Icon className="w-6 h-6 md:w-7 md:h-7" />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h4
                        className={`text-[15px] font-bold truncate tracking-tight transition-colors ${
                          !notif.read
                            ? "text-gray-900 group-hover:text-emerald-600"
                            : "text-gray-600"
                        }`}
                      >
                        {notif.title}
                      </h4>
                      <span className="text-[11px] font-bold text-gray-400 whitespace-nowrap uppercase tracking-widest">
                        {notif.time}
                      </span>
                    </div>
                    <p
                      className={`text-[13px] leading-relaxed mb-4 ${
                        !notif.read ? "text-gray-600" : "text-gray-400"
                      }`}
                    >
                      {notif.body}
                    </p>

                    <div className="flex items-center gap-4">
                      {!notif.read && (
                        <button className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(notif.id);
                        }}
                        className="text-[11px] font-bold text-gray-300 uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Context Action Button (appears on hover) */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(notif.id);
                      }}
                      className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      {filtered.length > 0 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <InformationCircleIcon className="w-4 h-4 text-gray-300" />
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">
            Showing {filtered.length} updates · System archiving in 30 days
          </p>
        </div>
      )}
    </div>
  );
}
