import { create } from "zustand";
import { api } from "../lib/api";
import { AxiosError } from "axios";

export type SubscriptionPlan = "free" | "starter" | "growth";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export interface CompanyInfo {
  name: string;
  contact_email: string;
  phone: string;
  city: string;
  state: string;
  timezone: string;
  company_code?: string;
  created_at?: string;
}

export interface NotificationsConfig {
  email: boolean;
  sms: boolean;
  push: boolean;
  driverAlerts: boolean;
  deliveryUpdates: boolean;
  paymentAlerts: boolean;
  weeklyReport: boolean;
}

interface BillingInfo {
  status: string;
  plan: {
    id: SubscriptionPlan;
    name: string;
    price_usd: number;
  };
  subscription_id?: string;
  current_period_start?: string;
  current_period_end: string;
  cancel_at_period_end?: boolean;
}

export interface BillingInvoice {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description?: string | null;
  period_start: string;
  period_end: string;
  invoice_pdf_url?: string | null;
  paid_at?: string | null;
  created_at: string;
}

interface SettingsState {
  company: CompanyInfo | null;
  notifications: NotificationsConfig | null;
  apiKeys: ApiKey[];
  billing: BillingInfo | null;
  invoices: BillingInvoice[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateCompany: (data: Partial<CompanyInfo>) => Promise<void>;
  updateNotifications: (data: Partial<NotificationsConfig>) => Promise<void>;
  regenerateAccessCode: () => Promise<void>;

  createApiKey: (name: string) => Promise<unknown>;
  revokeApiKey: (id: string) => Promise<void>;

  requestOtp: (action: string) => Promise<void>;
  verifyOtp: (action: string, otp: string) => Promise<void>;

  // Billing
  fetchBillingInfo: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  changePlan: (planId: SubscriptionPlan) => Promise<{
    checkout_url?: string | null;
    message?: string;
    plan_id?: string;
  }>;
  cancelPlan: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  company: null,
  notifications: null,
  apiKeys: [],
  billing: null,
  invoices: [],
  isLoading: false,
  isMutating: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/dashboard/settings");
      set({
        company: res.data.company,
        notifications: res.data.notifications || {
          email: true,
          sms: false,
          push: true,
          driverAlerts: true,
          deliveryUpdates: true,
          paymentAlerts: false,
          weeklyReport: true,
        },
        apiKeys: res.data.company?.api_keys || [],
        billing: res.data.billing || null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch settings",
        isLoading: false,
      });
    }
  },

  updateCompany: async (data: Partial<CompanyInfo>) => {
    set({ isMutating: true, error: null });
    try {
      await api.patch("/dashboard/settings/company", data);
      await get().fetchSettings();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error:
          error.response?.data?.message || "Failed to update company settings",
        isMutating: false,
      });
      throw err;
    }
  },

  updateNotifications: async (data: Partial<NotificationsConfig>) => {
    const original = get().notifications;
    set({
      notifications: original ? { ...original, ...data } : null,
      isMutating: true,
      error: null,
    });

    try {
      await api.patch("/dashboard/settings/notifications", data);
      await get().fetchSettings();
      set({ isMutating: false });
    } catch (err: unknown) {
      set({ notifications: original, isMutating: false });
      const error = err as AxiosError<{ message?: string }>;
      set({
        error:
          error.response?.data?.message || "Failed to update notifications",
      });
      throw err;
    }
  },

  regenerateAccessCode: async () => {
    set({ isMutating: true, error: null });
    try {
      await api.post("/dashboard/settings/regenerate-code");
      await get().fetchSettings();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error:
          error.response?.data?.message || "Failed to regenerate access code",
        isMutating: false,
      });
      throw err;
    }
  },

  createApiKey: async (name: string) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post("/dashboard/settings/api-keys", { name });
      await get().fetchSettings();
      set({ isMutating: false });
      return res.data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to create API key",
        isMutating: false,
      });
      throw err;
    }
  },

  revokeApiKey: async (id: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.delete(`/dashboard/settings/api-keys/${id}`);
      await get().fetchSettings();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to revoke API key",
        isMutating: false,
      });
      throw err;
    }
  },

  requestOtp: async (action: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.post("/dashboard/settings/otp/request", { action });
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to request OTP",
        isMutating: false,
      });
      throw err;
    }
  },

  verifyOtp: async (action: string, otp: string) => {
    set({ isMutating: true, error: null });
    try {
      await api.post("/dashboard/settings/otp/verify", { action, otp });
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to verify OTP",
        isMutating: false,
      });
      throw err;
    }
  },

  fetchBillingInfo: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get("/dashboard/billing");
      set({ billing: res.data, isLoading: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch billing info",
        isLoading: false,
      });
    }
  },

  fetchInvoices: async () => {
    try {
      const res = await api.get<{ invoices: BillingInvoice[] }>(
        "/dashboard/billing/invoices",
      );
      set({ invoices: res.data.invoices ?? [] });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to fetch invoices",
      });
    }
  },

  changePlan: async (planId: SubscriptionPlan) => {
    set({ isMutating: true, error: null });
    try {
      const res = await api.post<{
        checkout_url?: string | null;
        message?: string;
        plan_id?: string;
      }>("/dashboard/billing/plan", {
        plan_id: planId,
      });
      const data = res.data;
      if (data.checkout_url) {
        set({ isMutating: false });
        return data;
      }
      await get().fetchBillingInfo();
      set({ isMutating: false });
      return data;
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to change plan",
        isMutating: false,
      });
      throw err;
    }
  },

  cancelPlan: async () => {
    set({ isMutating: true, error: null });
    try {
      await api.delete("/dashboard/billing/cancel");
      await get().fetchBillingInfo();
      set({ isMutating: false });
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      set({
        error: error.response?.data?.message || "Failed to cancel plan",
        isMutating: false,
      });
      throw err;
    }
  },
}));
