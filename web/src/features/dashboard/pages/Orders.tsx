import React, { useState, useRef } from "react";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  UserIcon,
  ClockIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

type OrderStatus =
  | "unassigned"
  | "assigned"
  | "in-progress"
  | "completed"
  | "failed";

interface Order {
  id: string;
  customerName: string;
  address: string;
  city: string;
  packages: number;
  priority: "normal" | "high";
  timeWindow: string;
  status: OrderStatus;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
}

export function DashboardOrders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "DEL-001",
      customerName: "Sarah Chen",
      address: "742 Evergreen Terrace",
      city: "Springfield, IL",
      packages: 3,
      priority: "high",
      timeWindow: "9:00 AM - 11:00 AM",
      status: "assigned",
      assignedTo: "Alex Rivera",
      notes: "Ring doorbell twice",
      createdAt: "Today, 8:00 AM",
    },
    {
      id: "DEL-002",
      customerName: "Mike Johnson",
      address: "1428 Elm Street",
      city: "Springfield, IL",
      packages: 1,
      priority: "normal",
      timeWindow: "11:00 AM - 1:00 PM",
      status: "in-progress",
      assignedTo: "Sarah Chen",
      notes: "Leave at front desk",
      createdAt: "Today, 8:15 AM",
    },
    {
      id: "DEL-003",
      customerName: "Emma Davis",
      address: "890 Oak Avenue",
      city: "Springfield, IL",
      packages: 2,
      priority: "normal",
      timeWindow: "2:00 PM - 4:00 PM",
      status: "unassigned",
      createdAt: "Today, 8:30 AM",
    },
    {
      id: "DEL-004",
      customerName: "John Smith",
      address: "456 Park Lane",
      city: "Springfield, IL",
      packages: 2,
      priority: "normal",
      timeWindow: "10:00 AM - 12:00 PM",
      status: "completed",
      assignedTo: "Mike Johnson",
      createdAt: "Today, 7:45 AM",
    },
    {
      id: "DEL-005",
      customerName: "Lisa Anderson",
      address: "123 Main Street",
      city: "Springfield, IL",
      packages: 1,
      priority: "normal",
      timeWindow: "3:00 PM - 5:00 PM",
      status: "unassigned",
      createdAt: "Today, 9:00 AM",
    },
  ]);

  const drivers = ["Alex Rivera", "Sarah Chen", "Mike Johnson", "Emma Davis"];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    unassigned: orders.filter((o) => o.status === "unassigned").length,
    inProgress: orders.filter((o) => o.status === "in-progress").length,
    completed: orders.filter((o) => o.status === "completed").length,
  };

  const getStatusClasses = (status: OrderStatus) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-500";
      case "assigned":
        return "bg-blue-50 text-blue-600";
      case "in-progress":
        return "bg-emerald-50 text-emerald-600";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "failed":
        return "bg-red-50 text-red-600";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "unassigned":
        return "Unassigned";
      case "assigned":
        return "Assigned";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 max-w-350 mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
              Orders & Deliveries
            </h1>
            <p className="text-[13px] text-gray-500">
              Manage and assign deliveries to your drivers
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-black/8 rounded-xl text-[13px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Upload CSV
            </button>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 rounded-xl text-[13px] font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              New Order
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Orders" value={stats.total} />
          <StatCard label="Unassigned" value={stats.unassigned} color="amber" />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="emerald"
          />
          <StatCard label="Completed" value={stats.completed} color="emerald" />
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-black/8 rounded-2xl p-4 md:p-5 mb-8 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative group">
              <MagnifyingGlassIcon className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600" />
              <input
                type="text"
                placeholder="Search orders by customer, ID, or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-black/8 rounded-xl text-[13px] outline-none transition-all focus:border-emerald-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(5,150,105,0.08)] placeholder:text-gray-300"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {(
                [
                  { key: "all", label: "All" },
                  { key: "unassigned", label: "Unassigned" },
                  { key: "assigned", label: "Assigned" },
                  { key: "in-progress", label: "In Progress" },
                  { key: "completed", label: "Completed" },
                  { key: "failed", label: "Failed" },
                ] as const
              ).map(({ key, label }) => (
                <FilterButton
                  key={key}
                  label={label}
                  active={activeFilter === key}
                  onClick={() => setActiveFilter(key)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Orders List / Table */}
        <div className="space-y-3 sm:space-y-0">
          {/* Mobile Card List */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                      {order.id}
                    </p>
                    {order.priority === "high" && (
                      <span className="inline-flex px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase rounded-md tracking-wider">
                        Priority
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusClasses(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-gray-900 mb-1">
                  {order.customerName}
                </h3>
                <p className="text-[12px] text-gray-500 mb-4 line-clamp-1">
                  {order.address}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[11px] text-gray-500 font-medium">
                        {order.timeWindow}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingOrder(order)}
                    className="p-2 border border-black/8 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block bg-white border border-black/8 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    {[
                      "ORDER ID",
                      "CUSTOMER",
                      "ADDRESS",
                      "TIME WINDOW",
                      "ASSIGNED TO",
                      "STATUS",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-4 text-[11px] font-bold text-gray-400 tracking-wider text-left`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50/50 group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-gray-900">
                          {order.id}
                        </p>
                        {order.priority === "high" && (
                          <span className="inline-flex px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase rounded-md mt-1 tracking-wider">
                            Priority
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-gray-800">
                          {order.customerName}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {order.packages}{" "}
                          {order.packages === 1 ? "pkg" : "pkgs"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] text-gray-500 max-w-45 truncate">
                          {order.address}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {order.city}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-gray-500 font-medium">
                          {order.timeWindow}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                              <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                            <span className="text-[13px] text-gray-700 font-medium">
                              {order.assignedTo}
                            </span>
                          </div>
                        ) : (
                          <select
                            onChange={(e) => {
                              if (e.target.value)
                                setOrders(
                                  orders.map((o) =>
                                    o.id === order.id
                                      ? {
                                          ...o,
                                          assignedTo: e.target.value,
                                          status: "assigned",
                                        }
                                      : o,
                                  ),
                                );
                            }}
                            className="bg-gray-50/50 border border-black/8 rounded-lg px-2.5 py-1 text-[12px] text-gray-500 outline-none hover:border-emerald-600/30 transition-colors"
                          >
                            <option value="">Assign driver...</option>
                            {drivers.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusClasses(order.status)}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="p-1.5 border border-black/8 rounded-lg text-gray-400 hover:text-emerald-600 hover:border-emerald-600/30 hover:bg-emerald-50 transition-all cursor-pointer"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          drivers={drivers}
          onClose={() => setEditingOrder(null)}
          onSave={(updated) => {
            setOrders(orders.map((o) => (o.id === updated.id ? updated : o)));
            setEditingOrder(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadCSVModal
          onClose={() => setShowUploadModal(false)}
          onImport={(newOrders) => {
            setOrders((prev) => [...prev, ...newOrders]);
            setShowUploadModal(false);
          }}
        />
      )}

      {showNewOrderModal && (
        <NewOrderModal
          drivers={drivers}
          onClose={() => setShowNewOrderModal(false)}
          onCreate={(order) => {
            setOrders((prev) => [...prev, order]);
            setShowNewOrderModal(false);
          }}
        />
      )}
    </>
  );
}

/* --- Components --- */

function StatCard({
  label,
  value,
  color = "gray",
}: {
  label: string;
  value: number;
  color?: "emerald" | "amber" | "gray";
}) {
  const colorMap = {
    gray: "text-gray-900 border-black/8 shadow-sm",
    emerald: "text-emerald-600 border-emerald-100 shadow-emerald-600/5",
    amber: "text-amber-600 border-amber-100 shadow-amber-600/5",
  };

  return (
    <div
      className={`bg-white border rounded-2xl p-5 md:p-6 transition-all hover:shadow-md ${colorMap[color]}`}
    >
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

function FilterButton({
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
      className={`px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
        active
          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
          : "bg-gray-100/50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function EditOrderModal({
  order,
  drivers,
  onClose,
  onSave,
}: {
  order: Order;
  drivers: string[];
  onClose: () => void;
  onSave: (order: Order) => void;
}) {
  const [form, setForm] = useState(order);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Edit Order #{order.id}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <ModalInput
              label="Customer Name"
              value={form.customerName}
              onChange={(v) => setForm({ ...form, customerName: v })}
            />
            <ModalInput
              label="Address"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
            />
            <div className="grid grid-cols-2 gap-4">
              <ModalInput
                label="Packages"
                value={form.packages.toString()}
                type="number"
                onChange={(v) =>
                  setForm({ ...form, packages: parseInt(v) || 0 })
                }
              />
              <ModalInput
                label="Time Window"
                value={form.timeWindow}
                onChange={(v) => setForm({ ...form, timeWindow: v })}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Assign Driver
              </label>
              <select
                value={form.assignedTo || ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignedTo: e.target.value || undefined,
                    status: e.target.value ? "assigned" : "unassigned",
                  })
                }
                className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-emerald-600 transition-colors cursor-pointer"
              >
                <option value="">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-50 text-gray-600 text-[13px] font-bold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(form)}
              className="flex-1 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadCSVModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (orders: Order[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text
        .trim()
        .split("\n")
        .map((l) => l.split(",").map((c) => c.trim().replace(/^"|"$/g, "")));
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(f);
  };

  const handleImport = () => {
    setLoading(true);
    setTimeout(() => {
      const newOrders: Order[] = preview.slice(1).map((row, i) => ({
        id: `CSV-${Date.now() % 1000}-${i}`,
        customerName: row[0] || "Unknown",
        address: row[1] || "Unknown Address",
        city: row[2] || "",
        packages: parseInt(row[3]) || 1,
        priority: "normal",
        timeWindow: row[4] || "Any time",
        status: "unassigned",
        createdAt: "Just now",
      }));
      onImport(newOrders);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Upload CSV
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {!file ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files[0])
                  handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? "border-emerald-600 bg-emerald-50 scale-[0.99]"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100/50"
              }`}
            >
              <ArrowUpTrayIcon
                className={`w-8 h-8 mx-auto mb-4 transition-colors ${dragOver ? "text-emerald-600" : "text-gray-300"}`}
              />
              <p className="text-[14px] font-bold text-gray-700 mb-1">
                Select your CSV file
              </p>
              <p className="text-[12px] text-gray-400">
                Drag & drop or{" "}
                <span className="text-emerald-600">click to browse</span>
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                    {preview.length - 1} orders detected
                  </p>
                </div>
              </div>
              <div className="border border-black/8 rounded-xl overflow-hidden overflow-x-auto">
                <table className="w-full text-[11px] text-left">
                  <tr className="bg-gray-50 border-b border-black/5">
                    {preview[0]?.map((c, i) => (
                      <th key={i} className="px-3 py-2 font-bold text-gray-400">
                        {c}
                      </th>
                    ))}
                  </tr>
                  {preview.slice(1, 4).map((r, i) => (
                    <tr
                      key={i}
                      className="border-b border-black/5 last:border-0"
                    >
                      {r.map((c, j) => (
                        <td key={j} className="px-3 py-2 text-gray-600">
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </table>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-[11px] font-bold text-red-500 uppercase tracking-wider hover:opacity-75 transition-opacity"
              >
                Remove File
              </button>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 text-[13px] font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className={`flex-1 py-3 rounded-xl text-[13px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                loading
                  ? "bg-emerald-50 text-emerald-600 shadow-none"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
              } disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Import Orders</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewOrderModal({
  drivers,
  onClose,
  onCreate,
}: {
  drivers: string[];
  onClose: () => void;
  onCreate: (o: Order) => void;
}) {
  const [form, setForm] = useState({
    customerName: "",
    address: "",
    city: "",
    packages: "1",
    timeWindow: "",
    priority: "normal" as "normal" | "high",
    assignedTo: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => {
      onCreate({
        id: `DEL-${Math.floor(Math.random() * 900) + 100}`,
        customerName: form.customerName,
        address: form.address,
        city: form.city,
        packages: parseInt(form.packages) || 1,
        priority: form.priority,
        timeWindow: form.timeWindow || "Any time",
        status: form.assignedTo ? "assigned" : "unassigned",
        assignedTo: form.assignedTo || undefined,
        notes: form.notes || undefined,
        createdAt: "Just now",
      });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              New Order
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <XMarkIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-5">
          <ModalInput
            label="Customer Name *"
            value={form.customerName}
            onChange={(v) => setForm({ ...form, customerName: v })}
            placeholder="Acme Corp"
          />
          <ModalInput
            label="Address *"
            value={form.address}
            onChange={(v) => setForm({ ...form, address: v })}
            placeholder="742 Evergreen Terrace"
          />
          <div className="grid grid-cols-2 gap-4">
            <ModalInput
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="Springfield"
            />
            <ModalInput
              label="Time Window"
              value={form.timeWindow}
              onChange={(v) => setForm({ ...form, timeWindow: v })}
              placeholder="9:00 AM - 11:00 AM"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <ModalInput
              label="Packages"
              value={form.packages}
              type="number"
              onChange={(v) => setForm({ ...form, packages: v })}
            />
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as "normal" | "high",
                  })
                }
                className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-2.5 text-[13px] outline-none hover:border-emerald-600/30 transition-colors"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Assign Driver (Optional)
            </label>
            <select
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-2.5 text-[13px] outline-none hover:border-emerald-600/30 transition-colors"
            >
              <option value="">Unassigned</option>
              {drivers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
              Delivery Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-[13px] outline-none min-h-25 hover:border-emerald-600/30 transition-colors resize-none"
              placeholder="Gate code, special instructions..."
            />
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-gray-500 text-[13px] font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.customerName || !form.address || loading}
            className="flex-2 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all"
          >
            {loading ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-emerald-600 transition-colors placeholder:text-gray-300"
      />
    </div>
  );
}
