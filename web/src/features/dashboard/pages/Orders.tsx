import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useOrderStore } from "../../../store/orderStore";
import { useDriverStore, Driver } from "../../../store/driverStore";
import { api } from "../../../lib/api";

import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  PencilIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  TrashIcon,
  CheckIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { NewOrderModal, ModalInput } from "../components/NewOrderModal";
import { LocationPickerMap } from "../../../components/ui/LocationPickerMap";
import { Order, OrderStatus } from "../../../store/orderStore";
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
    createOrder,
    updateOrder,
    importBulkOrders,
  } = useOrderStore();
  const { drivers, fetchDrivers } = useDriverStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | OrderStatus>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [copyingOrder, setCopyingOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    fetchOrders({ limit: 100 });
    fetchDrivers({ limit: 100 });
  }, [fetchOrders, fetchDrivers]);

  const driverNames = drivers.map((d) => d.name);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            {selectedOrders.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (
                      confirm(
                        `Are you sure you want to delete ${selectedOrders.length} orders?`,
                      )
                    ) {
                      await useOrderStore
                        .getState()
                        .deleteOrders(selectedOrders);
                      setSelectedOrders([]);
                    }
                  }}
                  disabled={isMutating}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[13px] font-bold shadow-sm transition-all hover:bg-red-100 hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isMutating ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <TrashIcon className="w-4 h-4" />
                  )}
                  {isMutating ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-lg text-[13px] font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer"
            >
              <ArrowUpTrayIcon className="w-4 h-4" />
              Upload CSV
            </button>
            <button
              id="tour-new-order-btn"
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
                  { key: "in_progress", label: "In Progress" },
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
              filteredOrders.map((order, index) => (
                <div
                  key={order.id}
                  className={`bg-white border rounded-2xl p-4 shadow-sm transition-all ${
                    selectedOrders.includes(order.id)
                      ? "border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500"
                      : "border-black/8"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                          selectedOrders.includes(order.id)
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-gray-300 bg-white"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedOrders.includes(order.id)) {
                            setSelectedOrders(
                              selectedOrders.filter((id) => id !== order.id),
                            );
                          } else {
                            setSelectedOrders([...selectedOrders, order.id]);
                          }
                        }}
                      >
                        {selectedOrders.includes(order.id) && (
                          <CheckIcon className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                          Order {index + 1}
                        </p>
                        {order.priority && order.priority === "high" && (
                          <span className="inline-flex px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase rounded-md tracking-wider">
                            Priority
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${getStatusClasses(order.status as OrderStatus)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold text-gray-900 mb-1 flex items-center gap-2">
                    {order.customer_name}
                    {!order.lat && !order.lng && (
                      <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                    )}
                  </h3>
                  <p className="text-[12px] text-gray-500 mb-2 line-clamp-1">
                    {order.address}
                  </p>
                  {!order.driver_id && !order.driver_name && (
                    <div className="mb-4">
                      <select
                        disabled={
                          order.status === "completed" ||
                          order.status === "failed"
                        }
                        onChange={async (e) => {
                          if (e.target.value) {
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
                        className="w-full bg-gray-50 border border-black/8 rounded-xl px-3 py-2 text-[12px] text-gray-500 outline-none focus:border-emerald-600"
                      >
                        <option value="">Assign driver...</option>
                        {driverNames.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[11px] text-gray-500 font-medium">
                          {order.delivery_date || "Today"} •{" "}
                          {order.time_window_start
                            ? `${order.time_window_start} - ${order.time_window_end}`
                            : "Any time"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCopyingOrder(order);
                          setShowNewOrderModal(true);
                        }}
                        className="p-2 border border-black/8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        title="Copy Order"
                      >
                        <DocumentDuplicateIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="p-2 border border-black/8 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        title="Edit Order"
                      >
                        <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>
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
                    <th className="px-6 py-4">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                          selectedOrders.length === filteredOrders.length &&
                          filteredOrders.length > 0
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-gray-300 bg-white hover:border-emerald-600"
                        }`}
                        onClick={() => {
                          if (selectedOrders.length === filteredOrders.length) {
                            setSelectedOrders([]);
                          } else {
                            setSelectedOrders(filteredOrders.map((o) => o.id));
                          }
                        }}
                      >
                        {selectedOrders.length === filteredOrders.length &&
                          filteredOrders.length > 0 && (
                            <CheckIcon className="w-3.5 h-3.5 text-white" />
                          )}
                      </div>
                    </th>
                    {[
                      "ORDER",
                      "CUSTOMER",
                      "ADDRESS",
                      "TIME WINDOW",
                      "ASSIGNED TO",
                      "STATUS",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        id={h === "ASSIGNED TO" ? "tour-assign-col" : undefined}
                        className={`px-6 py-4 text-[11px] font-semibold text-gray-500 tracking-wider text-left`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-14 text-center">
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
                    filteredOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className={`transition-colors hover:bg-gray-50/50 group ${
                          selectedOrders.includes(order.id)
                            ? "bg-emerald-50/30"
                            : ""
                        }`}
                      >
                        <td
                          className="px-6 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                              selectedOrders.includes(order.id)
                                ? "bg-emerald-600 border-emerald-600"
                                : "border-gray-300 bg-white hover:border-emerald-600"
                            }`}
                            onClick={() => {
                              if (selectedOrders.includes(order.id)) {
                                setSelectedOrders(
                                  selectedOrders.filter(
                                    (id) => id !== order.id,
                                  ),
                                );
                              } else {
                                setSelectedOrders([
                                  ...selectedOrders,
                                  order.id,
                                ]);
                              }
                            }}
                          >
                            {selectedOrders.includes(order.id) && (
                              <CheckIcon className="w-3.5 h-3.5 text-white" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] font-semibold text-gray-700">
                            Order {index + 1}
                          </p>
                          {order.priority && order.priority === "high" && (
                            <span className="inline-flex px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold uppercase rounded-md mt-1 tracking-wider">
                              Priority
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-semibold text-gray-700">
                              {order.customer_name}
                            </p>
                            {!order.lat && !order.lng && (
                              <div title="Location missing">
                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[13px] text-gray-600 max-w-45 truncate">
                            {order.address}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[13px] text-gray-600 font-medium">
                            {order.delivery_date || "Today"} •{" "}
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
                              <span className="text-[13px] text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-30">
                                {order.driver_name || "Assigned Driver"}
                              </span>
                            </div>
                          ) : (
                            <select
                              id="tour-assign-select"
                              disabled={
                                order.status === "completed" ||
                                order.status === "failed"
                              }
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
                              className={`bg-gray-50/50 border border-black/8 rounded-lg px-2.5 py-1 text-[12px] text-gray-500 outline-none transition-colors ${
                                order.status === "completed" ||
                                order.status === "failed"
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:border-emerald-600/30 cursor-pointer"
                              }`}
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
                            className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusClasses(order.status as OrderStatus)}`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setCopyingOrder(order);
                                setShowNewOrderModal(true);
                              }}
                              className="p-1.5 border border-black/8 rounded-lg text-gray-400 hover:text-emerald-600 hover:border-emerald-600/30 hover:bg-emerald-50 transition-all cursor-pointer"
                              title="Copy Order"
                            >
                              <DocumentDuplicateIcon className="w-4 h-4" />
                            </button>
                            {order.status === "completed" ||
                            order.status === "failed" ? (
                              <div
                                className="p-1.5 border border-black/5 rounded-lg text-gray-300 bg-gray-50/50"
                                title="Finalized - Cannot Edit"
                              >
                                <LockClosedIcon className="w-4 h-4" />
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingOrder(order)}
                                className="p-1.5 border border-black/8 rounded-lg text-gray-400 hover:text-emerald-600 hover:border-emerald-600/30 hover:bg-emerald-50 transition-all cursor-pointer"
                                title="Edit Order"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
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
          drivers={drivers}
          onClose={() => setEditingOrder(null)}
          onSave={async (updated) => {
            await updateOrder(editingOrder.id, updated);
            setEditingOrder(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadCSVModal
          onClose={() => setShowUploadModal(false)}
          onImport={async (newOrders) => {
            await importBulkOrders(newOrders as Order[]);
            setShowUploadModal(false);
          }}
          isMutating={isMutating}
        />
      )}

      <NewOrderModal
        open={showNewOrderModal}
        onOpenChange={(open) => {
          setShowNewOrderModal(open);
          if (!open) setCopyingOrder(null);
        }}
        initialData={copyingOrder}
        onCreate={(orderData) => {
          createOrder(orderData);
          setShowNewOrderModal(false);
          setCopyingOrder(null);
        }}
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

function formatDateForInput(dateStr: string | null | undefined) {
  if (!dateStr || dateStr === "Today") return "";
  // Check if it's already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    // adjust to local date component to avoid timezone shifting
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

function EditOrderModal({
  order,
  drivers,
  onClose,
  onSave,
}: {
  order: Order;
  drivers: Driver[];
  onClose: () => void;
  onSave: (order: Partial<Order>) => void;
}) {
  const [form, setForm] = useState({
    ...order,
    delivery_date: formatDateForInput(order.delivery_date),
  });
  const [loading, setLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const lastGeocodeRef = useRef<{ lat: number; lng: number } | null>(null);

  const handleLocationChange = async (lat: number, lng: number) => {
    // If coordinates are invalid or zero (unlikely but safe), skip
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

    // Only update if significantly changed or first time
    if (
      lastGeocodeRef.current &&
      Math.abs(lastGeocodeRef.current.lat - lat) < 0.0001 &&
      Math.abs(lastGeocodeRef.current.lng - lng) < 0.0001
    ) {
      return;
    }

    setForm((prev) => ({ ...prev, lat, lng }));
    lastGeocodeRef.current = { lat, lng };

    setIsReverseGeocoding(true);
    try {
      const res = await api.post("/map/reverse-geocode", { lat, lng });
      if (res.data.formattedAddress) {
        setForm((prev) => ({
          ...prev,
          address: res.data.formattedAddress,
          city: res.data.city || prev.city,
        }));
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400) {
          console.warn(
            "Reverse geocoding: Server returned 400. Service might be unconfigured or key is missing in .env",
          );
        } else {
          console.error("Reverse geocoding failed:", err);
        }
      } else {
        console.error("Reverse geocoding failed (non-axios):", err);
      }
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Whitelist only fields allowed by UpdateOrderDto
    const updatePayload: Partial<Order> = {
      customer_name: form.customer_name,
      customer_email: form.customer_email,
      customer_phone: form.customer_phone,
      address: form.address,
      city: form.city,
      packages: form.packages,
      priority: form.priority,
      time_window_start: form.time_window_start,
      time_window_end: form.time_window_end,
      delivery_date: form.delivery_date || null,
      notes: form.notes,
      driver_id: form.driver_id,
      status: form.status as OrderStatus,
      lat: form.lat,
      lng: form.lng,
    };

    setTimeout(() => {
      onSave(updatePayload);
      setLoading(false);
    }, 800);
  };

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-32px)] sm:max-w-110 p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh] mx-auto">
        <DialogHeader className="p-5 border-b border-gray-100 bg-white shrink-0 relative">
          <div className="pr-8">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              Edit Order
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          <div className="p-5 space-y-4">
            <ModalInput
              label="Customer Name"
              value={form.customer_name}
              onChange={(v: string) => setForm({ ...form, customer_name: v })}
            />
            <ModalInput
              label="Address *"
              value={form.address}
              onChange={(v: string) => setForm({ ...form, address: v })}
              loading={isReverseGeocoding}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ModalInput
                label="City"
                value={form.city || ""}
                onChange={(v: string) => setForm({ ...form, city: v })}
                placeholder="City"
              />
              <ModalInput
                label="Packages"
                value={form.packages.toString()}
                type="number"
                onChange={(v: string) =>
                  setForm({ ...form, packages: parseInt(v) || 0 })
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={form.delivery_date || ""}
                  onChange={(e) =>
                    setForm({ ...form, delivery_date: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-black/8 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-emerald-600 transition-colors"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Time Window
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={form.time_window_start || "09:00"}
                    onChange={(e) =>
                      setForm({ ...form, time_window_start: e.target.value })
                    }
                    className="flex-1 bg-gray-50 border border-black/8 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-emerald-600 transition-colors"
                  />
                  <span className="text-gray-400 text-[12px] font-bold">-</span>
                  <input
                    type="time"
                    value={form.time_window_end || "17:00"}
                    onChange={(e) =>
                      setForm({ ...form, time_window_end: e.target.value })
                    }
                    className="flex-1 bg-gray-50 border border-black/8 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Location Map Override */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  Delivery Pin
                </label>
                {!form.lat && !form.lng && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase tracking-wider">
                    Missing
                  </span>
                )}
              </div>
              <LocationPickerMap
                lat={form.lat || null}
                lng={form.lng || null}
                onChange={handleLocationChange}
              />
              <p className="text-[10px] text-gray-400 italic mt-2">
                {!form.lat && !form.lng
                  ? "Drag the map and click to place the exact delivery pin."
                  : "Drag the pin to manually adjust the exact delivery location."}
              </p>
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
                          assigned_to: undefined,
                          status: "unassigned",
                        })
                      }
                      className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                        !form.assigned_to
                          ? "bg-emerald-50 text-emerald-600 font-bold"
                          : "text-gray-500 hover:bg-white"
                      }`}
                    >
                      Unassigned
                      {!form.assigned_to && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      )}
                    </button>
                    {drivers.map((d) => (
                      <button
                        key={d.id}
                        onClick={() =>
                          setForm({
                            ...form,
                            driver_id: d.id,
                            driver_name: d.name,
                            status: "assigned",
                          })
                        }
                        className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                          form.driver_id === d.id
                            ? "bg-emerald-50 text-emerald-600 font-bold"
                            : "text-gray-700 hover:bg-white"
                        }`}
                      >
                        {d.name}
                        {form.driver_id === d.id && (
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

        <DialogFooter className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
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
  isMutating,
}: {
  onClose: () => void;
  onImport: (orders: Partial<Order>[]) => void;
  isMutating: boolean;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importOrders, setImportOrders] = useState<Partial<Order>[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
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

      // Skip header row and convert to objects
      const parsedOrders: Partial<Order>[] = rows.slice(1).map((row) => ({
        customer_name: row[0] || "Unknown",
        address: row[1] || "Unknown Address",
        city: row[2] || "",
        packages: parseInt(row[3]) || 1,
        priority: "normal",
        delivery_date: row[4] || new Date().toISOString().split("T")[0],
        time_window_start: row[5] || "09:00",
        time_window_end: row[6] || "17:00",
        notes: row[7] || "",
      }));
      setImportOrders(parsedOrders);
    };
    reader.readAsText(f);
  };

  const handleUpdateRow = (
    index: number,
    field: keyof Order,
    value: string | number | null,
  ) => {
    const updated = [...importOrders];
    updated[index] = { ...updated[index], [field]: value };
    setImportOrders(updated);
  };

  const handleBatchUpdate = (
    field: keyof Order,
    value: string | number | null,
  ) => {
    const updated = importOrders.map((order, i) =>
      selectedRows.has(i) ? { ...order, [field]: value } : order,
    );
    setImportOrders(updated);
  };

  const handleDeleteSelected = () => {
    const updated = importOrders.filter((_, i) => !selectedRows.has(i));
    setImportOrders(updated);
    setSelectedRows(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === importOrders.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(importOrders.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const next = new Set(selectedRows);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedRows(next);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[calc(100%-32px)] sm:max-w-150 p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh] mx-auto">
        <DialogHeader className="p-6 border-b border-gray-100 bg-white shrink-0">
          <div className="flex flex-col items-center text-center px-8">
            <DialogTitle className="text-xl font-black text-gray-900 tracking-tight">
              {file ? "Review & Edit Orders" : "Upload CSV"}
            </DialogTitle>
            <p className="text-[12px] text-gray-500 mt-1">
              {file
                ? "Directly edit rows or use batch actions below"
                : "Import bulk orders from a spreadsheet"}
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          <div className="p-5 md:p-6">
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
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? "border-emerald-600 bg-emerald-50 scale-[0.99]"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100/50"
                }`}
              >
                <ArrowUpTrayIcon
                  className={`w-10 h-10 mx-auto mb-4 transition-colors ${dragOver ? "text-emerald-600" : "text-gray-300"}`}
                />
                <p className="text-[15px] font-bold text-gray-700 mb-1">
                  Select your CSV file
                </p>
                <p className="text-[13px] text-gray-400">
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
                {/* File Info & Batch Counter */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/10">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 truncate max-w-40">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-wider">
                        {importOrders.length} orders detected
                      </p>
                    </div>
                  </div>

                  {selectedRows.size > 0 && (
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 animate-in fade-in slide-in-from-right-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-100/50 sm:border-none">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-lg whitespace-nowrap">
                        {selectedRows.size} selected
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleDeleteSelected}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Selected"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <select
                          onChange={(e) => {
                            if (
                              e.target.value === "high" ||
                              e.target.value === "normal"
                            ) {
                              handleBatchUpdate("priority", e.target.value);
                            }
                            e.target.value = "";
                          }}
                          className="text-[11px] font-bold bg-white border border-emerald-200 rounded-lg px-2 py-1 outline-none text-emerald-700 cursor-pointer hover:border-emerald-400 transition-colors"
                        >
                          <option value="">Priority...</option>
                          <option value="high">High</option>
                          <option value="normal">Normal</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editable Table */}
                <div className="border border-black/8 rounded-2xl overflow-hidden shadow-sm bg-white">
                  <div className="overflow-x-auto max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-[12px] text-left border-collapse">
                      <thead className="sticky top-0 z-20 bg-gray-50 border-b border-black/5">
                        <tr>
                          <th className="p-4 w-10">
                            <input
                              type="checkbox"
                              checked={
                                selectedRows.size === importOrders.length &&
                                importOrders.length > 0
                              }
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                          </th>
                          <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                            Customer
                          </th>
                          <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                            Address
                          </th>
                          <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] w-20">
                            Pkgs
                          </th>
                          <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] w-28">
                            Start
                          </th>
                          <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] w-28">
                            End
                          </th>
                          <th className="px-4 py-3 font-bold text-gray-400 uppercase tracking-widest text-[10px] w-32">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5">
                        {importOrders.map((order, i) => (
                          <tr
                            key={i}
                            className={`group transition-colors ${
                              selectedRows.has(i)
                                ? "bg-emerald-50/30"
                                : "hover:bg-gray-50/50"
                            }`}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={selectedRows.has(i)}
                                onChange={() => toggleSelectRow(i)}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                value={order.customer_name}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    i,
                                    "customer_name",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-900 p-0 hover:bg-black/5 rounded px-1 -mx-1"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                value={order.address}
                                onChange={(e) =>
                                  handleUpdateRow(i, "address", e.target.value)
                                }
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-500 p-0 hover:bg-black/5 rounded px-1 -mx-1"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                value={order.packages}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    i,
                                    "packages",
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-700 p-0 hover:bg-black/5 rounded px-1 -mx-1 text-center"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="time"
                                value={order.time_window_start || "09:00"}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    i,
                                    "time_window_start",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-500 p-0 hover:bg-black/5 rounded px-1 -mx-1 text-[11px]"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="time"
                                value={order.time_window_end || "17:00"}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    i,
                                    "time_window_end",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-500 p-0 hover:bg-black/5 rounded px-1 -mx-1 text-[11px]"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="date"
                                value={order.delivery_date || ""}
                                onChange={(e) =>
                                  handleUpdateRow(
                                    i,
                                    "delivery_date",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-transparent border-none focus:ring-0 text-gray-500 p-0 hover:bg-black/5 rounded px-1 -mx-1 text-[11px]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-black/5">
                  <button
                    onClick={() => {
                      setFile(null);
                      setImportOrders([]);
                      setSelectedRows(new Set());
                    }}
                    className="text-[11px] font-bold text-red-500 uppercase tracking-wider hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Remove & Start Over
                  </button>
                  <p className="text-[11px] text-gray-400 italic px-2">
                    Tip: Click any cell to edit it directly.
                  </p>
                </div>
              </div>
            )}

            {!file && (
              <div className="mt-8 pt-6 border-t border-gray-100/80">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
                        <DocumentIcon className="w-3 text-emerald-600" />
                      </div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Required Headers
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["customer_name", "address"].map((field) => (
                      <div
                        key={field}
                        className="px-2.5 py-1 bg-white border border-emerald-100/50 rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-[11px] font-mono text-gray-700">
                          {field}
                        </span>
                      </div>
                    ))}
                    {["packages", "city", "date", "notes"].map((field) => (
                      <div
                        key={field}
                        className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg flex items-center gap-1.5"
                      >
                        <div className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-[11px] font-mono text-gray-400">
                          {field}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 italic">
                    Vector will automatically map these fields from your CSV.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-gray-100 bg-white shadow-sm shrink-0 sm:flex sm:justify-end">
          <button
            onClick={() => onImport(importOrders)}
            disabled={!file || isMutating || importOrders.length === 0}
            className={`w-full sm:w-auto px-10 py-3 rounded-xl text-[14px] font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
              isMutating
                ? "bg-emerald-50 text-emerald-600 shadow-none border border-emerald-100"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 active:scale-95"
            } disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none cursor-pointer`}
          >
            {isMutating ? (
              <div className="w-4.5 h-4.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              `Import ${importOrders.length} Orders`
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
