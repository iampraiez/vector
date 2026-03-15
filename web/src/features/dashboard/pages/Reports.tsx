import React, { useState } from "react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  BanknotesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

const deliveryData = [
  { day: "Mon", deliveries: 48, onTime: 45 },
  { day: "Tue", deliveries: 55, onTime: 52 },
  { day: "Wed", deliveries: 62, onTime: 58 },
  { day: "Thu", deliveries: 71, onTime: 69 },
  { day: "Fri", deliveries: 66, onTime: 62 },
  { day: "Sat", deliveries: 58, onTime: 56 },
  { day: "Sun", deliveries: 43, onTime: 41 },
];

const monthlyData = [
  { month: "Oct", deliveries: 980, revenue: 3200 },
  { month: "Nov", deliveries: 1120, revenue: 3800 },
  { month: "Dec", deliveries: 1340, revenue: 4600 },
  { month: "Jan", deliveries: 1180, revenue: 4100 },
  { month: "Feb", deliveries: 1247, revenue: 4400 },
  { month: "Mar", deliveries: 1380, revenue: 4900 },
];

const driverPerformance = [
  {
    name: "Mike Johnson",
    deliveries: 156,
    rating: 5.0,
    onTime: 98,
    color: "bg-emerald-600",
  },
  {
    name: "Alex Rivera",
    deliveries: 142,
    rating: 4.9,
    onTime: 95,
    color: "bg-emerald-500",
  },
  {
    name: "Sarah Chen",
    deliveries: 138,
    rating: 4.8,
    onTime: 93,
    color: "bg-emerald-400",
  },
  {
    name: "Emma Davis",
    deliveries: 124,
    rating: 4.7,
    onTime: 91,
    color: "bg-emerald-300",
  },
];

const pieData = [
  { name: "Completed", value: 342, color: "#059669" },
  { name: "In Progress", value: 18, color: "#10B981" },
  { name: "Failed", value: 8, color: "#EF4444" },
  { name: "Pending", value: 24, color: "#F59E0B" },
];

const PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];

