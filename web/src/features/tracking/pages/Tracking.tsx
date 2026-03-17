import React, { useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarSolid,
  TruckIcon,
  CheckCircleIcon as CheckSolid,
} from "@heroicons/react/24/solid";

type DeliveryStatus =
  | "pending"
  | "assigned"
  | "out_for_delivery"
  | "delivered"
  | "failed";

const mockDelivery = {
  trackingId: "VCT-20260306-1234",
  status: "out_for_delivery" as DeliveryStatus,
  customerName: "Sarah Chen",
  packageCount: 2,
  estimatedTime: "2:30 PM – 4:00 PM",
  address: "742 Evergreen Terrace, Springfield, IL",
  driver: {
    name: "Alex Rivera",
    phone: "+1 (555) 123-4567",
    photo: null as null,
    rating: 4.9,
    deliveries: 234,
    vehicle: "Ford Transit · ABC-1234",
  },
  timeline: [
    { label: "Order received", time: "8:00 AM", done: true },
    { label: "Route assigned", time: "8:45 AM", done: true },
    { label: "Driver picked up", time: "9:30 AM", done: true },
    { label: "Out for delivery", time: "11:15 AM", done: true },
    { label: "Delivered", time: null, done: false },
  ],
  company: "Acme Logistics",
  companyLogo: null as null,
};

export function CustomerTracking() {
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

  const status = mockDelivery.status;

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
      icon: <TruckIcon className="w-5 h-5" />,
      desc: "A driver has been assigned",
    },
    out_for_delivery: {
      label: "Out for Delivery",
      color: "#059669",
      bg: "#ECFDF5",
      icon: <TruckIcon className="w-5 h-5" />,
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

  const sc = statusConfig[status];

  const handleSubmitRating = () => {
    if (selectedRating === 0) return;
    setSubmitted(true);
  };

  const categoryLabels: Record<keyof typeof categories, string> = {
    on_time: "⏱ On time",
    handled_with_care: "📦 Handled with care",
    professional: "🤝 Professional",
    followed_instructions: "✅ Followed instructions",
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Brand Bar */}
      <div className="bg-white border-b border-black/8 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800">
            <TruckIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-extrabold tracking-[0.04em] text-[#121212]">
            VECTOR
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Powered by {mockDelivery.company}
        </p>
      </div>

      <div className="max-w-120 mx-auto p-4">
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
            Hey {mockDelivery.customerName.split(" ")[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 mb-4">{sc.desc}</p>

          {/* ETA */}
          {status === "out_for_delivery" && (
            <div className="bg-emerald-50 rounded-xl p-3 px-4 flex items-center gap-2.5 mb-4 border border-emerald-600/15">
              <ClockIcon className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                  Estimated Arrival
                </p>
                <p className="text-[15px] font-semibold text-[#212121]">
                  {mockDelivery.estimatedTime}
                </p>
              </div>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-2.5 p-3 px-3.5 bg-gray-50 rounded-xl border border-black/6">
            <MapPinIcon className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-gray-400 font-medium mb-0.5 uppercase tracking-wider">
                Delivering to
              </p>
              <p className="text-[13px] text-[#212121] font-medium leading-normal">
                {mockDelivery.address}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-gray-300 mt-2.5">
            Tracking ID: {mockDelivery.trackingId}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
          <h2 className="text-sm font-bold text-[#212121] mb-5">
            Delivery Progress
          </h2>
          <div className="relative">
            <div className="absolute left-2.75 top-3.5 w-0.5 h-[calc(100%-28px)] bg-black/8" />
            {mockDelivery.timeline.map((step, i) => (
              <div
                key={i}
                className={`flex gap-3.5 items-start ${i < mockDelivery.timeline.length - 1 ? "pb-5" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                    step.done
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-white border-black/15"
                  }`}
                >
                  {step.done && <CheckSolid className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex justify-between items-center">
                    <p
                      className={`text-[13px] ${step.done ? "font-bold text-[#212121]" : "text-gray-400"}`}
                    >
                      {step.label}
                    </p>
                    {step.time && (
                      <span className="text-xs text-gray-400 font-medium">
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Driver Info */}
        {(status === "out_for_delivery" || status === "delivered") && (
          <div className="bg-white rounded-2xl border border-black/8 p-5 mb-3 shadow-sm">
            <h2 className="text-sm font-bold text-[#212121] mb-4">
              Your Driver
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-white text-lg font-bold">
                  {mockDelivery.driver.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-[#212121]">
                  {mockDelivery.driver.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <StarSolid className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-gray-400 font-medium">
                    {mockDelivery.driver.rating} ·{" "}
                    {mockDelivery.driver.deliveries} deliveries
                  </span>
                </div>
                <p className="text-[12px] text-gray-300 mt-1">
                  {mockDelivery.driver.vehicle}
                </p>
              </div>
              {status === "out_for_delivery" && (
                <a
                  href={`tel:${mockDelivery.driver.phone}`}
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
              Help {mockDelivery.driver.name.split(" ")[0]} improve with your
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

        {/* Footer */}
        <p className="text-center text-[12px] text-gray-300 py-2 pb-4">
          Powered by VECTOR ·{" "}
          <a href="/" className="text-emerald-600 no-underline hover:underline">
            Learn more
          </a>
        </p>
      </div>
    </div>
  );
}
