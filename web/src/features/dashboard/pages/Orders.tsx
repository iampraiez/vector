import React, { useState, useRef, useEffect } from "react";
import { useOrderStore } from "../../../store/orderStore";
import { useDriverStore } from "../../../store/driverStore";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { NewOrderModal, ModalInput } from "../components/NewOrderModal";
import { Order } from "../../../store/orderStore";
type OrderStatus =
  | "unassigned"
  | "assigned"
  | "in_progress"
  | "completed"
  | "failed";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";

export function DashboardOrders() {
  const {
    orders,
    stats,
    isLoading,
    isMutating,
    fetchOrders,
    updateOrder,
    importBulkOrders,
  } = useOrderStore();
  const { drivers, fetchDrivers } = useDriverStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders({ limit: 100 });
    fetchDrivers({ limit: 100 });
  }, [fetchOrders, fetchDrivers]);

  const driverNames = drivers.map((d) => d.name);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || order.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusClasses = (status: OrderStatus) => {
    switch (status) {
      case "unassigned":
        return "bg-gray-100 text-gray-500";
      case "assigned":
        return "bg-blue-50 text-blue-600";
      case "in_progress":
      case "in-progress":
        return "bg-emerald-50 text-emerald-600";
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "failed":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.replace("-", "_").toLowerCase()) {
      case "unassigned":
        return "Unassigned";
      case "assigned":
        return "Assigned";
      case "in_progress":
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="p-4 md:p-8 max-w-350 mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-lg text-[13px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Upload CSV
            </button>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 rounded-lg text-[13px] font-bold text-white shadow-xl shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-95 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              New Order
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Orders" value={stats?.total || 0} />
          <StatCard
            label="Unassigned"
            value={stats?.unassigned || 0}
            color="amber"
          />
          <StatCard
            label="In Progress"
            value={stats?.in_progress || 0}
            color="emerald"
          />
          <StatCard
            label="Completed"
            value={stats?.completed || 0}
            color="emerald"
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white border border-black/5 rounded-xl p-4 md:p-5 mb-8 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative group">
              <MagnifyingGlassIcon className="w-4.5 h-4.5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-emerald-600" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-black/5 rounded-lg text-[13px] outline-none transition-all focus:border-emerald-600 focus:bg-white focus:shadow-[0_0_0_4px_rgba(5,150,105,0.06)] placeholder:text-gray-300"
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
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <ArchiveBoxIcon className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-[14px] font-bold text-gray-400 mb-1">
                  {searchQuery || activeFilter !== "all"
                    ? "No matching orders"
                    : "No orders yet"}
                </p>
                <p className="text-[12px] text-gray-300">
                  {searchQuery || activeFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first order to get started"}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-black/8 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        {order.id}
                      </p>
                      {order.priority && order.priority === "high" && (
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
                    {order.customer_name}
                  </h3>
                  <p className="text-[12px] text-gray-500 mb-4 line-clamp-1">
                    {order.address}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px] text-gray-500 font-medium">
                          {order.time_window_start
                            ? `${order.time_window_start} - ${order.time_window_end}`
                            : "Any time"}
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
              ))
            )}
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-14 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <ArchiveBoxIcon className="w-6 h-6 text-gray-300" />
                          </div>
                          <p className="text-[14px] font-bold text-gray-400">
                            {searchQuery || activeFilter !== "all"
                              ? "No matching orders"
                              : "No orders yet"}
                          </p>
                          <p className="text-[12px] text-gray-300">
                            {searchQuery || activeFilter !== "all"
                              ? "Try adjusting your search or filters"
                              : 'Click "New Order" to add your first delivery'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition-colors hover:bg-gray-50/50 group"
                      >
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-gray-900">
                            {order.id}
                          </p>
                          {order.priority && order.priority === "high" && (
                            <span className="inline-flex px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase rounded-md mt-1 tracking-wider">
                              Priority
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-bold text-gray-800">
                            {order.customer_name}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] text-gray-500 max-w-45 truncate">
                            {order.address}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[13px] text-gray-500 font-medium">
                            {order.time_window_start
                              ? `${order.time_window_start} - ${order.time_window_end}`
                              : "Any time"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {order.driver_id || order.driver_name ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                <UserIcon className="w-3.5 h-3.5 text-gray-500" />
                              </div>
                              <span className="text-[13px] text-gray-700 font-medium">
                                {order.driver_name || "Assigned Driver"}
                              </span>
                            </div>
                          ) : (
                            <select
                              onChange={async (e) => {
                                if (e.target.value) {
                                  // Find driver ID by name from driver store
                                  const matched = drivers.find(
                                    (d) => d.name === e.target.value,
                                  );
                                  if (matched) {
                                    await updateOrder(order.id, {
                                      driver_id: matched.id,
                                      status: "assigned",
                                    });
                                  }
                                }
                              }}
                              className="bg-gray-50/50 border border-black/8 rounded-lg px-2.5 py-1 text-[12px] text-gray-500 outline-none hover:border-emerald-600/30 transition-colors"
                            >
                              <option value="">Assign driver...</option>
                              {driverNames.map((d) => (
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
                    ))
                  )}
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
          drivers={driverNames}
          onClose={() => setEditingOrder(null)}
          onSave={async (updated) => {
            // we'd probably call updateOrder in the store here
            await updateOrder(editingOrder.id, updated);
            setEditingOrder(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadCSVModal
          onClose={() => setShowUploadModal(false)}
          onImport={async (newOrders) => {
            await importBulkOrders(newOrders);
            setShowUploadModal(false);
          }}
          isMutating={isMutating}
        />
      )}

      <NewOrderModal
        open={showNewOrderModal}
        onOpenChange={setShowNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onCreate={() => setShowNewOrderModal(false)}
        drivers={driverNames}
      />
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
      className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0 ${
        active
          ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/10"
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
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      onSave(form);
      setLoading(false);
    }, 800);
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-110 p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-5 border-b border-gray-100 bg-white shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
            Edit Order #{order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          <div className="p-5 space-y-4">
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

            {/* Scrollable Driver Selection */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                Assign Driver
              </label>
              <div className="bg-gray-50 border border-black/8 rounded-xl overflow-hidden">
                <div className="max-h-45 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                  <div className="divide-y divide-black/5">
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          assignedTo: undefined,
                          status: "unassigned",
                        })
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                        !form.assignedTo
                          ? "bg-emerald-50 text-emerald-600 font-bold"
                          : "text-gray-500 hover:bg-white"
                      }`}
                    >
                      Unassigned
                      {!form.assignedTo && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                    </button>
                    {drivers.map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          setForm({
                            ...form,
                            assignedTo: d,
                            status: "assigned",
                          })
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                          form.assignedTo === d
                            ? "bg-emerald-50 text-emerald-600 font-bold"
                            : "text-gray-700 hover:bg-white"
                        }`}
                      >
                        {d}
                        {form.assignedTo === d && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 sm:justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-black/8 text-gray-600 text-[13px] font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-110 p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-5 border-b border-gray-100 bg-white shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
            Upload CSV
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 md:p-6 bg-white overflow-y-auto">
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
              <div className="border border-black/8 rounded-xl overflow-hidden max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full text-[11px] text-left">
                  <thead className="sticky top-0 z-10 bg-gray-50 border-b border-black/5 shadow-sm">
                    <tr>
                      {preview[0]?.map((c, i) => (
                        <th
                          key={i}
                          className="px-3 py-2.5 font-bold text-gray-400"
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {preview.slice(1).map((r, i) => (
                      <tr
                        key={i}
                        className="bg-white hover:bg-gray-50 transition-colors"
                      >
                        {r.map((c, j) => (
                          <td key={j} className="px-3 py-2 text-gray-600">
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
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
        </div>

        <DialogFooter className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 sm:justify-between shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-black/8 text-gray-600 text-[13px] font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={`flex-1 py-3 rounded-xl text-[13px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              loading
                ? "bg-emerald-50 text-emerald-600 shadow-none border border-emerald-100"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
            } disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>Import Orders</>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