const summaryRows = [
  {
    metric: "Total Distance",
    current: "1,842 km",
    previous: "1,956 km",
    change: "-5.8%",
    positive: true,
  },
  {
    metric: "Avg. Fuel Cost",
    current: "$0.46/km",
    previous: "$0.47/km",
    change: "-2.1%",
    positive: true,
  },
  {
    metric: "Deliveries Completed",
    current: "342",
    previous: "318",
    change: "+7.5%",
    positive: true,
  },
  {
    metric: "Average Stop Time",
    current: "4.2 min",
    previous: "4.8 min",
    change: "-12.5%",
    positive: true,
  },
  {
    metric: "Failed Deliveries",
    current: "8",
    previous: "14",
    change: "-42.9%",
    positive: true,
  },
  {
    metric: "Customer Rating",
    current: "4.85 ★",
    previous: "4.72 ★",
    change: "+2.7%",
    positive: true,
  },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number | string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-black/8 rounded-xl p-3 shadow-xl ring-1 ring-black/5">
        <p className="text-[12px] font-bold text-gray-900 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <p className="text-[11px] text-gray-500 font-medium">
                {entry.name}:{" "}
                <span className="text-gray-900 font-bold">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardReports() {
  const [activePeriod, setActivePeriod] = useState("Last 7 days");

  const kpis = [
    {
      label: "Total Deliveries",
      value: "1,247",
      change: "+12.5%",
      trend: "up",
      icon: TruckIcon,
    },
    {
      label: "On-Time Rate",
      value: "94.2%",
      change: "+3.1%",
      trend: "up",
      icon: ClockIcon,
    },
    {
      label: "Avg. Delivery Time",
      value: "38 min",
      change: "-8.2%",
      trend: "up",
      icon: MapPinIcon,
    },
    {
      label: "Distance Saved",
      value: "342 km",
      change: "+15.7%",
      trend: "up",
      icon: BanknotesIcon,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-350 mx-auto">
      {/* Header Section */}
      <div className="flex flex-wrap items-start justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-[14px] text-gray-500">
            Performance insights across your fleet operations
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {/* Range Selector */}
          <div className="flex bg-gray-100/80 p-1 rounded-xl border border-black/5 overflow-x-auto scrollbar-hide">
            {PERIODS.slice(0, 3).map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activePeriod === p
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {p.replace("Last ", "")}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 rounded-xl text-[13px] font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all cursor-pointer">
            <ArrowDownTrayIcon className="w-4.5 h-4.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Section: Large Area Chart */}
      <div className="bg-white border border-black/8 rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Deliveries Performance
            </h2>
            <p className="text-[13px] text-gray-500">
              Total vs On-time comparison this period
            </p>
          </div>
          <div className="flex gap-6">
            <LegendItem color="#059669" label="Total" />
            <LegendItem color="#34D399" label="On-Time" />
          </div>
        </div>
        <div className="h-75 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={deliveryData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#9ca3af" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#9ca3af" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="deliveries"
                name="Total"
                stroke="#059669"
                strokeWidth={3}
                fill="url(#chartGradient)"
              />
              <Area
                type="monotone"
                dataKey="onTime"
                name="On-Time"
                stroke="#34D399"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Smaller Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Monthly Volume Bar Chart */}
        <div className="bg-white border border-black/8 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">
            Fleet Volume
          </h3>
          <p className="text-[12px] text-gray-400 mb-8">
            Packages processed by month
          </p>
          <div className="h-50">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="#f9fafb" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar
                  dataKey="deliveries"
                  name="Deliveries"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status Breakdown */}
        <div className="bg-white border border-black/8 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">
            Status Allocation
          </h3>
          <p className="text-[12px] text-gray-400 mb-8">
            Current task distribution
          </p>
          <div className="flex items-center gap-6">
            <div className="w-1/2 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-3">
              {pieData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[11px] font-bold text-gray-500">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Driver Leaderboard */}
        <div className="bg-white border border-black/8 rounded-3xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">
            Top Performers
          </h3>
          <p className="text-[12px] text-gray-400 mb-8">
            Based on completion & rating
          </p>
          <div className="space-y-6">
            {driverPerformance.map((driver) => (
              <div key={driver.name}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${driver.color} flex items-center justify-center text-white text-[10px] font-extrabold shadow-sm`}
                    >
                      {driver.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 leading-none">
                        {driver.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <StarIcon className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-gray-400">
                          {driver.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-gray-900">
                    {driver.deliveries}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${driver.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${(driver.deliveries / 160) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Efficiency Table */}
      <div className="bg-white border border-black/8 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              Route Efficiency Summary
            </h2>
            <p className="text-[12px] text-gray-400">
              Core metrics vs previous evaluation period
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-black/5">
            <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              Comparative Analysis
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr>
                {[
                  "Efficiency Metric",
                  "Current period",
                  "Prior period",
                  "Optimization Trend",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaryRows.map((row, i) => (
                <tr
                  key={i}
                  className="group hover:bg-gray-50/20 transition-colors"
                >
                  <td className="px-8 py-5 text-[14px] font-bold text-gray-900">
                    {row.metric}
                  </td>
                  <td className="px-8 py-5 text-[14px] font-bold text-gray-800">
                    {row.current}
                  </td>
                  <td className="px-8 py-5 text-[14px] text-gray-400 font-medium">
                    {row.previous}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-[13px]">
                      <ArrowTrendingUpIcon className="w-4 h-4" />
                      <span>{row.change}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
}) {
  return (
    <div className="group bg-white border border-black/8 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 hover:border-emerald-600/20">
      <div className="flex items-center justify-between mb-6">
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center transition-colors group-hover:bg-emerald-600">
          <Icon className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
          <ArrowTrendingUpIcon className="w-3 h-3" />
          <span className="text-[11px] font-bold">{change}</span>
        </div>
      </div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[12px] font-bold text-gray-500">{label}</span>
    </div>
  );
}
