import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  UsersIcon,
  ArchiveBoxIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  MapPinIcon,
  ClockIcon,
  SignalIcon,
  ChevronRightIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function DashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customer: "",
    address: "",
    packages: "1",
    timeWindow: "",
    notes: "",
  });
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const metrics = [
    {
      label: "Active Drivers",
      value: "12",
      change: "+2",
      trend: "up",
      icon: UsersIcon,
    },
    {
      label: "Pending Orders",
      value: "34",
      change: "-5",
      trend: "down",
      icon: ArchiveBoxIcon,
    },
    {
      label: "On-time Rate",
      value: "94%",
      change: "+3%",
      trend: "up",
      icon: ArrowTrendingUpIcon,
    },
    {
      label: "Fuel Saved",
      value: "$248",
      change: "+12%",
      trend: "up",
      icon: BanknotesIcon,
    },
  ];

  const activeDrivers = [
    {
      name: "Alex Rivera",
      location: "Downtown",
      stops: 4,
      eta: "2h 15m",
      status: "active",
    },
    {
      name: "Sarah Chen",
      location: "Midtown",
      stops: 6,
      eta: "3h 30m",
      status: "active",
    },
    {
      name: "Mike Johnson",
      location: "Uptown",
      stops: 3,
      eta: "1h 45m",
      status: "active",
    },
    {
      name: "Emma Davis",
      location: "Suburb",
      stops: 5,
      eta: "2h 50m",
      status: "break",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-1234",
      customer: "Acme Corp",
      address: "123 Main St",
      time: "10 min ago",
      status: "assigned",
    },
    {
      id: "ORD-1235",
      customer: "Tech Solutions",
      address: "456 Market St",
      time: "25 min ago",
      status: "in-progress",
    },
    {
      id: "ORD-1236",
      customer: "Global Industries",
      address: "789 Oak Ave",
      time: "1 hour ago",
      status: "completed",
    },
    {
      id: "ORD-1237",
      customer: "Bright Media",
      address: "321 Park Blvd",
      time: "2 hours ago",
      status: "completed",
    },
  ];

  const statusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "#ECFDF5", color: "#059669" };
      case "in-progress":
        return { bg: "#EFF6FF", color: "#3B82F6" };
      case "assigned":
        return { bg: "#FEF3C7", color: "#D97706" };
      default:
        return { bg: "#F3F4F6", color: "#6B7280" };
    }
  };

  const handleSaveOrder = () => {
    setOrderSaved(true);
    setTimeout(() => {
      setOrderSaved(false);
      setShowNewOrderModal(false);
      setNewOrder({
        customer: "",
        address: "",
        packages: "1",
        timeWindow: "",
        notes: "",
      });
    }, 1200);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-25 bg-gray-50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
        <div className="h-75 bg-gray-50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
              Overview
            </h1>
            <p className="text-[13px] text-gray-500">{today}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate("/dashboard/tracking")}
              className="flex items-center gap-1.5 px-4 py-2.25 bg-white border border-black/8 rounded-xl text-[13px] font-bold text-gray-900 transition-all duration-200 shadow-sm hover:border-emerald-600 cursor-pointer"
            >
              <SignalIcon className="w-4 h-4 text-emerald-600" />
              Live Tracking
            </button>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.25 bg-emerald-600 text-white rounded-xl text-[13px] font-bold transition-all duration-200 shadow-[0_2px_8px_rgba(5,150,105,0.3)] hover:bg-emerald-700 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              New Order
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                className="bg-white rounded-2xl p-5 border border-black/8 transition-all duration-200 group hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
                    <Icon className="w-4.5 h-4.5 text-emerald-600" />
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.75 rounded-md ${
                      m.trend === "up"
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-red-500 bg-red-50"
                    }`}
                  >
                    {m.change}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mb-1 uppercase tracking-wider font-semibold">
                  {m.label}
                </p>
                <p className="text-[28px] font-bold text-gray-900 tracking-tight">
                  {m.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Drivers */}
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <div className="p-4.5 px-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-0.5">
                  Active Drivers
                </h2>
                <p className="text-[12px] text-gray-400">
                  {activeDrivers.filter((d) => d.status === "active").length} on
                  delivery right now
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/drivers")}
                className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-transparent border-none cursor-pointer hover:underline"
              >
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2">
              {activeDrivers.map((driver, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 group"
                  onClick={() => navigate("/dashboard/tracking")}
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 relative border border-emerald-600/10 transition-colors group-hover:bg-emerald-100">
                    <span className="text-[12px] font-bold text-emerald-600">
                      {driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        driver.status === "active"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 mb-0.5">
                      {driver.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
                      <MapPinIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{driver.location}</span>
                      <span className="text-gray-200">·</span>
                      <span className="shrink-0">{driver.stops} stops</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.75 rounded-md border border-gray-100 group-hover:bg-white group-hover:border-emerald-600/20 transition-all">
                      <ClockIcon className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-500 font-bold">
                        {driver.eta}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-black/8 overflow-hidden">
            <div className="p-4.5 px-5 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900 mb-0.5">
                  Recent Orders
                </h2>
                <p className="text-[12px] text-gray-400">
                  Latest deliveries and status
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard/orders")}
                className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 bg-transparent border-none cursor-pointer hover:underline"
              >
                View all <ChevronRightIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-2">
              {recentOrders.map((order, i) => {
                const s = statusStyle(order.status);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors cursor-pointer hover:bg-gray-50 group"
                    onClick={() => navigate("/dashboard/orders")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[13px] font-bold text-gray-900">
                          {order.id}
                        </p>
                        <span
                          className="text-[11px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: s.bg, color: s.color }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-400 truncate">
                        {order.customer} — {order.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] text-gray-400 font-medium">
                        {order.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div
          onClick={() => setShowNewOrderModal(false)}
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-200 p-4 backdrop-blur-[2px]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-130 shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {/* Modal header */}
            <div className="p-5 px-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-0.5">
                  New Order
                </h2>
                <p className="text-[12px] text-gray-400">
                  Create a delivery order and assign it later
                </p>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="bg-transparent border-none cursor-pointer p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 px-6 flex flex-col gap-4">
              {[
                {
                  label: "Customer Name",
                  key: "customer",
                  placeholder: "e.g. Acme Corporation",
                  type: "text",
                },
                {
                  label: "Delivery Address",
                  key: "address",
                  placeholder: "e.g. 123 Main St, Springfield, IL",
                  type: "text",
                },
                {
                  label: "Time Window",
                  key: "timeWindow",
                  placeholder: "e.g. 9:00 AM – 11:00 AM",
                  type: "text",
                },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-[12px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                    {label}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(newOrder as any)[key]}
                    onChange={(e) =>
                      setNewOrder((p) => ({ ...p, [key]: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 border border-black/8 rounded-xl text-[13px] outline-none transition-all duration-200 focus:border-emerald-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)] placeholder:text-gray-300"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Packages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder.packages}
                    onChange={(e) =>
                      setNewOrder((p) => ({ ...p, packages: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 border border-black/8 rounded-xl text-[13px] outline-none transition-all duration-200 focus:border-emerald-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                    Priority
                  </label>
                  <select className="w-full px-3.5 py-2.5 border border-black/8 rounded-xl text-[13px] outline-none cursor-pointer transition-all duration-200 focus:border-emerald-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)] appearance-none bg-white font-medium">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Notes (optional)
                </label>
                <textarea
                  placeholder="e.g. Leave at front desk, ring doorbell…"
                  value={newOrder.notes}
                  onChange={(e) =>
                    setNewOrder((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-black/8 rounded-xl text-[13px] outline-none font-sans resize-none transition-all duration-200 focus:border-emerald-600 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)] placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 px-6 border-t border-gray-100 flex gap-2.5">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="flex-1 p-2.75 bg-white border border-black/8 rounded-xl text-[13px] font-bold text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={!newOrder.customer || !newOrder.address}
                className={`flex-2 p-2.75 rounded-xl text-[13px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                  orderSaved
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-600/20 shadow-none"
                    : "bg-emerald-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.2)] hover:bg-emerald-700 hover:shadow-lg"
                } ${
                  !newOrder.customer || !newOrder.address
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {orderSaved ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    Order Created
                  </>
                ) : (
                  "Create Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
