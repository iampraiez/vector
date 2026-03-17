import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";

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
  status: OrderStatus;
  assigned_to?: string;
  notes?: string;
  createdAt: string;
}

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onCreate: (order: Order) => void;
  drivers?: string[];
}

export function NewOrderModal({
  open,
  onOpenChange,
  onClose,
  onCreate,
  drivers = [],
}: NewOrderModalProps) {
  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    city: "",
    packages: "1",
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
      <DialogContent className="max-w-110 p-0 gap-0 overflow-hidden border-none shadow-2xl rounded-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-5 border-b border-gray-100 bg-white shrink-0">
          <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
            New Order
          </DialogTitle>
          <p className="text-[13px] text-gray-500 mt-1">
            Create a delivery order and assign it later
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          <div className="p-5 space-y-4">
            <ModalInput
              label="Customer Name *"
              value={form.customer_name}
              onChange={(v) => setForm({ ...form, customer_name: v })}
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
              <div className="space-y-1.5 flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Time Window
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={form.timeWindowStart}
                    onChange={(e) =>
                      setForm({ ...form, timeWindowStart: e.target.value })
                    }
                    className="flex-1 bg-gray-50 border border-black/8 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-emerald-600 transition-colors"
                  />
                  <span className="text-gray-400 text-[12px] font-bold">-</span>
                  <input
                    type="time"
                    value={form.timeWindowEnd}
                    onChange={(e) =>
                      setForm({ ...form, timeWindowEnd: e.target.value })
                    }
                    className="flex-1 bg-gray-50 border border-black/8 rounded-xl px-3 py-2 text-[13px] outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <ModalInput
                label="Packages"
                value={form.packages}
                type="number"
                onChange={(v) => setForm({ ...form, packages: v })}
              />
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
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
                  className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-2.5 text-[13px] font-medium outline-none hover:border-emerald-600/30 transition-colors cursor-pointer"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
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

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
                Delivery Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-[13px] font-medium outline-none min-h-20 hover:border-emerald-600/30 transition-colors resize-none placeholder:text-gray-300"
                placeholder="Gate code, special instructions..."
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-5 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3 sm:justify-between">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-black/8 text-gray-600 text-[13px] font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!form.customer_name || !form.address || loading}
            className="flex-2 py-3 bg-emerald-600 text-white text-[13px] font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
