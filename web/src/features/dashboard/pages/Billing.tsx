import { useState, useEffect } from "react";
import {
  useSettingsStore,
  SubscriptionPlan,
} from "../../../store/settingsStore";
import { useDriverStore } from "../../../store/driverStore";

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "../../../components/ui/skeleton";
import { toast } from "sonner";
import { api } from "../../../lib/api";

function formatMoneyCents(cents: number, currency: string) {
  const amount = cents / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "NGN",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

const plans = [
  {
    id: "free",
    name: "Free",
    priceMonthly: "₦0",
    priceYearly: "₦0",
    numMonthly: 0,
    numAnnual: 0,
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
    priceMonthly: "₦20,000",
    priceYearly: "₦15,000",
    numMonthly: 20000,
    numAnnual: 180000,
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
    priceMonthly: "₦50,000",
    priceYearly: "₦40,000",
    numMonthly: 50000,
    numAnnual: 480000,
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
  const {
    billing,
    invoices,
    fetchBillingInfo,
    fetchInvoices,
    changePlan,
    cancelPlan,
    isLoading,
    isMutating,
  } = useSettingsStore();
  const { drivers, fetchDrivers } = useDriverStore();

  useEffect(() => {
    void fetchBillingInfo();
    void fetchInvoices();
    void fetchDrivers();
  }, [fetchBillingInfo, fetchInvoices, fetchDrivers]);

  const isTrial = billing?.status === "trialing";
  const [showChangePlan, setShowChangePlan] = useState(isTrial);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">(
    "monthly",
  );

  const activePlanId = billing?.plan?.id || "free";
  const activePlanSeats =
    activePlanId === "free" ? 2 : activePlanId === "starter" ? 5 : 20;
  const activeDriverCount = drivers.filter((d) => d.status === "active").length;
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

  // Usage items from backend and live data
  const usageItems = [
    {
      label: "Drivers",
      used: activeDriverCount,
      total: activePlanSeats,
      color: "bg-emerald-500",
    },
    {
      label: "Orders",
      used: billing?.total_deliveries_this_month || 0,
      total: billing?.plan?.monthly_delivery_limit || 100,
      color: "bg-emerald-400",
    },
  ];

  const isLoadingInitial = isLoading && !billing;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 font-inter">
        <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
          Billing & Subscription
        </h1>
        <p className="text-[13px] text-gray-500">
          Manage your plan, payment methods, and invoices
        </p>
      </div>

      {billing?.cancel_at_period_end && billing.current_period_end && (
        <div className="mb-8 rounded-2xl border border-amber-200/60 bg-linear-to-r from-amber-50/80 to-orange-50/50 px-5 py-4 text-[13px] text-amber-900 shadow-sm shadow-amber-500/5 backdrop-blur-sm">
          <p className="font-semibold flex items-center gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-amber-600" />
            Subscription ending
          </p>
          <p className="mt-2 text-amber-800/90 font-medium">
            Your plan will cancel on{" "}
            <span className="font-bold text-amber-900">
              {new Date(billing.current_period_end).toLocaleDateString()}
            </span>
            . You can change to a new plan anytime before then.
          </p>
        </div>
      )}

      {/* Top Section: Plan + Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
        {/* Current Plan Card */}
        <div className="lg:col-span-8 bg-linear-to-br from-white to-gray-50/50 border border-black/6 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-lg shadow-black/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/4 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
            <div className="flex-1 min-w-60">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  {isTrial ? "Free Trial" : "Active Plan"}
                </span>
              </div>
              <h2 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-2 tracking-tight">
                {isLoadingInitial ? (
                  <Skeleton className="w-48 h-8" />
                ) : (
                  billing?.plan?.name || "Standard Plan"
                )}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[13px]">
                {isLoadingInitial ? (
                  <Skeleton className="w-64 h-4" />
                ) : (
                  <>
                    <p className="flex items-center gap-1.5 font-normal">
                      Next billing:{" "}
                      <span className="text-gray-700 font-semibold whitespace-nowrap">
                        {billing?.current_period_end
                          ? new Date(
                              billing.current_period_end,
                            ).toLocaleDateString()
                          : "-"}
                      </span>
                    </p>
                    {isTrial && (
                      <>
                        <div className="w-1 h-1 rounded-full bg-gray-200" />
                        <p className="flex items-center gap-1.5 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          Ends in {trialDaysLeft} days
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4">
              <div>
                <div className="flex items-baseline gap-1">
                  {isLoadingInitial ? (
                    <Skeleton className="w-24 h-10" />
                  ) : (
                    <>
                      <span className="text-3xl md:text-4xl font-semibold text-gray-800 tracking-tighter">
                        {activePlanId === "starter"
                          ? "₦20k"
                          : activePlanId === "growth"
                            ? "₦50k"
                            : "₦0"}
                      </span>
                      <span className="text-gray-400 font-semibold tracking-tight text-[13px]">
                        /mo
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-1 text-center md:text-right">
                  Billed monthly
                </p>
              </div>
              {!isTrial && (
                <button
                  onClick={() => setShowChangePlan(!showChangePlan)}
                  disabled={isLoadingInitial}
                  className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 text-white font-bold text-[13px] rounded-lg shadow-xl shadow-emerald-600/10 transition-all hover:bg-emerald-700 hover:-translate-y-0.5 active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {showChangePlan ? "Hide Plans" : "Change Plan"}
                  <ChevronRightIcon
                    className={`w-4 h-4 transition-transform duration-300 ${showChangePlan ? "rotate-90" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Usage Card - More Compact */}
        <div className="lg:col-span-4 bg-linear-to-br from-white to-gray-50/50 border border-black/6 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg shadow-black/5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
              Usage
            </h2>
            <DocumentTextIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-6">
            {usageItems.map((item) => {
              const pct =
                item.total > 0 ? Math.round((item.used / item.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between items-end mb-2">
                    <p className="font-semibold text-gray-600 uppercase tracking-wider text-[11px]">
                      {item.label}
                    </p>
                    <span className="text-[13px] font-bold text-gray-900">
                      {item.used} / {item.total}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toggled Plan Grid */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${showChangePlan ? "max-h-500 mb-12 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex justify-center mb-8 mt-2">
          <div className="inline-flex rounded-full bg-white border border-black/10 p-1 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${billingPeriod === "monthly" ? "bg-emerald-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${billingPeriod === "annual" ? "bg-emerald-600 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
            >
              Yearly{" "}
              <span className="text-[10px] opacity-70">(save up to 25%)</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {dynamicPlans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative bg-linear-to-br rounded-3xl p-8 transition-all hover:shadow-2xl hover:-translate-y-1.5 text-center overflow-hidden ${
                plan.current
                  ? "from-white to-emerald-50/40 border-2 border-emerald-500/30 shadow-xl shadow-emerald-600/10"
                  : plan.highlight
                    ? "from-white to-amber-50/30 border-2 border-amber-400/40 shadow-lg shadow-amber-500/5"
                    : "from-white to-gray-50/40 border border-black/6 shadow-md shadow-black/3"
              }`}
            >
              {plan.current && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-emerald-600 text-white text-[10px] font-semibold rounded-full tracking-widest uppercase">
                  Current
                </div>
              )}
              {plan.highlight && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-amber-400 text-white text-[10px] font-semibold rounded-full tracking-widest uppercase flex items-center gap-1 group-hover:scale-110 transition-transform">
                  <SparklesIcon className="w-3 h-3" />
                  Popular
                </div>
              )}

              <h3 className="text-gray-400 font-medium text-[11px] uppercase tracking-widest mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline justify-center gap-1 mb-4">
                <span className="text-3xl font-semibold text-gray-800">
                  {billingPeriod === "monthly"
                    ? plan.priceMonthly
                    : plan.priceYearly}
                </span>
                <span className="text-gray-400 font-medium tracking-wider text-[13px]">
                  {billingPeriod === "monthly"
                    ? "/mo"
                    : "/mo if billed annually"}
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

              {plan.current ? (
                <button
                  onClick={async () => {
                    if (!isTrial) return;
                    setLoadingPlan(plan.id);
                    try {
                      const currentPlanObj = plans.find(
                        (p) => p.id === activePlanId,
                      );
                      const expectedAmount =
                        billingPeriod === "monthly"
                          ? currentPlanObj?.numMonthly
                          : currentPlanObj?.numAnnual;

                      const res = await api.post<{ checkout_url?: string }>(
                        "/dashboard/billing/plan",
                        {
                          plan_id: activePlanId,
                          billing_cycle: billingPeriod,
                          expected_amount_ngn: expectedAmount,
                        },
                      );
                      if (res.data.checkout_url) {
                        window.location.href = res.data.checkout_url;
                      }
                    } catch {
                      toast.error("Checkout failed.");
                    } finally {
                      setLoadingPlan(null);
                    }
                  }}
                  disabled={!isTrial || !!loadingPlan}
                  className={`w-full py-4 rounded-2xl text-[14px] font-semibold transition-all flex items-center justify-center gap-2 border border-black/5 cursor-pointer disabled:opacity-70 ${isTrial ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/10" : "bg-gray-50 text-gray-400 cursor-default"}`}
                >
                  {loadingPlan === plan.id ? (
                    <div className="w-5 h-5 border-2 rounded-full animate-spin border-white/30 border-t-white" />
                  ) : isTrial ? (
                    "Pay Now"
                  ) : (
                    "Current Plan"
                  )}
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const planSeats =
                      plan.id === "free" ? 2 : plan.id === "starter" ? 5 : 20;

                    if (!isTrial && activePlanId !== "free") {
                      toast.error(
                        "Subscriptions cannot be changed until the current period ends.",
                      );
                      return;
                    }

                    if (planSeats < activePlanSeats) {
                      let msg = `Are you sure you want to downgrade to ${plan.name}? No pro-rated refunds are provided.`;
                      if (activeDriverCount > planSeats) {
                        const excess = activeDriverCount - planSeats;
                        msg += `\n\nWARNING: This will automatically DEACTIVATE ${excess} of your active drivers because the ${plan.name} plan only allows ${planSeats} drivers.`;
                      }
                      if (!confirm(msg)) return;
                    }
                    setLoadingPlan(plan.id);
                    try {
                      const expectedAmount =
                        billingPeriod === "monthly"
                          ? plan.numMonthly
                          : plan.numAnnual;

                      const result = await changePlan(
                        plan.id as SubscriptionPlan,
                        billingPeriod,
                        expectedAmount,
                      );
                      if (result?.checkout_url) {
                        window.location.href = result.checkout_url;
                        return;
                      }
                      toast.success("Plan updated.");
                      if (!isTrial) setShowChangePlan(false);
                    } catch {
                      toast.error("Failed to change plan.");
                    } finally {
                      setLoadingPlan(null);
                    }
                  }}
                  disabled={!!loadingPlan}
                  className="w-full py-4 rounded-2xl text-[14px] font-semibold transition-all flex items-center justify-center gap-2 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-black/5 cursor-pointer disabled:opacity-70"
                >
                  {loadingPlan === plan.id ? (
                    <div className="w-5 h-5 border-2 rounded-full animate-spin border-emerald-600/30 border-t-emerald-600" />
                  ) : (
                    "Switch to this Plan"
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-linear-to-br from-white to-gray-50/50 border border-black/6 rounded-3xl p-7 md:p-8 mb-10 shadow-lg shadow-black/5">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
            Invoices
          </h2>
          <div className="w-10 h-10 bg-blue-100/60 rounded-xl flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        {invoices.length === 0 ? (
          <p className="text-[13px] text-gray-400 mb-1">
            No invoices yet. When you subscribe or pay through Paystack,
            invoices will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-black/5 bg-gray-50/80">
                  <th className="px-4 py-3 font-semibold text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-500 text-right">
                    PDF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-3 text-gray-800 whitespace-nowrap">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">
                      {formatMoneyCents(inv.amount_cents, inv.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {inv.invoice_pdf_url ? (
                        <a
                          href={inv.invoice_pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-emerald-600 hover:text-emerald-700"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-12 text-center pb-8 border-t border-gray-100 pt-8">
        <button
          type="button"
          disabled={
            isMutating ||
            isLoadingInitial ||
            Boolean(billing?.cancel_at_period_end)
          }
          onClick={async () => {
            if (
              !confirm(
                "Cancel your subscription at the end of the current billing period? You can keep using Vector until then.",
              )
            )
              return;
            try {
              await cancelPlan();
              toast.success(
                "Your plan will cancel at the end of the billing period.",
              );
            } catch {
              toast.error("Could not cancel subscription.");
            }
          }}
          className="text-[12px] font-medium text-gray-400 uppercase tracking-[2px] hover:text-red-500 transition-colors cursor-pointer group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Cancel Fleet Subscription & Services
          <div className="h-0.5 w-0 group-hover:w-full bg-red-400 transition-all duration-300 mx-auto mt-1" />
        </button>
      </div>
    </div>
  );
}
