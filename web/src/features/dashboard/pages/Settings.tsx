import { useState, useEffect } from "react";
import {
  useSettingsStore,
  NotificationsConfig,
} from "../../../store/settingsStore";

import {
  BuildingOfficeIcon,
  BellIcon,
  TrashIcon,
  PencilIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

/* --- Shared Components --- */

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        value ? "bg-emerald-600" : "bg-gray-200"
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          value ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-black/8 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 md:px-8 md:py-6 border-b border-gray-100">
        <h2 className="text-[15px] font-bold text-gray-900 mb-0.5">{title}</h2>
        {subtitle && (
          <p className="text-[12px] text-gray-400 font-medium">{subtitle}</p>
        )}
      </div>
      <div className="px-6 py-6 md:px-8 md:py-8 space-y-6">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  subtitle,
  children,
}: {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-gray-50 last:border-0 last:pb-0 first:pt-0">
      <div>
        <p className="text-[14px] font-bold text-gray-900 mb-0.5">{label}</p>
        {subtitle && (
          <p className="text-[12px] text-gray-400 leading-normal">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
  );
}

function StaticField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-gray-50/50 border border-black/5 rounded-2xl p-5 hover:bg-white hover:border-emerald-600/20 transition-all group">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-[14px] font-bold text-gray-900 tracking-tight">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-black/5 rounded-xl px-4 py-3 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600/40 transition-all"
      />
    </div>
  );
}

/* --- Simplified Modals --- */

