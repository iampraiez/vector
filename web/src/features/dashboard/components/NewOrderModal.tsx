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
    if (!form.customerName || !form.address) return;
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
      setLoading(false);
      setForm({
        customerName: "",
        address: "",
        city: "",
        packages: "1",
        timeWindow: "",
        priority: "normal",
        assignedTo: "",
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
                        onClick={() => setForm({ ...form, assignedTo: "" })}
                        className={`w-full flex items-center justify-between px-4 py-3 text-[13px] transition-all cursor-pointer ${
                          form.assignedTo === ""
                            ? "bg-emerald-50 text-emerald-600 font-bold"
                            : "text-gray-500 hover:bg-white"
                        }`}
                      >
                        Unassigned
                        {form.assignedTo === "" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        )}
                      </button>
                      {drivers.map((d) => (
                        <button
                          key={d}
                          onClick={() => setForm({ ...form, assignedTo: d })}
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
            disabled={!form.customerName || !form.address || loading}
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
