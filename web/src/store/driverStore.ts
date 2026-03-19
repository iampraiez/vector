import { create } from "zustand";
import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  status: string;
  vehicle_type: string | null;
  vehicle_plate: string | null;
  current_location_name: string | null;
  total_deliveries: number;
  avg_rating: number;
  location_lat: number | null;
  location_lng: number | null;
  current_route_id: string | null;
  last_active_at: string | null;
  joined_at: string | null;
}

export interface RecentRoute {
  id: string;
  name: string;
  date: string;
  start_location_name: string | null;
  total_stops: number;
  completed_at: string | null;
  status: string;
}

interface DriverState {
  drivers: Driver[];
  selectedDriver: Driver | null;
  recentRoutes: RecentRoute[];
  totalDrivers: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchDrivers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;
  fetchDriverDetail: (id: string) => Promise<void>;
  inviteDriver: (data: Partial<Driver>) => Promise<unknown>;
  updateDriver: (id: string, data: Partial<Driver>) => Promise<void>;
  deleteDriver: (id: string) => Promise<void>;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  drivers: [],
  selectedDriver: null,
  recentRoutes: [],
  totalDrivers: 0,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchDrivers: async (params = { page: 1, limit: 10 }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/dashboard/drivers", { params });
      set({
        drivers: res.data.data,
        totalDrivers: res.data.pagination.total,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch drivers",
        isLoading: false,
      });
    }
  },

  fetchDriverDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/dashboard/drivers/${id}`);
      set({
        selectedDriver: res.data.driver,
        recentRoutes: res.data.recent_routes,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error:
          error.response?.data?.message || "Failed to fetch driver details",
        isLoading: false,
      });
    }
  },

  inviteDriver: async (data: Partial<Driver>) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post("/dashboard/drivers/invite", data);
      await get().fetchDrivers(); // Refresh list after invite
      set({ isMutating: false });
      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to invite driver",
        isMutating: false,
      });
      throw err;
    }
  },

  updateDriver: async (id: string, data: Partial<Driver>) => {
    set({ isMutating: true, error: null });
    try {
      await api.patch(`/dashboard/drivers/${id}`, data);
      await get().fetchDrivers(); // Refresh list
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to update driver",
        isMutating: false,
      });
      throw err;
    }
  },

  deleteDriver: async (id: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/dashboard/drivers/${id}`);
      await get().fetchDrivers(); // Refresh list
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to delete driver",
        isMutating: false,
      });
      throw err;
    }
  },
}));
