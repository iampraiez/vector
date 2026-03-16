import { create } from "zustand";
import { api } from "../lib/api";
import { AxiosError } from "axios";

export interface Order {
  id: string;
  external_id: string | null;
  customer_name: string;
  customer_phone: string;
  address: string;
  lat: number;
  lng: number;
  time_window_start: string | null;
  time_window_end: string | null;
  service_time_min: number;
  status: string;
  route_id: string | null;
  driver_id: string | null;
  driver_name?: string;
  route_name?: string;
}

interface OrderStats {
  total: number;
  unassigned: number;
  assigned: number;
  in_progress: number;
  completed: number;
  failed: number;
}

interface OrderState {
  orders: Order[];
  stats: OrderStats | null;
  totalOrders: number;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchOrders: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => Promise<void>;
  createOrder: (data: Partial<Order>) => Promise<void>;
  updateOrder: (id: string, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  importBulkOrders: (data: Partial<Order>[]) => Promise<unknown>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  stats: null,
  totalOrders: 0,
  isLoading: false,
  isMutating: false,
  error: null,

  fetchOrders: async (params = { page: 1, limit: 10 }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/dashboard/orders", { params });
      set({
        orders: res.data.data,
        stats: res.data.stats,
        totalOrders: res.data.pagination.total,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  createOrder: async (data: Partial<Order>) => {
    set({ isMutating: true, error: null });
    try {
      await api.post("/dashboard/orders", data);
      await get().fetchOrders(); // Refresh list
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to create order",
        isMutating: false,
      });
      throw err;
    }
  },

  updateOrder: async (id: string, data: Partial<Order>) => {
    set({ isMutating: true, error: null });
    try {
      await api.patch(`/dashboard/orders/${id}`, data);
      await get().fetchOrders(); // Refresh list
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to update order",
        isMutating: false,
      });
      throw err;
    }
  },

  deleteOrder: async (id: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/dashboard/orders/${id}`);
      await get().fetchOrders(); // Refresh list
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to delete order",
        isMutating: false,
      });
      throw err;
    }
  },

  importBulkOrders: async (data: Partial<Order>[]) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post("/dashboard/orders/bulk", { orders: data });
      await get().fetchOrders();
      set({ isMutating: false });
      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to import orders",
        isMutating: false,
      });
      throw err;
    }
  },
}));
