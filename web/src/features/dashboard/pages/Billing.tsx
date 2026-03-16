import { useState } from "react";

import {
  CreditCardIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowUpRightIcon,
  SparklesIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const invoices = [
  {
    date: "Mar 1, 2026",
    description: "Fleet Professional — Monthly",
    amount: "$49.00",
    status: "paid",
    pdf: "#",
  },
  {
    date: "Feb 1, 2026",
    description: "Fleet Professional — Monthly",
    amount: "$49.00",
    status: "paid",
    pdf: "#",
  },
  {
    date: "Jan 1, 2026",
    description: "Fleet Professional — Monthly",
    amount: "$49.00",
    status: "paid",
    pdf: "#",
  },
  {
    date: "Dec 1, 2025",
    description: "Fleet Professional — Monthly",
    amount: "$49.00",
    status: "paid",
    pdf: "#",
  },
];

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
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const usageItems = [
    { label: "Active Drivers", used: 12, total: 25, color: "bg-emerald-500" },
    {
      label: "Deliveries This Month",
      used: 342,
      total: 999,
      color: "bg-emerald-400",
    },
    { label: "API Calls", used: 8200, total: 50000, color: "bg-amber-500" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-300 mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
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
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                Active Plan
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Fleet Professional
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-[13px]">
              <p className="flex items-center gap-1.5 font-medium">
                Next billing:{" "}
                <span className="font-bold text-gray-900">April 1, 2026</span>
              </p>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <p className="flex items-center gap-1.5 font-medium">
                Credit:{" "}
                <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-md">
                  $0.00
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tighter">
                  $49
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
        className={`overflow-hidden transition-all duration-500 ease-in-out ${showChangePlan ? "max-h-500 mb-12 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {plans.map((plan) => (
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
                <span className="text-3xl font-bold text-gray-900">
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
                  onClick={() => {
                    const planId = plan.id;
                    setLoadingPlan(planId);
                    setTimeout(() => setLoadingPlan(null), 1500);
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
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Payment Method
            </h2>
            <button className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:underline cursor-pointer">
              Manage All
            </button>
          </div>

          <div className="group bg-gray-50/50 border border-black/5 rounded-xl p-5 flex items-center justify-between transition-all hover:bg-white hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-600/5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-600/20 transition-transform group-hover:scale-105">
                <CreditCardIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900 mb-0.5 tracking-tight">
                  •••• •••• •••• 4242
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Mastercard • Expires 12/27
                </p>
              </div>
            </div>
            <button className="p-2 rounded-lg border border-black/5 hover:border-emerald-600/30 hover:bg-emerald-50 transition-all group/edit cursor-pointer">
              <ArrowUpRightIcon className="w-4 h-4 text-gray-400 group-hover/edit:text-emerald-600" />
            </button>
          </div>

          <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-xl text-gray-400 font-bold text-[13px] hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/30 transition-all cursor-pointer">
            + Add New Payment Method
          </button>
        </div>

        {/* Usage Metrics */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-8">
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
                      <span className="text-[15px] font-bold text-gray-900 tracking-tight">
                        {item.used.toLocaleString()}
                      </span>
                      <span className="text-[12px] text-gray-300 font-bold mx-1">
                        /
                      </span>
                      <span className="text-[12px] text-gray-400 font-bold">
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

      {/* Invoices */}
      <div className="bg-white border border-black/5 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/30">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Recent Statements
            </h2>
            <p className="text-[12px] text-gray-400">
              Download and review your past billing records
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black/5 rounded-lg text-[12px] font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer capitalize shadow-sm">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                {[
                  "Statement Date",
                  "Description",
                  "Amount",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv, i) => (
                <tr
                  key={i}
                  className="group hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-5 text-[13px] font-bold text-gray-700">
                    {inv.date}
                  </td>
                  <td className="px-8 py-5 text-[13px] text-gray-600">
                    {inv.description}
                  </td>
                  <td className="px-8 py-5 text-[14px] font-bold text-gray-900">
                    {inv.amount}
                  </td>
                  <td className="px-8 py-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Paid
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button className="flex items-center gap-2 px-3 py-1.5 border border-black/8 rounded-xl text-[12px] font-bold text-gray-500 group-hover:bg-white group-hover:border-emerald-600/30 group-hover:text-emerald-600 transition-all cursor-pointer">
                      <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
