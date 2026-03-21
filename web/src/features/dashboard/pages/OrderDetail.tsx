import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { useOrderStore, OrderStatus } from "../../../store/orderStore";
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
} from "@heroicons/react/24/outline";

export function DashboardOrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { selectedOrder, fetchOrderDetail, isLoading } = useOrderStore();

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id);
    }
  }, [id, fetchOrderDetail]);

  if (isLoading && !selectedOrder) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
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
                    : "N/A"}
                </p>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-black/8 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Edit Order
                </button>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors">
                  Print Label
                </button>
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
                value={`${order.service_time_min || 10} mins`}
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
                    <p className="text-base font-bold text-gray-900">
                      {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer_email || "No email provided"}
                    </p>
                    <p className="text-sm text-gray-500">
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
                    <p className="text-base font-bold text-gray-900 leading-snug">
                      {order.address}
                    </p>
                    <p className="text-sm text-gray-500">
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
                    value={order.driver.user.phone || "N/A"}
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
                <button className="px-5 py-2 bg-white border border-emerald-600 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors">
                  Assign Driver
                </button>
              </div>
            )}
          </div>

          {/* Time & Performance */}
          <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-xl shadow-emerald-900/20">
            <h2 className="text-lg font-bold mb-6 opacity-90">Timing</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                  Target Window
                </p>
                <p className="text-base font-medium">
                  {order.time_window_start || "08:00"} -{" "}
                  {order.time_window_end || "18:00"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">
                  Estimated Delivery
                </p>
                <p className="text-base font-medium">
                  {order.delivery_date || "Today"}, ~14:30
                </p>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-emerald-400">
                    On Schedule
                  </span>
                </div>
                <p className="text-xs opacity-60 leading-relaxed">
                  Driver is currently 1.2km away from this location according to
                  last telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
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
      <span className="text-[13px] text-gray-700 font-bold">{value}</span>
    </div>
  );
}

function PhoneIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
      />
    </svg>
  );
}
