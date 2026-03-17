import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import {
  UserIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CubeIcon,
  CalendarIcon,
  ClockIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export type OrderStatus =
  | "unassigned"
  | "assigned"
  | "in-progress"
  | "completed"
  | "failed";

export interface Order {
  id: string;
  customer_name: string;
  address: string;
  city: string;
  packages: number;
  priority: "normal" | "high";
  time_window_start: string | null;
  time_window_end: string | null;
  delivery_date: string | null;
  status: OrderStatus;
  assigned_to?: string;
  notes?: string;
  createdAt: string;
}

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (order: Order) => void;
  drivers?: string[];
}

export function NewOrderModal({
  open,
  onOpenChange,
  onCreate,
  drivers = [],
}: NewOrderModalProps) {
  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    city: "",
    packages: "1",
    deliveryDate: new Date().toISOString().split("T")[0],
    timeWindowStart: "09:00",
    timeWindowEnd: "17:00",
    priority: "normal" as "normal" | "high",
    assigned_to: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!form.customer_name || !form.address) return;
    setLoading(true);
    setTimeout(() => {
      onCreate({
        id: `DEL-${Math.floor(Math.random() * 900) + 100}`,
        customer_name: form.customer_name,
        address: form.address,
        city: form.city,
        packages: parseInt(form.packages) || 1,
        priority: form.priority,
        delivery_date: form.deliveryDate,
        time_window_start: form.timeWindowStart,
        time_window_end: form.timeWindowEnd,
        status: form.assigned_to ? "assigned" : "unassigned",
        assigned_to: form.assigned_to || undefined,
        notes: form.notes || undefined,
        createdAt: "Just now",
      });
      setLoading(false);
      setForm({
        customer_name: "",
        address: "",
        city: "",
        packages: "1",
        deliveryDate: new Date().toISOString().split("T")[0],
        timeWindowStart: "09:00",
        timeWindowEnd: "17:00",
        priority: "normal",
        assigned_to: "",
        notes: "",
      });
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-32px)] sm:max-w-110 p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh] mx-auto focus:outline-none">
        <DialogHeader className="p-6 border-b border-gray-100 bg-white shrink-0">
          <div className="flex flex-col items-center text-center px-8">
            <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
              New Order
            </DialogTitle>
            <p className="text-[13px] text-gray-500 mt-1">
              Create a delivery order and assign it later
            </p>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          <div className="p-5 space-y-4">
            <div className="space-y-4">
              <ModalInput
                label="Customer Name *"
                value={form.customer_name}
                onChange={(v) => setForm({ ...form, customer_name: v })}
                placeholder="Acme Corp"
                icon={<UserIcon className="w-4 h-4 text-emerald-600" />}
              />
              <ModalInput
                label="Address *"
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
                placeholder="742 Evergreen Terrace"
                icon={<MapPinIcon className="w-4 h-4 text-emerald-600" />}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalInput
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                  placeholder="Springfield"
                  icon={
                    <BuildingOfficeIcon className="w-4 h-4 text-emerald-600" />
                  }
                />
                <ModalInput
                  label="Packages"
                  value={form.packages}
                  type="number"
                  onChange={(v) => setForm({ ...form, packages: v })}
                  icon={<CubeIcon className="w-4 h-4 text-emerald-600" />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Delivery Date
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100/80 rounded-full flex items-center justify-center shadow-sm group-focus-within:border-emerald-200 group-focus-within:bg-emerald-50 transition-all">
                    <CalendarIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) =>
                      setForm({ ...form, deliveryDate: e.target.value })
                    }
                    className="w-full bg-gray-50/50 border border-black/8 rounded-xl pl-12 pr-4 py-2.5 text-[13.5px] font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Time Window
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative group flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100/80 rounded-full flex items-center justify-center shadow-sm group-focus-within:border-emerald-200 group-focus-within:bg-emerald-50 transition-all">
                      <ClockIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <input
                      type="time"
                      value={form.timeWindowStart}
                      onChange={(e) =>
                        setForm({ ...form, timeWindowStart: e.target.value })
                      }
                      className="w-full bg-gray-50/50 border border-black/8 rounded-xl pl-12 pr-2 py-2.5 text-[13.5px] font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                  <span className="text-gray-300 font-bold">-</span>
                  <input
                    type="time"
                    value={form.timeWindowEnd}
                    onChange={(e) =>
                      setForm({ ...form, timeWindowEnd: e.target.value })
                    }
                    className="flex-1 bg-gray-50/50 border border-black/8 rounded-xl px-2 py-2.5 text-[13.5px] font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Priority
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100/80 rounded-full flex items-center justify-center shadow-sm pointer-events-none transition-all group-focus-within:border-emerald-200 group-focus-within:bg-emerald-50">
                  <BookmarkIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value as "normal" | "high",
                    })
                  }
                  className="w-full bg-gray-50/50 border border-black/8 rounded-xl pl-12 pr-4 py-2.5 text-[13.5px] font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Scrollable Driver Selection */}
            {drivers.length > 0 && (
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                  Assign Driver (Optional)
                </label>
                <div className="bg-gray-50 border border-black/8 rounded-xl overflow-hidden">
                  <div className="max-h-45 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <div className="divide-y divide-black/5">
                      <button
                        onClick={() => setForm({ ...form, assigned_to: "" })}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                          form.assigned_to === ""
                            ? "bg-emerald-50 text-emerald-600 font-bold"
                            : "text-gray-500 hover:bg-white"
                        }`}
                      >
                        Unassigned
                        {form.assigned_to === "" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </button>
                      {drivers.map((d) => (
                        <button
                          key={d}
                          onClick={() => setForm({ ...form, assigned_to: d })}
                          className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                            form.assigned_to === d
                              ? "bg-emerald-50 text-emerald-600 font-bold"
                              : "text-gray-700 hover:bg-white"
                          }`}
                        >
                          {d}
                          {form.assigned_to === d && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                Delivery Notes
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-4 w-7 h-7 bg-white border border-gray-100/80 rounded-full flex items-center justify-center shadow-sm transition-all group-focus-within:border-emerald-200 group-focus-within:bg-emerald-50">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-emerald-600" />
                </div>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-gray-50/50 border border-black/8 rounded-xl pl-12 pr-4 py-3 text-[13.5px] font-medium outline-none min-h-24 focus:border-emerald-600 focus:bg-white transition-all resize-none placeholder:text-gray-300"
                  placeholder="Gate code, special instructions..."
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-gray-100 bg-white shrink-0 sm:flex sm:justify-end">
          <button
            onClick={handleCreate}
            disabled={!form.customer_name || !form.address || loading}
            className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-emerald-600/15 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all flex items-center justify-center cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Order"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ModalInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-gray-400 border-gray-100 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100/80 rounded-full flex items-center justify-center shadow-sm group-focus-within:border-emerald-200 group-focus-within:bg-emerald-50 transition-all">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-gray-50/50 border border-black/8 rounded-xl ${
            icon ? "pl-12" : "px-4"
          } pr-4 py-2.5 text-[13.5px] font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all placeholder:text-gray-300`}
        />
      </div>
    </div>
  );
}
