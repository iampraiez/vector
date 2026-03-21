import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolid,
  CheckCircleIcon as CheckSolid,
} from "@heroicons/react/24/solid";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { api } from "../../../lib/api";
import { AxiosError } from "axios";
import { Skeleton } from "../../../components/ui/skeleton";

type DeliveryStatus =
  | "pending"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "failed";

const formatTime = (dateStr: string | null) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface TrackingData {
  trackingToken: string;
  status: DeliveryStatus;
  locationConfirmed: boolean;
  customerName: string;
  address: string;
  stops: Array<{
    id: string;
    externalId: string;
    status: string;
    packages: number;
    notes?: string;
  }>;
  estimatedTime: string;
  arrivedAt: string | null;
  completedAt: string | null;
  company: {
    name: string;
    email: string;
    phone: string;
  };
  driver: {
    id: string;
    name: string;
    phone: string;
    rating: number;
    deliveries: number;
    vehicle: string;
  } | null;
  liveLocation: { lat: number; lng: number } | null;
  timeline: {
    created_at: string;
    assigned_at: string | null;
    started_at: string | null;
    arrived_at: string | null;
    completed_at: string | null;
  };
}

export function CustomerTracking() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [delivery, setDelivery] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [categories, setCategories] = useState({
    on_time: false,
    handled_with_care: false,
    professional: false,
    followed_instructions: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [showQr, setShowQr] = useState(true);
  const [confirmedRecently, setConfirmedRecently] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError(
          "No tracking token provided. Please check your tracking link.",
        );
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/track?token=${token}`);
        setDelivery(res.data);
      } catch (err: unknown) {
        const error = err as AxiosError<{ message: string }>;
        setError(
          error.response?.data?.message ||
            "Unable to find this delivery. Please verify your tracking ID.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleConfirmLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsConfirming(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          console.log(
            `[Tracking] Confirming location: ${position.coords.latitude}, ${position.coords.longitude}`,
          );
          await api.post(`/track/confirm?token=${token}`, {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          const res = await api.get(`/track?token=${token}`);
          setDelivery(res.data);

          setConfirmedRecently(true);
          setTimeout(() => setConfirmedRecently(false), 5000);
        } catch (err: unknown) {
          const error = err as AxiosError<{ message: string }>;
          alert(error.response?.data?.message || "Failed to confirm location.");
        } finally {
          setIsConfirming(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Unable to retrieve your location. Please check your permissions.",
        );
        setIsConfirming(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };
  const handleSubmitRating = async () => {
    if (selectedRating === 0 || !token) return;
    try {
      await api.post(`/track/rate?token=${token}`, {
        rating: selectedRating,
        comment,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      alert(error.response?.data?.message || "Failed to submit rating.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans">
        {/* Top Brand Bar Skeleton */}
        <div className="bg-white border-b border-black/5 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-24 h-6 rounded-md" />
          </div>
          <div className="text-right">
            <Skeleton className="w-28 h-4 mb-1.5 ml-auto" />
            <div className="flex gap-2 justify-end">
              <Skeleton className="w-20 h-3" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        </div>

        <div className="max-w-120 mx-auto p-4">
          {/* Status Card Skeleton */}
          <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
            <Skeleton className="w-24 h-8 rounded-full mb-4" />
            <Skeleton className="w-48 h-7 mb-2" />
            <Skeleton className="w-64 h-4 mb-6" />

            <div className="bg-emerald-50/50 rounded-xl p-3 px-4 flex items-center gap-2.5 mb-4 border border-emerald-600/10">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="w-32 h-4" />
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 px-3.5 bg-gray-50/50 rounded-xl border border-black/5">
              <Skeleton className="w-4 h-4 rounded-full mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="w-16 h-2" />
                <Skeleton className="w-full h-4" />
              </div>
            </div>
          </div>

          {/* Timeline Skeleton */}
          <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
            <Skeleton className="w-32 h-4 mb-6" />
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div className="flex-1 flex justify-between">
                    <Skeleton className="w-32 h-4" />
                    <Skeleton className="w-12 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-black/8 p-10 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-600/10">
            <LocalShippingIcon size={32} className="text-emerald-600/40" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
            Invalid Tracking Link
          </h2>
          <p className="text-sm text-gray-500 mb-10 leading-relaxed px-4">
            {error ||
              "We couldn't find a delivery associated with this link. Please check the URL or contact the sender for assistance."}
          </p>

          <div className="pt-8 border-t border-black/5">
            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.15em] mb-4">
              Powered by Vector
            </p>
            <p className="text-[13px] text-gray-400 mb-6 px-6">
              The all-in-one delivery platform for modern logistics fleets.
            </p>
            <a
              href="https://vector-logistics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Learn more about Vector
            </a>
          </div>
        </div>
      </div>
    );
  }

  const status = delivery.status as DeliveryStatus;

  const statusConfig: Record<
    DeliveryStatus,
    {
      label: string;
      color: string;
      bg: string;
      icon: React.ReactNode;
      desc: string;
    }
  > = {
    pending: {
      label: "Pending",
      color: "#D97706",
      bg: "#FEF3C7",
      icon: <ClockIcon className="w-5 h-5" />,
      desc: "Your order is being processed",
    },
    assigned: {
      label: "Assigned",
      color: "#3B82F6",
      bg: "#EFF6FF",
      icon: <LocalShippingIcon size={20} />,
      desc: "A driver has been assigned",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "#059669",
      bg: "#ECFDF5",
      icon: <LocalShippingIcon size={20} />,
      desc: "Your driver is on the way",
    },
    delivered: {
      label: "Delivered",
      color: "#059669",
      bg: "#ECFDF5",
      icon: <CheckCircleIcon className="w-5 h-5" />,
      desc: "Package has been delivered",
    },
    failed: {
      label: "Delivery Failed",
      color: "#EF4444",
      bg: "#FEF2F2",
      icon: <XMarkIcon className="w-5 h-5" />,
      desc: "We couldn't complete this delivery",
    },
  };

  const sc = statusConfig[status] || statusConfig.pending;

  const timelineSteps = [
    { label: "Order received", time: delivery.timeline.created_at },
    { label: "Driver assigned", time: delivery.timeline.assigned_at },
    { label: "Out for delivery", time: delivery.timeline.started_at },
    { label: "Driver arrived", time: delivery.timeline.arrived_at },
    { label: "Delivered", time: delivery.timeline.completed_at },
  ];
  const categoryLabels: Record<keyof typeof categories, string> = {
    on_time: "⏱ On time",
    handled_with_care: "📦 Handled with care",
    professional: "🤝 Professional",
    followed_instructions: "✅ Followed instructions",
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Brand Bar */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-black/5 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-700 shadow-sm shadow-emerald-500/20">
            <LocalShippingIcon size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-[-0.03em] text-gray-900 uppercase">
            Vector
          </span>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-extrabold text-[#111827] leading-tight">
            {delivery.company.name}
          </p>
          <div className="flex items-center justify-end gap-2.5 mt-1">
            {delivery.company.email && (
              <a
                href={`mailto:${delivery.company.email}`}
                className="text-[10px] bg-gray-50 text-gray-400 font-bold px-1.5 py-0.5 rounded border border-black/5 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                {delivery.company.email}
              </a>
            )}
            {delivery.company.phone && (
              <a
                href={`tel:${delivery.company.phone}`}
                className="text-[10px] bg-gray-50 text-gray-400 font-bold px-1.5 py-0.5 rounded border border-black/5 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                {delivery.company.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-120 mx-auto p-4">
        {/* Success Notification (Fixed Toast) */}
        {confirmedRecently && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm bg-emerald-600 text-white p-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-900/40 animate-in fade-in slide-in-from-top-4 active:scale-95 transition-transform">
            <CheckCircleIcon className="w-5 h-5 text-emerald-100 shrink-0" />
            <p className="text-[13px] font-bold leading-tight">
              Location confirmed! Driver is heading your way.
            </p>
          </div>
        )}

        {/* Verification QR (Persistent if out for delivery) */}
        {status === "out_for_delivery" && (
          <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowQr(!showQr)}
              className="w-full flex items-center justify-between"
            >
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Delivery QR Scan
              </p>
              <div
                className={`transition-transform duration-300 ${showQr ? "rotate-180" : ""}`}
              >
                <Skeleton className="w-5 h-5 rounded-full" />{" "}
                {/* Using a placeholder or icon here */}
                {/* Let's use a real icon from heroicons later if needed, but for now a simple arrow or chevron */}
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {showQr && (
              <div className="pt-5 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="inline-block p-4 bg-gray-50 rounded-2xl border border-black/5 mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${delivery.trackingToken}`}
                    alt="Delivery QR"
                    className="w-32 h-32 mix-blend-multiply"
                  />
                </div>
                <p className="text-xs text-gray-500 px-4 leading-relaxed font-medium">
                  Please present this QR code to the driver upon arrival to
                  confirm your delivery.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-4"
            style={{ backgroundColor: sc.bg, color: sc.color }}
          >
            {sc.icon}
            <span className="text-[13px] font-semibold">{sc.label}</span>
          </div>

          <h1 className="text-xl font-bold text-[#212121] mb-1 tracking-tight">
            Hey {delivery.customerName.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mb-4">{sc.desc}</p>

          {/* ETA */}
          {(status === "out_for_delivery" || status === "assigned") && (
            <div className="bg-emerald-50 rounded-xl p-3 px-4 flex items-center gap-2.5 mb-4 border border-emerald-600/15">
              <ClockIcon className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Estimated Arrival
                </p>
                <p className="text-[15px] font-semibold text-[#212121]">
                  {delivery.estimatedTime}
                </p>
              </div>
            </div>
          )}

          {/* Precision Button */}
          {(status === "out_for_delivery" || status === "assigned") && (
            <button
              onClick={handleConfirmLocation}
              disabled={isConfirming}
              className={`w-full mb-4 group relative flex items-center justify-center gap-2.5 p-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-70 overflow-hidden shadow-lg shadow-emerald-500/10 ${
                delivery.locationConfirmed
                  ? "bg-white border-2 border-emerald-600/20 text-emerald-600 hover:bg-emerald-50/50"
                  : "bg-linear-to-br from-emerald-600 to-emerald-800 text-white"
              }`}
            >
              {isConfirming ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  <span>Updating Location...</span>
                </>
              ) : (
                <>
                  {delivery.locationConfirmed ? (
                    <MapPinIcon className="w-4 h-4" />
                  ) : (
                    <div className="relative">
                      <MapPinIcon className="w-4 h-4 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border-2 border-emerald-600 animate-ping" />
                    </div>
                  )}
                  <span>
                    {delivery.locationConfirmed
                      ? "Update Precise Position"
                      : "Confirm My Precise Position"}
                  </span>
                </>
              )}
              {isConfirming && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/20">
                  <div className="h-full bg-white animate-[shimmer_2s_infinite] w-1/3" />
                </div>
              )}
            </button>
          )}

          {delivery.locationConfirmed && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50/50 border border-emerald-600/10 rounded-xl mb-4">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Precision position confirmed
              </p>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-2.5 p-3 px-3.5 bg-gray-50 rounded-xl border border-black/6">
            <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wider">
                Delivering to
              </p>
              <p className="text-[13px] text-[#212121] font-medium leading-normal">
                {delivery.address}
              </p>
            </div>
          </div>

          {/* Grouped Stops */}
          {delivery.stops.length > 1 && (
            <div className="mt-4 pt-4 border-t border-black/5">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Shipment Includes ({delivery.stops.length} packages)
              </p>
              <div className="space-y-2">
                {delivery.stops.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-lg border border-black/5"
                  >
                    <div className="flex items-center gap-2">
                      <LocalShippingIcon size={14} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700">
                        {s.externalId}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-md ${s.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {s.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-gray-300 mt-4">
            Tracking ID: {delivery.trackingToken}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
          <h2 className="text-sm font-bold text-[#212121] mb-5">
            Delivery Progress
          </h2>
          <div className="relative">
            <div className="absolute left-2.75 top-3.5 w-0.5 h-[calc(100%-28px)] bg-black/8" />
            {timelineSteps.map((step, i) => (
              <div
                key={i}
                className={`flex gap-3.5 items-start ${i < timelineSteps.length - 1 ? "pb-5" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                    step.time
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-white border-black/15"
                  }`}
                >
                  {step.time && <CheckSolid className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-[13px] ${step.time ? "font-bold text-[#212121]" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                    {step.time && (
                      <span className="text-xs text-gray-400 font-medium">
                        {formatTime(step.time)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Info */}
        {(status === "out_for_delivery" || status === "delivered") &&
          delivery.driver && (
            <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
              <h2 className="text-sm font-bold text-[#212121] mb-4">
                Your Driver
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-white text-lg font-bold">
                    {delivery.driver.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#212121]">
                    {delivery.driver.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StarSolid className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-gray-400 font-medium">
                      {delivery.driver.rating} · {delivery.driver.deliveries}{" "}
                      deliveries
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-300 mt-1">
                    {delivery.driver.vehicle}
                  </p>
                </div>
                {status === "out_for_delivery" && (
                  <a
                    href={`tel:${delivery.driver.phone}`}
                    className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-600/15 flex items-center justify-center transition-all duration-200 hover:bg-emerald-100 hover:scale-105"
                  >
                    <PhoneIcon className="w-5 h-5 text-emerald-600" />
                  </a>
                )}
              </div>
            </div>
          )}

        {/* Rating Section */}
        {status === "delivered" && !submitted && (
          <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
            <h2 className="text-[15px] font-extrabold text-[#212121] mb-1">
              How was your delivery?
            </h2>
            <p className="text-[13px] text-gray-500 mb-4.5">
              Help {delivery.driver?.name?.split(" ")[0]} improve with your
              feedback
            </p>

            {/* Stars */}
            <div className="flex gap-2 mb-4 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className={`bg-none border-none cursor-pointer p-1 transition-transform duration-150 ${
                    hoverRating >= star || selectedRating >= star
                      ? "scale-115"
                      : "scale-100"
                  }`}
                >
                  {hoverRating >= star || selectedRating >= star ? (
                    <StarSolid className="w-9 h-9 text-amber-400" />
                  ) : (
                    <StarIcon className="w-9 h-9 text-gray-300" />
                  )}
                </button>
              ))}
            </div>

            {selectedRating > 0 && (
              <>
                {/* Category tags */}
                <div className="flex flex-wrap gap-2 mb-3.5">
                  {(
                    Object.keys(categories) as Array<keyof typeof categories>
                  ).map((key) => (
                    <button
                      key={key}
                      onClick={() =>
                        setCategories((prev) => ({
                          ...prev,
                          [key]: !prev[key],
                        }))
                      }
                      className={`px-3.5 py-1.75 rounded-full text-[13px] font-medium transition-all duration-200 border ${
                        categories[key]
                          ? "bg-emerald-50 border-emerald-600 text-emerald-600"
                          : "bg-white border-black/12 text-gray-500 hover:border-black/20"
                      }`}
                    >
                      {categoryLabels[key]}
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a note (optional)..."
                  className="w-full p-3 border border-black/12 rounded-xl text-sm text-[#212121] resize-none outline-none font-sans mb-3.5 box-border min-h-20 transition-colors focus:border-emerald-600"
                />
              </>
            )}

            <button
              onClick={handleSubmitRating}
              disabled={selectedRating === 0}
              className={`w-full p-3.5 rounded-xl text-[15px] font-bold transition-all duration-200 ${
                selectedRating > 0
                  ? "bg-emerald-600 text-white cursor-pointer hover:bg-emerald-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Rating
            </button>
          </div>
        )}

        {/* Rating Success */}
        {submitted && (
          <div className="bg-white rounded-2xl border border-emerald-600/20 p-7 mb-3 text-center shadow-[0_2px_8px_rgba(5,150,105,0.1)]">
            <div className="w-15 h-15 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3.5 border-2 border-emerald-600/20">
              <CheckCircleIcon className="w-7.5 h-7.5 text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-[#212121] mb-1.5">
              Thanks for the feedback!
            </h2>
            <p className="text-[13px] text-gray-500 leading-relaxed">
              Your rating helps us improve the delivery experience. See you next
              time!
            </p>
          </div>
        )}

        {/* Professional Footer / Branding */}
        <div className="mt-12 mb-8 pt-8 border-t border-black/5 text-center">
          <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.2em] mb-3">
            Powered by Vector
          </p>
          <p className="text-[13px] text-gray-400 mb-5 px-8 leading-relaxed max-w-80 mx-auto">
            Real-time logistics and fleet management for modern delivery teams.
          </p>
          <a
            href="https://vector-logistics.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Learn more about Vector
          </a>
        </div>
      </div>
    </div>
  );
}
