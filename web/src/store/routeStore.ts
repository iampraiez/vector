import { create } from "zustand";
import { api } from "../lib/api";
import { AxiosError } from "axios";
import { ReactNode } from "react";

export interface RouteStop {
  customerName: string;
  address: ReactNode;
  id: string;
  order_id: string;
  sequence: number;
  lat: number | null;
  lng: number | null;
  status: string;
}

export interface Route {
  id: string;
  name: string;
  driver_id: string | null;
  status: string;
  date: string;
  total_stops: number;
  completed_stops: number;
  total_distance_km: number;
  estimated_duration_min: number;
  stops?: RouteStop[];
  driver?: unknown;
}

interface RouteState {
  routes: Route[];
  selectedRoute: Route | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchRoutes: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;
  fetchRouteDetail: (id: string) => Promise<void>;
  createRoute: (data: Partial<Route>) => Promise<void>;
  updateRoute: (id: string, data: Partial<Route>) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  optimizeRoute: (id: string) => Promise<unknown>;
  assignRoute: (id: string, driverId: string) => Promise<void>;
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routes: [],
  selectedRoute: null,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchRoutes: async (params = { page: 1, limit: 10 }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/routes", { params });
      set({ routes: res.data.data, isLoading: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch routes",
        isLoading: false,
      });
    }
  },

  fetchRouteDetail: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/routes/${id}`);
      set({ selectedRoute: res.data.route, isLoading: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch route detail",
        isLoading: false,
      });
    }
  },

  createRoute: async (data: Partial<Route>) => {
    set({ isMutating: true, error: null });
    try {
      await api.post("/routes", data);
      await get().fetchRoutes();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to create route",
        isMutating: false,
      });
      throw err;
    }
  },

  updateRoute: async (id: string, data: Partial<Route>) => {
    set({ isMutating: true, error: null });
    try {
      await api.patch(`/routes/${id}`, data);
      await get().fetchRoutes();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to update route",
        isMutating: false,
      });
      throw err;
    }
  },

  deleteRoute: async (id: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/routes/${id}`);
      await get().fetchRoutes();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to delete route",
        isMutating: false,
      });
      throw err;
    }
  },

  optimizeRoute: async (id: string) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post(`/routes/${id}/optimize`);
      await get().fetchRouteDetail(id); // Reload updated route stops
      set({ isMutating: false });
      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to optimize route",
        isMutating: false,
      });
      throw err;
    }
  },

  assignRoute: async (id: string, driverId: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.post(`/routes/${id}/assign`, { driver_id: driverId });
      await get().fetchRoutes();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to assign route",
        isMutating: false,
      });
      throw err;
    }
  },
}));
