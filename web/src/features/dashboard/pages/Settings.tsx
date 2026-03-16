import React, { useState } from "react";

import {
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  KeyIcon,
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

/* --- Modals for Danger Zone --- */

function DataCleaningModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      onConfirm();
      setLoading(false);
    }, 1000);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-4xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Clear All Fleet Data?
        </h3>
        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
          This action will permanently delete all order history, driver logs,
          and analytics.
          <span className="block mt-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[13px] text-amber-700 font-medium italic">
            IMPORTANT: A full audit report of this action will be sent to the
            fleet owner's registered email address immediately.
          </span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white font-bold text-[14px] rounded-2xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Yes, Clear Everything"
            )}
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 font-bold text-[13px] hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1); // 1: Confirmation, 2: Code Verification, 3: Success message
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] w-full max-w-110 p-10 shadow-2xl shadow-black/20 animate-in slide-in-from-bottom-10 duration-500 overflow-hidden relative">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-red-600/30">
              <TrashIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              Delete Account?
            </h3>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
              Your account will be deactivated and permanently deleted in{" "}
              <span className="font-bold text-red-600">7 days</span>. A full
              activity report will be sent to the fleet owner.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-red-600 text-white font-bold text-[14px] rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-[0.98]"
            >
              Send Verification Code
            </button>
            <button
              onClick={onClose}
              className="w-full text-center mt-6 text-[13px] font-bold text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Stay on VECTOR
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
              <EnvelopeIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
              Verify Identity
            </h3>
            <p className="text-[14px] text-gray-500 mb-8 leading-relaxed">
              We've sent a 6-digit code to your email. Enter it to confirm
              deactivation.
            </p>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="w-full h-16 bg-gray-50 border border-black/5 rounded-2xl px-6 text-center text-2xl font-bold tracking-[8px] focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/50 mb-6"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCode(val);
                if (val.length === 6) {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                    setStep(3);
                  }, 1200);
                }
              }}
            />
            {loading && (
              <div className="flex justify-center mt-4">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <p className="text-[12px] text-center text-gray-400 font-medium">
              Didn't receive it?{" "}
              <button className="text-emerald-600 font-bold hover:underline">
                Resend Code
              </button>
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="text-center animate-in scale-in-90 duration-500">
            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
              Account Deactivated
            </h3>
            <p className="text-[14px] text-gray-500 leading-relaxed mb-8">
              You will now be logged out. Your account will be deleted in 7
              days.
              <span className="block mt-4 font-bold text-gray-900">
                To reactivate, you must log in and verify your email again.
              </span>
            </p>
            <button
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  window.location.href = "/dashboard/signin";
                }, 1000);
              }}
              disabled={loading}
              className="w-full py-4 bg-gray-900 text-white font-bold text-[14px] rounded-2xl shadow-xl shadow-gray-900/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Log Out Now"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Main Dashboard Settings Component --- */