function SimpleConfirmModal({
  isOpen,
  onClose,
  title,
  desc,
  btnText,
  onConfirm,
  variant = "danger",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  desc: string;
  btnText: string;
  onConfirm: () => void;
  variant?: "danger" | "warning";
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13px] text-gray-500 mb-6">{desc}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-[13px] rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-3 ${variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"} text-white font-bold text-[13px] rounded-xl shadow-lg transition-all`}
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardSettings() {
  const {
    company,
    notifications,
    isLoading,
    isMutating,
    fetchSettings,
    updateCompany,
    updateNotifications,
  } = useSettingsStore();

  const [editingCompany, setEditingCompany] = useState(false);
  const [companyDraft, setCompanyDraft] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    timezone: "America/Los_Angeles",
  });

  const [isDataCleaningOpen, setIsDataCleaningOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (company) {
      // Async update to avoid cascading render warning
      Promise.resolve().then(() => {
        setCompanyDraft((prev) => {
          if (prev.name === company.name && prev.email === company.email)
            return prev;
          return company;
        });
      });
    }
  }, [company]);

  const toggle = (key: keyof NotificationsConfig) => async () => {
    if (notifications) {
      const newSettings = { ...notifications, [key]: !notifications[key] };
      await updateNotifications(newSettings);
    }
  };

  const handleSaveCompany = async () => {
    await updateCompany(companyDraft);
    setEditingCompany(false);
  };

  if (isLoading && !company) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const companyCode = "VECT-2024";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-[32px] font-black text-gray-900 mb-2 tracking-tight">
          Settings
        </h1>
        <p className="text-[13px] text-gray-500 font-medium">
          Manage your workspace profile and notification preferences
        </p>
      </div>

      {/* Driver Access Code */}
      <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
              Access Code
            </span>
          </div>
          <h3 className="text-xl font-bold text-white mb-6">Join your fleet</h3>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-mono font-black text-white tracking-[4px]">
              {companyCode}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(companyCode)}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all text-white"
            >
              <ClipboardDocumentIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button className="relative z-10 px-6 py-3 bg-emerald-600 text-white font-bold text-[12px] rounded-xl hover:bg-emerald-500 transition-all cursor-pointer">
          Refresh Code
        </button>
      </div>

      {/* Workspace Section */}
      <Section
        title="Workspace Profile"
        subtitle="Manage your company details and headquarters info"
      >
        {!editingCompany ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StaticField
              label="Operating Name"
              value={company?.name || "VECTOR Fleet Services"}
              icon={BuildingOfficeIcon}
            />
            <StaticField
              label="Operations Email"
              value={company?.email || "contact@vectorfleet.com"}
              icon={EnvelopeIcon}
            />
            <StaticField
              label="Fleet Hotline"
              value={company?.phone || "+1 (555) 000-0000"}
              icon={BellIcon}
            />
            <StaticField
              label="Region"
              value={`${company?.city || "San Francisco"}, ${company?.state || "CA"}`}
              icon={MapPinIcon}
            />
            <div className="md:col-span-2 pt-4">
              <button
                onClick={() => setEditingCompany(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-black/5 rounded-2xl text-[13px] font-bold text-gray-500 hover:bg-white hover:border-emerald-600/30 hover:text-emerald-600 transition-all cursor-pointer"
              >
                <PencilIcon className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Name"
                value={companyDraft.name}
                onChange={(v) => setCompanyDraft({ ...companyDraft, name: v })}
              />
              <InputField
                label="Email"
                value={companyDraft.email}
                onChange={(v) => setCompanyDraft({ ...companyDraft, email: v })}
              />
              <InputField
                label="Phone"
                value={companyDraft.phone}
                onChange={(v) => setCompanyDraft({ ...companyDraft, phone: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  value={companyDraft.city}
                  onChange={(v) =>
                    setCompanyDraft({ ...companyDraft, city: v })
                  }
                />
                <InputField
                  label="State"
                  value={companyDraft.state}
                  onChange={(v) =>
                    setCompanyDraft({ ...companyDraft, state: v })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-50">
              <button
                onClick={handleSaveCompany}
                disabled={isMutating}
                className="px-8 py-3 bg-emerald-600 text-white font-bold text-[13px] rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-70"
              >
                Save
              </button>
              <button
                onClick={() => setEditingCompany(false)}
                className="px-6 py-3 text-gray-400 font-bold text-[13px] hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* Notifications Section */}
      <Section
        title="Communications"
        subtitle="Manage system alerts and automated telemetry"
      >
        <div className="space-y-1">
          <SettingRow
            label="Real-time Telemetry"
            subtitle="Get instant updates when drivers go offline."
          >
            <Toggle
              value={notifications?.driverAlerts ?? true}
              onChange={toggle("driverAlerts")}
            />
          </SettingRow>
          <SettingRow
            label="Daily Email Snapshot"
            subtitle="Performance summary sent every morning."
          >
            <Toggle
              value={notifications?.email ?? true}
              onChange={toggle("email")}
            />
          </SettingRow>
          <SettingRow
            label="System Push Notifications"
            subtitle="Browser alerts for live tracking events."
          >
            <Toggle
              value={notifications?.push ?? true}
              onChange={toggle("push")}
            />
          </SettingRow>
        </div>
      </Section>

      {/* Simplified Danger Zone Section */}
      <div className="bg-red-50/30 border border-red-100 rounded-3xl p-6 md:p-8">
        <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-[13px] text-red-700/60 mb-8">
          Irreversible actions for your workspace data and access.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsDataCleaningOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-100 rounded-xl text-[12px] font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <TrashIcon className="w-4 h-4" />
            Clear Data
          </button>
          <button
            onClick={() => setIsDeleteAccountOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-[12px] font-bold hover:bg-red-700 transition-all cursor-pointer shadow-lg shadow-red-600/10"
          >
            <XMarkIcon className="w-4 h-4" />
            Delete Account
          </button>
        </div>
      </div>

      <SimpleConfirmModal
        isOpen={isDataCleaningOpen}
        onClose={() => setIsDataCleaningOpen(false)}
        title="Clear workspace data?"
        desc="This will permanently delete all logs and history. This cannot be undone."
        btnText="Clear Everything"
        onConfirm={() => {}}
      />

      <SimpleConfirmModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        title="Delete your account?"
        desc="Your workspace will be deactivated. You have 7 days to revert this action."
        btnText="Delete Account"
        onConfirm={() => {}}
      />
    </div>
  );
}
