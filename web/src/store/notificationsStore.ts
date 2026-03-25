import { create } from "zustand";
import { api } from "../lib/api";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  data?: Record<string, unknown>;
}

type SocketNotificationPayload = Record<string, unknown>;

interface NotificationsState {
  notifications: AppNotification[];
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  addNotificationToState: (n: SocketNotificationPayload) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<{ data: AppNotification[] }>(
        "/dashboard/notifications?limit=50",
      );
      set({ notifications: res.data.data ?? [], isLoading: false });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch notifications";
      set({ error: message, isLoading: false });
    }
  },

  addNotificationToState: (payload) => {
    const newNotif: AppNotification = {
      id: (payload.id as string) || crypto.randomUUID(),
      type: (payload.type as string) || "system_alert",
      title: (payload.title as string) || "New Notification",
      body: (payload.body as string) || "",
      created_at: (payload.created_at as string) || new Date().toISOString(),
      is_read: false,
      data: payload.data as Record<string, unknown> | undefined,
    };

    set((state) => ({
      notifications: [newNotif, ...state.notifications],
    }));
  },

  markAsRead: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n,
      ),
    }));
    try {
      await api.patch(`/dashboard/notifications/${id}/read`);
    } catch {
      // silently fail — optimistic update keeps the UI consistent
    }
  },

  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
    }));
    try {
      await api.post("/dashboard/notifications/read-all");
    } catch {
      // silently fail
    }
  },

  deleteNotification: async (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
    try {
      await api.delete(`/dashboard/notifications/${id}`);
    } catch {
      // silently fail
    }
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));
