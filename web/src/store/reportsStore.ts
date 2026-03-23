import { create } from "zustand";
import { api } from "../lib/api";
import { toast } from "sonner";

export interface ReportSummary {
  total_deliveries: number;
  total_distance_km: number;
  avg_delivery_time_min: number;
  success_rate: number;
  fuel_saved_usd: number;
}

export interface DailyMetric {
  date: string;
  count?: number;
  rate?: number;
}

export interface ReportCharts {
  deliveries_by_day: DailyMetric[];
  success_rate_trend: DailyMetric[];
}

export interface DriverPerformanceData {
  driver_id: string;
  name: string;
  deliveries_completed: number;
  on_time_rate: number | null;
  rating: number | null;
}

export interface DriverPerformance {
  data: DriverPerformanceData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface ReportsState {
  // Data
  summary: ReportSummary | null;
  charts: ReportCharts | null;
  driverPerformance: DriverPerformance | null;

  // Loading states
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Methods
  fetchSummary: (startDate?: string) => Promise<void>;
  fetchCharts: (startDate?: string) => Promise<void>;
  fetchDriverPerformance: (
    page?: number,
    limit?: number,
    startDate?: string,
  ) => Promise<void>;
  fetchAllData: (startDate?: string) => Promise<void>;
  clearError: () => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  summary: null,
  charts: null,
  driverPerformance: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchSummary: async (startDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);

      const res = await api.get<ReportSummary>(
        `/dashboard/reports/summary?${params.toString()}`,
      );
      set({ summary: res.data, isLoading: false });
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message || "Failed to fetch report summary";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchCharts: async (startDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);

      const res = await api.get<ReportCharts>(
        `/dashboard/reports/charts?${params.toString()}`,
      );
      set({ charts: res.data, isLoading: false });
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message || "Failed to fetch report charts";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchDriverPerformance: async (page = 1, limit = 10, startDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (startDate) params.append("start_date", startDate);

      const res = await api.get<DriverPerformance>(
        `/dashboard/reports/performance?${params.toString()}`,
      );
      set({ driverPerformance: res.data, isLoading: false });
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
          }
        ).response?.data?.message || "Failed to fetch driver performance";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  fetchAllData: async (startDate?: string) => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchSummary(startDate),
        get().fetchCharts(startDate),
        get().fetchDriverPerformance(1, 10, startDate),
      ]);
    } catch {
      const message = "Failed to fetch report data";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  clearError: () => set({ error: null }),
}));
