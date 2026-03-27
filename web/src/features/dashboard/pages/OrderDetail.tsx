import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useOrderStore, OrderStatus } from "../../../store/orderStore";
import { useDriverStore } from "../../../store/driverStore";
import { copyCustomerTrackingLink } from "../../../utils/trackingLink";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  ArrowLeftIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  TruckIcon,
  PhoneIcon,
  LinkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "../../../components/ui/skeleton";

export function DashboardOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    selectedOrder,
    fetchOrderDetail,
    isLoading,
    isMutating,
    reassignOrder,
  } = useOrderStore();
  const { drivers, fetchDrivers } = useDriverStore();

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignDriverId, setReassignDriverId] = useState<string>("");

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id);
    }
  }, [id, fetchOrderDetail]);

  const trackingRows = useMemo(() => {
    if (!selectedOrder) return [];
    const stops = selectedOrder.route?.stops;
    if (stops?.length) {
      return [...stops]
        .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
        .map((s) => ({
          id: s.id,
          label: `Stop ${s.sequence ?? "?"} — ${s.customer_name || "Customer"}`,
          token: s.tracking_token,
        }));
    }
    if (selectedOrder.tracking_token) {
      return [
        {
          id: selectedOrder.id,
          label: "This delivery",
          token: selectedOrder.tracking_token,
        },
      ];
    }
    return [];
  }, [selectedOrder]);

  if (isLoading && !selectedOrder) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <Skeleton className="w-32 h-4 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-black/8 rounded-2xl p-6 md:p-8 shadow-sm">
              <Skeleton className="w-48 h-10 mb-2" />
              <Skeleton className="w-32 h-4 mb-8" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="w-16 h-3 mb-2" />
                    <Skeleton className="w-24 h-5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-black/8 rounded-2xl p-6 md:p-8 shadow-sm">
              <Skeleton className="w-32 h-6 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="w-16 h-2" />
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-3/4 h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
              <Skeleton className="w-24 h-6 mb-6" />
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-20 h-3" />
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-gray-100">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-5" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedOrder) {
    return (
      <div className="p-8 text-center bg-white border border-black/8 rounded-2xl mx-auto max-w-lg mt-20">
        <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Order not found
        </h2>
        <p className="text-gray-500 mb-6">
          The order you are looking for does not exist or has been removed.
        </p>
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const order = selectedOrder;

  const statusColors: Record<OrderStatus, string> = {
    unassigned: "bg-gray-100 text-gray-600",
    assigned: "bg-blue-50 text-blue-600",
    in_progress: "bg-amber-50 text-amber-600",
    completed: "bg-emerald-50 text-emerald-600",
    failed: "bg-red-50 text-red-600",
  };

  const statusIcons: Record<
    OrderStatus,
    React.ForwardRefExoticComponent<React.ComponentProps<"svg">>
  > = {
    unassigned: ClockIcon,
    assigned: UserIcon,
    in_progress: TruckIcon,
    completed: CheckCircleIcon,
    failed: XCircleIcon,
  };

  const StatusIcon = statusIcons[order.status] || ClockIcon;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard/orders")}
        className="flex items-center gap-1.5 text-[13px] font-bold text-gray-500 mb-8 transition-colors hover:text-emerald-600 cursor-pointer"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Summary & Customer */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    {order.external_id || `Order #${order.id.slice(0, 8)}`}
                  </h1>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${statusColors[order.status]}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {order.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  Created on{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div className="flex gap-3">
                {order.status === "failed" && (
                  <button
                    onClick={() => {
                      setReassignDriverId(order.driver_id || "");
                      setShowReassignModal(true);
                    }}
                    className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Reassign
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-100">
              <DetailItem label="Packages" value={`${order.packages} Units`} />
              <DetailItem
                label="Weight"
                value={order.priority === "high" ? "High Priority" : "Standard"}
              />
              <DetailItem
                label="Delivery Date"
                value={order.delivery_date || "Not set"}
              />
              <DetailItem
                label="Service Time"
                value={
                  order.service_time_min
                    ? `${order.service_time_min} mins`
                    : "Not specified"
                }
              />
            </div>
          </div>

          {/* Customer & Address */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">
              Delivery Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Customer
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-black/5">
                    <UserIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-500 font-normal">
                      {order.customer_email || "No email provided"}
                    </p>
                    <p className="text-sm text-gray-500 font-normal">
                      {order.customer_phone || "No phone provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Address
                </h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-black/5">
                    <MapPinIcon className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 leading-snug">
                      {order.address}
                    </p>
                    <p className="text-sm text-gray-500 font-normal">
                      {order.city || "City not specified"}
                    </p>
                    {order.lat && (
                      <p className="text-[11px] text-emerald-600 font-bold mt-1 uppercase tracking-tight">
                        Coordinates Verified
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {order.notes && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Delivery Notes
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-black/5">
                  <p className="text-sm text-gray-600 leading-relaxed italic">
                    "{order.notes}"
                  </p>
                </div>
              </div>
            )}

            {trackingRows.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Customer Tracking Links
                  </h3>
                </div>
                <ul className="space-y-2">
                  {trackingRows.map((row) => (
                    <li
                      key={row.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-black/5 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-[13px] font-medium text-gray-700 truncate">
                        {row.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyCustomerTrackingLink(row.token)}
                        disabled={!row.token}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        Copy Link
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Driver & Route Assignment */}
        <div className="space-y-8">
          {/* Assignment Card */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Assignment</h2>

            {order.driver ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {order.driver.user.avatar_url ? (
                    <img
                      src={order.driver.user.avatar_url}
                      alt={order.driver.user.full_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-50"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                      <UserIcon className="w-7 h-7 text-white" />
                    </div>
                  )}
                  <div>
                    <Link
                      to={`/dashboard/driver-detail/${order.driver_id}`}
                      className="text-base font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                    >
                      {order.driver.user.full_name}
                    </Link>
                    <p className="text-[12px] text-gray-400 font-medium">
                      Assigned Driver
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <AssignmentDetail
                    icon={PhoneIcon}
                    label="Phone"
                    value={order.driver.user.phone || "—"}
                  />
                  <AssignmentDetail
                    icon={TruckIcon}
                    label="Route"
                    value={order.route_name || "Direct Assignment"}
                  />
                  <AssignmentDetail
                    icon={CalendarIcon}
                    label="Status"
                    value={
                      order.status === "completed" ? "Finished" : "On Duty"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400 mb-4">
                  No driver assigned
                </p>
                <button
                  onClick={() => {
                    setReassignDriverId("");
                    setShowReassignModal(true);
                  }}
                  className="px-5 py-2 bg-white border border-emerald-600 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  Assign Driver
                </button>
              </div>
            )}
          </div>

          {/* Time & Performance */}
          {/* Time & Performance */}
          <div className="bg-white border border-black/8 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Timing</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Target Window
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {order.time_window_start || "Flexible"} -{" "}
                  {order.time_window_end || "Flexible"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Delivery Date
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {order.delivery_date
                    ? new Date(order.delivery_date).toLocaleDateString()
                    : "Not specified"}
                </p>
              </div>

              {["in_progress", "completed"].includes(order.status) && (
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-600">
                      {order.status === "completed"
                        ? "Successfully Delivered"
                        : "Currently on route"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showReassignModal} onOpenChange={setShowReassignModal}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-2xl overflow-hidden p-0">
          <DialogHeader className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              Reassign Failed Order
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-[13px] text-gray-500 mb-4">
              Select a driver to assign to order{" "}
              <strong>{order.customer_name}</strong>, or leave unassigned to
              send back to the pool.
            </p>
            <select
              className="w-full bg-gray-50 border border-black/8 rounded-xl px-3 py-2.5 text-[13px] text-gray-700 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              value={reassignDriverId}
              onChange={(e) => setReassignDriverId(e.target.value)}
            >
              <option value="">-- Leave Unassigned --</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button
              onClick={() => setShowReassignModal(false)}
              className="px-5 py-2 rounded-xl text-[13px] font-bold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={isMutating}
              onClick={async () => {
                try {
                  await reassignOrder(order.id, {
                    driver_id: reassignDriverId || undefined,
                  });
                  toast.success("Order reassigned successfully");
                  setShowReassignModal(false);
                } catch (err: unknown) {
                  const error = err as AxiosError<{ message?: string }>;
                  toast.error(
                    error.response?.data?.message || "Failed to reassign",
                  );
                }
              }}
              className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[13px] font-bold shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isMutating && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Reassign
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function AssignmentDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-gray-300" />
      <span className="text-[13px] text-gray-400 font-medium w-16">
        {label}
      </span>
      <span className="text-[13px] text-gray-700 font-medium">{value}</span>
    </div>
  );
}
