import { useState, useEffect } from "react";
import {
  useSettingsStore,
  NotificationsConfig,
  CompanyInfo,
  RouteSettings,
} from "../../../store/settingsStore";
import { useAuthStore } from "../../../store/authStore";
import {
  XMarkIcon,
  BuildingOfficeIcon,
  BellIcon,
  PencilIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "../../../components/ui/skeleton";

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
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-black/8 rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="px-6 py-5 md:px-8 md:py-6 border-b border-gray-100 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-medium text-gray-700 mb-0.5 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[12px] text-gray-400 font-normal">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
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
        <p className="text-[14px] font-medium text-gray-700 mb-0.5">{label}</p>
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
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-gray-50/50 border border-black/5 rounded-2xl p-4.5 group transition-all duration-300 hover:bg-white hover:border-emerald-600/30 hover:shadow-sm">
      <div className="flex items-center gap-2.5 mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
        <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-4" />
      ) : (
        <p className="text-[13px] font-medium text-gray-700 tracking-tight leading-none">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-[10px] font-medium text-gray-500 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50/50 border border-black/5 rounded-xl px-4 py-2.5 text-[13px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/30 transition-all placeholder:text-gray-300"
      />
    </div>
  );
}

function EditProfileModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  isMutating,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData: CompanyInfo;
  onSave: (data: Partial<CompanyInfo>) => Promise<void>;
  isMutating: boolean;
}) {
  const { user } = useAuthStore();
  const [draft, setDraft] = useState<CompanyInfo>({
    ...initialData,
    contact_email: initialData.contact_email || user?.email || "",
  });
  const [prevInitialData, setPrevInitialData] =
    useState<CompanyInfo>(initialData);

  if (initialData !== prevInitialData) {
    setDraft({
      ...initialData,
      contact_email: initialData.contact_email || user?.email || "",
    });
    setPrevInitialData(initialData);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-black/5 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-gray-100">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
              Edit Workspace
            </h3>
            <p className="text-[13px] text-gray-400 mt-0.5 font-normal">
              Update company information
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-black/5"
          >
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Operating Name"
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
            />
            <InputField
              label="Ops Email"
              value={draft.contact_email}
              onChange={(v) => setDraft({ ...draft, contact_email: v })}
            />
          </div>
          <InputField
            label="Fleet Hotline"
            value={draft.phone}
            onChange={(v) => setDraft({ ...draft, phone: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="City"
              value={draft.city}
              onChange={(v) => setDraft({ ...draft, city: v })}
            />
            <InputField
              label="State"
              value={draft.state}
              onChange={(v) => setDraft({ ...draft, state: v })}
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-white border border-black/5 text-gray-500 font-semibold text-[13px] rounded-2xl hover:bg-gray-100 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              await onSave(draft);
              onClose();
            }}
            disabled={isMutating}
            className="flex-3 py-3.5 bg-emerald-600 text-white font-semibold text-[13px] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70"
          >
            {isMutating ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-[13px] text-gray-500 mb-6">{desc}</p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold text-[13px] rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              // Do not automatically close; let the handler close it if needed, or handle async logic onConfirm
            }}
            className={`flex-1 py-3 ${variant === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"} text-white font-semibold text-[13px] rounded-xl shadow-lg transition-all`}
          >
            {btnText}
          </button>
        </div>
      </div>
    </div>
  );
}

