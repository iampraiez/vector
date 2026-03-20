import { useState, useEffect } from "react";
import {
  useSettingsStore,
  SubscriptionPlan,
} from "../../../store/settingsStore";

import {
  CreditCardIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mo",
    desc: "For small teams and starters",
    features: [
      "Up to 2 active drivers",
      "Basic tracking",
      "Standard orders",
      "Email support",
    ],
    current: false,
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    period: "/mo",
    desc: "For growing delivery operations",
    features: [
      "Up to 5 active drivers",
      "Unlimited orders",
      "Advanced analytics",
      "Priority support",
    ],
    current: true,
    highlight: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "$89",
    period: "/mo",
    desc: "For large-scale fleet operations",
    features: [
      "Up to 20 active drivers",
      "Custom branding",
      "API access",
      "SLA guarantee",
    ],
    current: false,
    highlight: true,
  },
];

export function DashboardBilling() {
  const { billing, fetchBillingInfo, changePlan, isLoading } =
    useSettingsStore();

  useEffect(() => {
    fetchBillingInfo();
  }, [fetchBillingInfo]);

  const [showChangePlan, setShowChangePlan] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (isLoading && !billing) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 font-medium">
          Loading billing information...
        </p>
      </div>
    );
  }

  const activePlanId = billing?.plan?.id || "free";
  const isTrial = billing?.status === "trialing";
  const trialDaysLeft =
    isTrial && billing?.current_period_end
      ? Math.max(
          0,
          Math.ceil(
            (new Date(billing.current_period_end).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const dynamicPlans = plans.map((p) => ({
    ...p,
    current: p.id === activePlanId,
  }));

  // In a real app, these would come from the backend or a billing store
  const usageItems = [
    { label: "Active Drivers", used: 0, total: 10, color: "bg-emerald-500" },
    {
      label: "Deliveries This Month",
      used: 0,
      total: 100,
      color: "bg-emerald-400",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-300 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-gray-800 mb-1 tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-[14px] text-gray-500">
          Manage your plan, payment methods, and invoices
        </p>
      </div>

      {/* Current Plan Section */}
      <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex-1 min-w-60">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-widest">
                Active Plan
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 tracking-tight">
              {billing?.plan?.name || "Loading..."}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[13px]">
              <p className="flex items-center gap-1.5 font-medium">
                Next billing:{" "}
                <span className="font-semibold text-gray-700">
                  {billing?.current_period_end
                    ? new Date(billing.current_period_end).toLocaleDateString()
                    : "-"}
                </span>
              </p>
              {isTrial && (
                <>
                  <div className="w-1 h-1 rounded-full bg-gray-200" />
                  <p className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    Trial Ends in {trialDaysLeft} days
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tighter">
                  ${billing?.plan?.price_usd || 0}
                </span>
                <span className="text-gray-400 font-bold tracking-tight text-[13px]">
                  /mo
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 text-center md:text-right">
                Billed monthly
              </p>
            </div>
            <button
              onClick={() => setShowChangePlan(!showChangePlan)}
              className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-[13px] rounded-lg shadow-xl shadow-emerald-600/10 transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center gap-2"
            >
              {showChangePlan ? "Hide Plans" : "Change Plan"}
              <ChevronRightIcon
                className={`w-4 h-4 transition-transform duration-300 ${showChangePlan ? "rotate-90" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Toggled Plan Grid */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${showChangePlan ? "max-h-300 mb-12 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {dynamicPlans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative bg-white border-2 rounded-3xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1 text-center ${
                plan.current
                  ? "border-emerald-600 shadow-xl shadow-emerald-600/5"
                  : plan.highlight
                    ? "border-amber-400/50 shadow-lg"
                    : "border-black/5 hover:border-emerald-200"
              }`}
            >
              {plan.current && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full tracking-widest uppercase">
                  Current
                </div>
              )}
              {plan.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-white text-[10px] font-bold rounded-full tracking-widest uppercase flex items-center gap-1 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-3 h-3" />
                  Popular
                </div>
              )}

              <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-3xl font-semibold text-gray-800">
                  {plan.price}
                </span>
                <span className="text-gray-400 font-bold tracking-wider text-[13px]">
                  {plan.period}
                </span>
              </div>
              <p className="text-[13px] text-gray-500 mb-8 min-h-10 leading-relaxed italic">
                {plan.desc}
              </p>

              <div className="space-y-4 mb-10">
                {plan.features.map((f) => (
                  <div
                    key={f}
                    className="flex items-start justify-center gap-3"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[13px] text-gray-600 font-medium">
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {!plan.current && (
                <button
                  onClick={async () => {
                    if (plan.id === "free" && activePlanId !== "free") {
                      if (
                        !confirm(
                          "Are you sure you want to downgrade to Free? No pro-rated refunds are provided.",
                        )
                      )
                        return;
                    }
                    setLoadingPlan(plan.id);
                    try {
                      await changePlan(plan.id as SubscriptionPlan);
                      setShowChangePlan(false);
                    } catch {
                      alert("Failed to change plan.");
                    } finally {
                      setLoadingPlan(null);
                    }
                  }}
                  disabled={!!loadingPlan}
                  className={`w-full py-4 rounded-2xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.id === "enterprise"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-black/5"
                  } cursor-pointer disabled:opacity-70`}
                >
                  {loadingPlan === plan.id ? (
                    <div
                      className={`w-5 h-5 border-2 rounded-full animate-spin ${
                        plan.id === "enterprise"
                          ? "border-white/30 border-t-white"
                          : "border-emerald-600/30 border-t-emerald-600"
                      }`}
                    />
                  ) : plan.id === "enterprise" ? (
                    "Upgrade to Enterprise"
                  ) : (
                    "Switch to this Plan"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Grid and Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Payment Method */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
              Payment Method
            </h2>
          </div>

          <div className="text-center py-4">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-black/5">
              <CreditCardIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-[14px] font-bold text-gray-400 mb-1">
              No payment method added
            </p>
            <p className="text-[12px] text-gray-300 mb-6">
              Connect your card to start your subscription
            </p>
            <button className="w-full py-3.5 bg-emerald-600 text-white font-bold text-[13px] rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer">
              Set up with Stripe
            </button>
          </div>
        </div>

        {/* Usage Metrics */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight mb-8">
            Capacity & Usage
          </h2>
          <div className="space-y-6">
            {usageItems.map((item) => {
              const pct = Math.round((item.used / item.total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-end mb-2.5">
                    <div>
                      <p className="text-[13px] font-bold text-gray-800 tracking-tight">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Standard quota
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[15px] font-semibold text-gray-800 tracking-tight">
                        {item.used.toLocaleString()}
                      </span>
                      <span className="text-[12px] text-gray-300 font-semibold mx-1">
                        /
                      </span>
                      <span className="text-[12px] text-gray-400 font-semibold">
                        {item.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-black/5">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      {pct}% utilized
                    </span>
                    {pct > 80 && (
                      <div className="flex items-center gap-1">
                        <ExclamationCircleIcon className="w-3 h-3 text-amber-500" />
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                          Near Limit
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-12 text-center pb-8 border-t border-gray-100 pt-8">
        <button className="text-[12px] font-bold text-gray-400 uppercase tracking-[2px] hover:text-red-500 transition-colors cursor-pointer group">
          Cancel Fleet Subscription & Services
          <div className="h-0.5 w-0 group-hover:w-full bg-red-400 transition-all duration-300 mx-auto mt-1" />
        </button>
      </div>
    </div>
  );
}
