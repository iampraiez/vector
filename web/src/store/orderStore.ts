import { create } from "zustand";
import { api } from "../lib/api";
import { AxiosError } from "axios";

export type OrderStatus =
  | "unassigned"
  | "assigned"
  | "in_progress"
  | "completed"
  | "failed";

export interface Order {
  id: string;
  external_id: string | null;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
  time_window_start: string | null;
  time_window_end: string | null;
  delivery_date: string | null;
  packages: number;
  service_time_min?: number;
  priority?: "normal" | "high";
  status: OrderStatus;
  route_id: string | null;
  driver_id: string | null;
  driver_name?: string;
  assigned_to?: string;
  notes?: string;
  photo_url?: string | null;
  route_name?: string;
  /** Present when loaded from GET /dashboard/orders/:id (Prisma include). */
  route?: {
    name?: string | null;
    stops?: {
      id: string;
      sequence?: number;
      customer_name?: string;
      tracking_token?: string;
    }[];
  };
  created_at?: string;
  /** Customer tracking page token (Stop row). */
  tracking_token?: string;
  driver?: {
    id: string;
    user: {
      full_name: string;
      email: string;
      phone?: string;
      avatar_url?: string;
    };
  };
}

interface OrderStats {
  total: number;
  unassigned: number;
  assigned: number;
  in_progress: number;
  completed: number;
  failed: number;
}

export interface BulkImportResponse {
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
}

interface OrderState {
  orders: Order[];
  stats: OrderStats | null;
  totalOrders: number;
  selectedOrder: Order | null;
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
  reassignOrder: (id: string, data: { driver_id?: string }) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  deleteOrders: (ids: string[]) => Promise<void>;
  importBulkOrders: (data: Partial<Order>[]) => Promise<BulkImportResponse>;
  fetchOrderDetail: (id: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  stats: null,
  totalOrders: 0,
  selectedOrder: null,
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

  reassignOrder: async (id: string, data: { driver_id?: string }) => {
    set({ isMutating: true, error: null });
    try {
      await api.patch(`/dashboard/orders/${id}/reassign`, data);
      await get().fetchOrders(); // Refresh list
      // Refresh selected order if it's the one we're viewing
      if (get().selectedOrder?.id === id) {
        await get().fetchOrderDetail(id);
      }
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to reassign order",
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

  deleteOrders: async (ids: string[]) => {
    const previousOrders = get().orders;
    const previousStats = get().stats;

    // Optimistically update UI
    set({
      orders: previousOrders.filter((o) => !ids.includes(o.id)),
      isMutating: true,
      error: null,
    });

    try {
      await Promise.all(ids.map((id) => api.delete(`/dashboard/orders/${id}`)));
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      // Rollback on error
      set({
        orders: previousOrders,
        stats: previousStats,
        error: error.response?.data?.message || "Failed to delete orders",
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
      const error = err as AxiosError<{
        message?: string;
        errors?: { reason: string }[];
      }>;
      let errorMessage =
        error.response?.data?.message || "Failed to import orders";

      // If backend returns row-specific errors, append them
      if (error.response?.data?.errors?.length) {
        const topErrors = error.response.data.errors
          .slice(0, 3)
          .map((e) => e.reason)
          .join(", ");
        errorMessage += `: ${topErrors}${error.response.data.errors.length > 3 ? "..." : ""}`;
      }

      set({
        error: errorMessage,
        isMutating: false,
      });
      throw err;
    }
  },

  fetchOrderDetail: async (id: string) => {
    set({ isLoading: true, error: null, selectedOrder: null });
    try {
      const res = await api.get(`/dashboard/orders/${id}`);
      const raw = res.data as Order & { route?: { name?: string | null } };
      set({
        selectedOrder: {
          ...raw,
          route_name: raw.route_name ?? raw.route?.name ?? undefined,
        },
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        selectedOrder: null,
        error: error.response?.data?.message || "Failed to fetch order details",
        isLoading: false,
      });
    }
  },
}));