export function DashboardSettings() {
  const [activeTab, setActiveTab] = useState<
    "workspace" | "notifications" | "security" | "danger"
  >("workspace");
  const [company, setCompany] = useState({
    name: "VECTOR Fleet Services",
    email: "contact@vectorfleet.com",
    phone: "+1 (555) 000-0000",
    city: "San Francisco",
    state: "CA",
    timezone: "America/Los_Angeles",
  });
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(company);
  const [companySaved, setCompanySaved] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    driverAlerts: true,
    deliveryUpdates: true,
    paymentAlerts: false,
    weeklyReport: true,
  });

  const [isDataCleaningOpen, setIsDataCleaningOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const companyCode = "VECT-2024";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(companyCode).catch(() => {});
  };

  const toggle = (key: keyof typeof notifications) => () => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveCompany = () => {
    setCompanySaved(true);
    setTimeout(() => {
      setCompany(companyDraft);
      setEditingCompany(false);
      setCompanySaved(false);
    }, 900);
  };

  const tabs = [
    { id: "workspace", label: "Workspace", icon: BuildingOfficeIcon },
    { id: "notifications", label: "Communications", icon: BellIcon },
    { id: "security", label: "Security & API", icon: ShieldCheckIcon },
    { id: "danger", label: "Danger Zone", icon: ExclamationTriangleIcon },
  ] as const;

  return (
    <>
      <div className="p-4 md:p-6 max-w-5xl mx-auto pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-[32px] font-black text-gray-900 mb-2 tracking-tight">
            Settings
          </h1>
          <p className="text-[13px] text-gray-500 font-medium">
            Manage your fleet workspace, team access, and security
            configurations
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${active ? "bg-white text-emerald-600 shadow-sm border border-emerald-600/10" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100/50"}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-emerald-600" : "text-gray-400"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "workspace" && (
              <>
                {/* Driver Join Code Banner */}
                <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 shadow-2xl shadow-black/10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex-1 min-w-75">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                        Fleet Onboarding Active
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                      Fleet Access Code
                    </h3>
                    <p className="text-gray-400 text-[14px] mb-8 max-w-sm font-medium leading-relaxed">
                      Drivers can join your fleet automatically by entering this
                      unique identifier in their mobile app.
                    </p>
                    <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 group transition-all hover:bg-white/10">
                      <span className="text-3xl font-mono font-black text-white tracking-[6px] select-all">
                        {companyCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-90 text-white"
                      >
                        <ClipboardDocumentIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <button className="relative z-10 px-6 py-3.5 bg-emerald-600 text-white font-black text-[12px] rounded-xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-1 transition-all cursor-pointer">
                    Regenerate Code
                  </button>
                </div>

                <Section
                  title="Workspace Profile"
                  subtitle="General information about your fleet operations HQ"
                >
                  {!editingCompany ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <StaticField
                        label="Operating Name"
                        value={company.name}
                        icon={BuildingOfficeIcon}
                      />
                      <StaticField
                        label="Operations Email"
                        value={company.email}
                        icon={EnvelopeIcon}
                      />
                      <StaticField
                        label="Fleet Hotline"
                        value={company.phone}
                        icon={BellIcon}
                      />
                      <StaticField
                        label="Region / HQ"
                        value={`${company.city}, ${company.state}`}
                        icon={MapPinIcon}
                      />
                      <div className="md:col-span-2 pt-4">
                        <button
                          onClick={() => {
                            setCompanyDraft(company);
                            setEditingCompany(true);
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-black/5 rounded-2xl text-[13px] font-black text-gray-500 hover:bg-white hover:border-emerald-600/30 hover:text-emerald-600 hover:shadow-lg transition-all cursor-pointer"
                        >
                          <PencilIcon className="w-4 h-4 text-emerald-600" />
                          Edit Workspace Profile
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                          label="Operating Name"
                          value={companyDraft.name}
                          onChange={(v) =>
                            setCompanyDraft({ ...companyDraft, name: v })
                          }
                        />
                        <InputField
                          label="Operations Email"
                          value={companyDraft.email}
                          onChange={(v) =>
                            setCompanyDraft({ ...companyDraft, email: v })
                          }
                        />
                        <InputField
                          label="Fleet Hotline"
                          value={companyDraft.phone}
                          onChange={(v) =>
                            setCompanyDraft({ ...companyDraft, phone: v })
                          }
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
                      <div className="flex items-center gap-3 pt-8 border-t border-gray-50">
                        <button
                          onClick={handleSaveCompany}
                          disabled={companySaved}
                          className="px-8 py-3 bg-emerald-600 text-white font-black text-[13px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 min-w-44"
                        >
                          {companySaved ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            "Save Workspace"
                          )}
                        </button>
                        <button
                          onClick={() => setEditingCompany(false)}
                          className="px-6 py-3 text-gray-400 font-black text-[13px] hover:text-gray-600 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </Section>
              </>
            )}

            {activeTab === "notifications" && (
              <Section
                title="Communications"
                subtitle="Configure system alerts and automated telemetry messages"
              >
                <div className="space-y-2">
                  <SettingRow
                    label="Real-time Telemetry"
                    subtitle="Receive instant updates when drivers go offline or encounter delays."
                  >
                    <Toggle
                      value={notifications.driverAlerts}
                      onChange={toggle("driverAlerts")}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Operational SMS Alerts"
                    subtitle="Critical delivery failures sent directly to your supervisor hotline."
                  >
                    <Toggle
                      value={notifications.sms}
                      onChange={toggle("sms")}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Email Snapshots"
                    subtitle="Daily delivery performance and billing summaries."
                  >
                    <Toggle
                      value={notifications.email}
                      onChange={toggle("email")}
                    />
                  </SettingRow>
                  <SettingRow
                    label="Browser System Notifications"
                    subtitle="In-app alerts for real-time fleet map events."
                  >
                    <Toggle
                      value={notifications.push}
                      onChange={toggle("push")}
                    />
                  </SettingRow>
                </div>
              </Section>
            )}

            {activeTab === "security" && (
              <Section
                title="Security"
                subtitle="Manage your authentication and workspace protection"
              >
                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-5 bg-gray-50/50 border border-black/5 rounded-2xl group hover:bg-white hover:border-emerald-600/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all">
                        <ShieldCheckIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-gray-900 mb-0.5">
                          Account Credentials
                        </p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                          Change Password • Manage Sessions
                        </p>
                      </div>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                  <button className="w-full flex items-center justify-between p-5 bg-gray-50/50 border border-black/5 rounded-2xl group hover:bg-white hover:border-emerald-600/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all">
                        <KeyIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-[14px] font-black text-gray-900 mb-0.5">
                          Two-Factor Authentication
                        </p>
                        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                          Increase account security
                        </p>
                      </div>
                    </div>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </Section>
            )}
            {activeTab === "danger" && (
              <div className="bg-red-50/50 border border-red-100 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-red-100">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-red-900 tracking-tight">
                        Critical Operations
                      </h2>
                      <p className="text-[10px] text-red-600/60 font-black uppercase tracking-widest">
                        System Danger Zone
                      </p>
                    </div>
                  </div>

                  <p className="text-[13px] text-red-800/70 mb-8 leading-relaxed font-medium max-w-xl">
                    These actions are strictly irreversible. Executing these
                    will trigger a formal audit report to the workspace owner.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => setIsDataCleaningOpen(true)}
                      className="group flex flex-col items-start p-5 bg-white border border-red-100 rounded-2xl text-left hover:border-red-600 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </div>
                      <p className="text-[13px] font-black text-gray-900 mb-0.5">
                        Purge Workspace Data
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        Delete history and logs
                      </p>
                    </button>

                    <button
                      onClick={() => setIsDeleteAccountOpen(true)}
                      className="group flex flex-col items-start p-5 bg-red-600 border border-transparent rounded-2xl text-left hover:bg-red-700 transition-all cursor-pointer active:scale-[0.98]"
                    >
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-3 text-white">
                        <XMarkIcon className="w-4 h-4" />
                      </div>
                      <p className="text-[13px] font-black text-white mb-0.5">
                        Deactivate Workspace
                      </p>
                      <p className="text-[10px] text-white/60 font-medium">
                        Permanently close account
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-[11px] text-gray-400 pt-8 font-black uppercase tracking-widest">
              VECTOR v2.5.0 Production · PRO Tier ·
              <a href="#" className="text-emerald-600 hover:underline ml-1">
                Security Policy
              </a>
            </p>
          </main>
        </div>
      </div>

      <DataCleaningModal
        isOpen={isDataCleaningOpen}
        onClose={() => setIsDataCleaningOpen(false)}
        onConfirm={() => {
          alert(
            "Data clearing initiated. A report has been sent to the fleet owner.",
          );
          setIsDataCleaningOpen(false);
        }}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
      />
    </>
  );
}

/* --- Inline Helper Components --- */

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
    <div className="p-5 bg-gray-50/30 border border-black/5 rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p className="text-[15px] font-bold text-gray-900 tracking-tight">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <input
        type="text"
        className="w-full h-12 px-4 bg-white border border-black/8 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