function OtpVerifyModal({
  isOpen,
  onClose,
  action,
  onVerify,
  isVerifying,
}: {
  isOpen: boolean;
  onClose: () => void;
  action: "clear_workspace_data" | "deactivate_workspace" | null;
  onVerify: (otp: string) => void;
  isVerifying: boolean;
}) {
  const [otp, setOtp] = useState("");

  if (!isOpen || !action) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Verify Identity
        </h3>
        <p className="text-[13px] text-gray-500 mb-4">
          A 6-digit code has been sent to your email. Enter it below to confirm{" "}
          {action === "deactivate_workspace"
            ? "deactivation"
            : "data clearance"}
          .
        </p>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          disabled={isVerifying}
          placeholder="000000"
          className="w-full text-center text-3xl tracking-[0.2em] font-semibold py-3 mb-6 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isVerifying}
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold text-[13px] rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onVerify(otp)}
            disabled={otp.length !== 6 || isVerifying}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[13px] rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify"}
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
    routeSettings,
    isLoading,
    isMutating,
    requestOtp,
    verifyOtp,
    fetchSettings,
    updateCompany,
    updateNotifications,
    updateRouteSettings,
    regenerateAccessCode,
  } = useSettingsStore();

  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<
    "general" | "communications" | "routes"
  >("general");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isDataCleaningOpen, setIsDataCleaningOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpAction, setOtpAction] = useState<
    "clear_workspace_data" | "deactivate_workspace" | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleNotification = (key: keyof NotificationsConfig) => async () => {
    if (notifications) {
      const newSettings = { ...notifications, [key]: !notifications[key] };
      try {
        await updateNotifications(newSettings);
      } catch {
        alert("Failed to update notification setting.");
      }
    }
  };

  const toggleRouteSetting = (key: keyof RouteSettings) => async () => {
    if (routeSettings) {
      const newSettings = { ...routeSettings, [key]: !routeSettings[key] };
      try {
        await updateRouteSettings(newSettings);
      } catch {
        alert("Failed to update route setting.");
      }
    }
  };

  const handleSaveCompany = async (data: Partial<CompanyInfo>) => {
    const filteredData: Partial<CompanyInfo> = {
      name: data.name,
      contact_email: data.contact_email,
      phone: data.phone,
      city: data.city,
      state: data.state,
      timezone: data.timezone,
    };

    Object.keys(filteredData).forEach((key) => {
      if (filteredData[key as keyof CompanyInfo] === undefined) {
        delete filteredData[key as keyof CompanyInfo];
      }
    });

    await updateCompany(filteredData);
  };

  const handleUpdateRouteAddresses = async (data: Partial<RouteSettings>) => {
    try {
      await updateRouteSettings(data);
    } catch {
      alert("Failed to update route addresses.");
    }
  };

  const handleRequestOtp = async (
    action: "clear_workspace_data" | "deactivate_workspace",
  ) => {
    if (action === "clear_workspace_data") setIsDataCleaningOpen(false);
    if (action === "deactivate_workspace") setIsDeleteAccountOpen(false);

    setOtpAction(action);
    setIsOtpOpen(true);

    requestOtp(action).catch(() => {
      alert("Failed to send verification code. Please try again.");
      setIsOtpOpen(false);
    });
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!otpAction) return;
    setIsVerifying(true);
    try {
      await verifyOtp(otpAction, otp);
      setIsVerifying(false);
      setIsOtpOpen(false);

      if (otpAction === "clear_workspace_data") {
        alert(
          "Workspace data cleared successfully. A report will be emailed to you.",
        );
        logout();
      } else {
        alert("Workspace scheduled for deletion in 10 days.");
        logout();
      }
    } catch {
      setIsVerifying(false);
      alert("Invalid or expired OTP.");
    }
  };

  const isLoadingInitial = isLoading && !company;
  const companyCode = company?.company_code || "VECT-XXXX";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="mb-2 font-inter">
        <h1 className="text-2xl md:text-[26px] font-bold text-gray-900 mb-0.5 tracking-tight">
          Settings
        </h1>
        <p className="text-[12.5px] text-gray-500 font-normal">
          Manage your workspace profile and performance preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/50 border border-black/5 rounded-2xl w-fit">
        {(
          [
            { id: "general", label: "General", icon: BuildingOfficeIcon },
            { id: "communications", label: "Communications", icon: BellIcon },
            { id: "routes", label: "Routes", icon: MapPinIcon },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as unknown as React.SetStateAction<
                  "general" | "communications" | "routes"
                >,
              )
            }
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-emerald-600 shadow-sm border border-black/5 scale-[1.02]"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"
            }`}
          >
            <tab.icon
              className={`w-4 h-4 ${activeTab === tab.id ? "text-emerald-600" : "text-gray-400"}`}
            />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === "general" && (
          <>
            {/* Driver Access Code */}
            <div className="relative overflow-hidden bg-white border border-black/8 rounded-3xl p-4.5 md:p-5 flex items-center justify-between gap-4 shadow-sm transition-all hover:bg-gray-50/20">
              <div className="relative z-10 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
                    Fleet Access Code
                  </span>
                  <div className="flex items-center gap-3">
                    {isLoadingInitial ? (
                      <Skeleton className="w-32 h-8" />
                    ) : (
                      <span className="text-[20px] font-mono font-bold text-gray-900 tracking-tighter bg-white px-3 py-1.5 rounded-lg border border-black/5">
                        {companyCode}
                      </span>
                    )}
                    {!isLoadingInitial && (
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(companyCode)
                        }
                        className="p-2 text-gray-300 hover:text-emerald-600 transition-colors"
                        title="Copy code"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {!isLoadingInitial && (
                <button
                  onClick={() => regenerateAccessCode()}
                  disabled={isMutating}
                  className="relative z-10 px-4 py-2 bg-gray-50 border border-black/5 text-gray-500 font-bold text-[10px] uppercase tracking-wider rounded-xl hover:bg-white hover:text-emerald-600 hover:border-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isMutating ? "..." : "Regenerate"}
                </button>
              )}
            </div>

            {/* Workspace Section */}
            <Section
              title="Workspace Profile"
              subtitle="Public company details and headquarters info"
              action={
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2 text-gray-300 hover:text-emerald-600 transition-colors"
                  title="Edit profile"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StaticField
                  label="Operating Name"
                  value={company?.name || ""}
                  icon={BuildingOfficeIcon}
                  isLoading={isLoadingInitial}
                />
                <StaticField
                  label="Member Since"
                  value={
                    company?.created_at
                      ? new Date(company.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : ""
                  }
                  icon={BuildingOfficeIcon}
                  isLoading={isLoadingInitial}
                />
                <StaticField
                  label="Operations Email"
                  value={company?.contact_email || user?.email || ""}
                  icon={EnvelopeIcon}
                  isLoading={isLoadingInitial}
                />
                <StaticField
                  label="Fleet Hotline"
                  value={company?.phone || ""}
                  icon={BellIcon}
                  isLoading={isLoadingInitial}
                />
                <StaticField
                  label="Region"
                  value={
                    company?.city && company?.state
                      ? `${company.city}, ${company.state}`
                      : company?.city || company?.state || ""
                  }
                  icon={MapPinIcon}
                  isLoading={isLoadingInitial}
                />
              </div>
            </Section>

            {/* Simplified Danger Zone Section */}
            <div className="bg-white border border-black/5 rounded-3xl p-6 shadow-sm">
              <h3 className="text-[14px] font-medium text-gray-700 mb-1 tracking-tight">
                Danger Zone
              </h3>
              <p className="text-[12px] text-gray-400 font-normal mb-6">
                Irreversible actions for your workspace data and access.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <button
                  onClick={() => setIsDataCleaningOpen(true)}
                  className="text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Clear Records
                </button>
                <button
                  onClick={() => setIsDeleteAccountOpen(true)}
                  className="px-4 py-2 border border-red-100 text-red-500 rounded-xl text-[11px] font-semibold hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer active:scale-95"
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === "communications" && (
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
                  onChange={toggleNotification("driverAlerts")}
                />
              </SettingRow>
              <SettingRow
                label="Daily Email Snapshot"
                subtitle="Performance summary sent every morning."
              >
                <Toggle
                  value={notifications?.email ?? true}
                  onChange={toggleNotification("email")}
                />
              </SettingRow>
              <SettingRow
                label="System Push Notifications"
                subtitle="Browser alerts for live tracking events."
              >
                <Toggle
                  value={notifications?.push ?? true}
                  onChange={toggleNotification("push")}
                />
              </SettingRow>
            </div>
          </Section>
        )}

        {activeTab === "routes" && (
          <Section
            title="Route Optimization"
            subtitle="Configure default behavior for route generation and sequence tuning"
          >
            <div className="space-y-6">
              <SettingRow
                label="Automatic Optimization"
                subtitle="Automatically sort stops for maximum efficiency upon route creation."
              >
                <Toggle
                  value={routeSettings?.auto_optimize ?? false}
                  onChange={toggleRouteSetting("auto_optimize")}
                />
              </SettingRow>

              <div className="pt-4 border-t border-gray-50 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-[13px] font-semibold text-gray-700">
                      Depot Locations
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <InputField
                      label="Default Start Address"
                      value={routeSettings?.default_start_address || ""}
                      placeholder="Enter depot or warehouse address"
                      onChange={(v) =>
                        handleUpdateRouteAddresses({ default_start_address: v })
                      }
                    />
                    <InputField
                      label="Default End Address"
                      value={routeSettings?.default_end_address || ""}
                      placeholder="Leave empty to end at the last stop"
                      onChange={(v) =>
                        handleUpdateRouteAddresses({ default_end_address: v })
                      }
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed italic">
                    Note: These addresses will be used as the starting and
                    ending points for all new routes created in this workspace.
                  </p>
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        initialData={
          company || {
            name: "",
            contact_email: "",
            phone: "",
            city: "",
            state: "",
            timezone: "America/Los_Angeles",
          }
        }
        onSave={handleSaveCompany}
        isMutating={isMutating}
      />

      <SimpleConfirmModal
        isOpen={isDataCleaningOpen}
        onClose={() => setIsDataCleaningOpen(false)}
        title="Clear workspace data?"
        desc="This will permanently delete all logs and history. This cannot be undone."
        btnText="Clear Everything"
        onConfirm={() => handleRequestOtp("clear_workspace_data")}
      />

      <SimpleConfirmModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        title="Delete your account?"
        desc="Your workspace will be deactivated. You have 10 days to revert this action."
        btnText="Deactivate Account"
        onConfirm={() => handleRequestOtp("deactivate_workspace")}
      />

      <OtpVerifyModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        action={otpAction}
        onVerify={handleVerifyOtp}
        isVerifying={isVerifying}
      />
    </div>
  );
}
