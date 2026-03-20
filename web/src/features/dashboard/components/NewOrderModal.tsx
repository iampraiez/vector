import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { api } from "../../../lib/api";
import { Order } from "../../../store/orderStore";
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
import { LocationPickerMap } from "../../../components/ui/LocationPickerMap";

interface NewOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (order: Partial<Order>) => void;
  drivers?: string[];
  initialData?: Partial<Order> | null;
}

export function NewOrderModal({
  open,
  onOpenChange,
  onCreate,
  drivers = [],
  initialData = null,
}: NewOrderModalProps) {
  const [form, setForm] = useState({
    customer_name: "",
    address: "",
    city: "",
    packages: 1,
    deliveryDate: new Date().toISOString().split("T")[0],
    timeWindowStart: "09:00",
    timeWindowEnd: "17:00",
    priority: "normal" as "normal" | "high",
    assigned_to: "",
    notes: "",
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const [loading, setLoading] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const lastGeocodeRef = useRef<{ lat: number; lng: number } | null>(null);

  // We use the initialData as a base for the form.
  // To avoid the setState in useEffect lint, we can derive the initial state or use a key.
  // However, since form state needs to be mutable, we'll keep the useEffect but suppress the lint
  // or use a more standard pattern.
  // Given the current structure, we'll just fix the flickering/cascading by ensuring it only runs when necessary.

  useEffect(() => {
    if (!open) return;

    setForm({
      customer_name: initialData?.customer_name || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      packages: initialData?.packages || 1,
      deliveryDate:
        initialData?.delivery_date || new Date().toISOString().split("T")[0],
      timeWindowStart: initialData?.time_window_start || "09:00",
      timeWindowEnd: initialData?.time_window_end || "17:00",
      priority: initialData?.priority || "normal",
      assigned_to: "", // Always reset assignment for a copied order
      notes: initialData?.notes || "",
      lat: initialData?.lat,
      lng: initialData?.lng,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData?.id]);

  const handleCreate = () => {
    if (!form.customer_name || !form.address) return;
    setLoading(true);
    setTimeout(() => {
      onCreate({
        id: `DEL-${Math.floor(Math.random() * 900) + 100}`,
        customer_name: form.customer_name,
        address: form.address,
        city: form.city,
        packages: form.packages,
        priority: form.priority,
        delivery_date: form.deliveryDate,
        time_window_start: form.timeWindowStart,
        time_window_end: form.timeWindowEnd,
        status: form.assigned_to ? "assigned" : "unassigned",
        assigned_to: form.assigned_to || undefined,
        notes: form.notes || undefined,
        lat: form.lat,
        lng: form.lng,
      });
      setLoading(false);
      setForm({
        customer_name: "",
        address: "",
        city: "",
        packages: 1,
        deliveryDate: new Date().toISOString().split("T")[0],
        timeWindowStart: "09:00",
        timeWindowEnd: "17:00",
        priority: "normal",
        assigned_to: "",
        notes: "",
        lat: undefined,
        lng: undefined,
      });
      onOpenChange(false);
    }, 1200);
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    // If coordinates are invalid or zero, skip
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
          // Extract city if possible or keep existing if not returned specifically
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
                onChange={(v: string) => setForm({ ...form, customer_name: v })}
                placeholder="Acme Corp"
                icon={<UserIcon className="w-4 h-4 text-emerald-600" />}
              />
              <ModalInput
                label="Address *"
                value={form.address}
                onChange={(v: string) => setForm({ ...form, address: v })}
                placeholder="742 Evergreen Terrace"
                icon={<MapPinIcon className="w-4 h-4 text-emerald-600" />}
                loading={isReverseGeocoding}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalInput
                  label="City"
                  value={form.city}
                  onChange={(v: string) => setForm({ ...form, city: v })}
                  placeholder="Springfield"
                  icon={
                    <BuildingOfficeIcon className="w-4 h-4 text-emerald-600" />
                  }
                />
                <ModalInput
                  label="Packages"
                  value={form.packages.toString()}
                  type="number"
                  onChange={(v: string) =>
                    setForm({ ...form, packages: parseInt(v) || 0 })
                  }
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

            {/* Location Map Override */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Delivery Pin (Optional)
                </label>
                {!form.lat && !form.lng && (
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase tracking-widest leading-none">
                    Auto-Geocoding
                  </span>
                )}
              </div>
              <LocationPickerMap
                lat={form.lat || null}
                lng={form.lng || null}
                onChange={handleLocationChange}
              />
              <p className="text-[10px] text-gray-400 italic mt-2 ml-1">
                {!form.lat && !form.lng
                  ? "Leave blank to auto-geocode from address, or drop a pin for exact placement."
                  : "Drag the pin to manually set the exact delivery location."}
              </p>
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
  loading,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold text-gray-400 border-gray-100 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100/80 rounded-full flex items-center justify-center shadow-sm group-focus-within:border-emerald-200 group-focus-within:bg-emerald-50 transition-all">
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              icon
            )}
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
