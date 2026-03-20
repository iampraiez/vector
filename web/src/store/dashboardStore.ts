import { create } from "zustand";
import { api } from "../lib/api";
import { AxiosError } from "axios";

interface DashboardMetrics {
  active_drivers: number;
  active_drivers_change: string;
  pending_orders: number;
  pending_orders_change: string;
  on_time_rate: number | null;
  on_time_rate_change: string;
  fuel_saved_usd: number;
  fuel_saved_change: string;
}

interface ActiveDriver {
  id: string;
  name: string;
  status: string;
  current_location_name: string | null;
  current_lat: number | null;
  current_lng: number | null;
  avatar_url: string | null;
}

interface RecentOrder {
  id: string;
  external_id: string | null;
  customer_name: string;
  address: string;
  delivery_date: string;
  status: string;
  created_at: string;
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  activeDrivers: ActiveDriver[];
  recentOrders: RecentOrder[];
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  activeDrivers: [],
  recentOrders: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [metricsRes, driversRes, ordersRes] = await Promise.all([
        api.get("/dashboard/metrics"),
        api.get("/dashboard/drivers/active"),
        api.get("/dashboard/orders/recent"),
      ]);

      set({
        metrics: metricsRes.data,
        activeDrivers: driversRes.data.drivers,
        recentOrders: ordersRes.data.orders,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error:
          error.response?.data?.message || "Failed to fetch dashboard data",
        isLoading: false,
      });
    }
  },
}));
