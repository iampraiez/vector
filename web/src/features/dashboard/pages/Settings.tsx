import React, { useState } from "react";

import {
  BuildingOfficeIcon,
  BellIcon,
  KeyIcon,
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

  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [isDataCleaningOpen, setIsDataCleaningOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);

  const companyCode = "VECT-2024";
  const apiKey = "vect_sk_live_a4b8c2d1e5f9g3h7";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(companyCode).catch(() => {});
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey).catch(() => {});
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
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

  return (
    <>
      <div className="p-4 md:p-8 max-w-225 mx-auto pb-24">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl md:text-[28px] font-bold text-gray-900 mb-1 tracking-tight">
            Settings & Workspace
          </h1>
          <p className="text-[14px] text-gray-500">
            Control your fleet configuration, workspace privacy, and team access
          </p>
        </div>

        <div className="space-y-8">
          {/* Driver Join Code Banner */}
          <div className="relative overflow-hidden bg-emerald-600 rounded-3xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 shadow-xl shadow-emerald-600/10 border border-emerald-500/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex-1 min-w-75">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">
                  Driver Onboarding Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                Fleet Access Code
              </h3>
              <p className="text-emerald-50/70 text-[13px] mb-6 max-w-sm">
                Share this unique identifier with new drivers to automatically
                link them to your fleet operations center.
              </p>
              <div className="inline-flex items-center gap-4 bg-black/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 group">
                <span className="text-2xl font-mono font-extrabold text-white tracking-[4px]">
                  {companyCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-95 text-white"
                >
                  <ClipboardDocumentIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button className="relative z-10 px-6 py-3 bg-white text-emerald-700 font-bold text-[13px] rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer">
              Regenerate Code
            </button>
          </div>

          {/* Company Workspace */}
          <Section
            title="Fleet Workspace"
            subtitle="Profile and contact details for your operations"
          >
            {!editingCompany ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                <div className="md:col-span-2 pt-2">
                  <button
                    onClick={() => {
                      setCompanyDraft(company);
                      setEditingCompany(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 border border-black/8 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-gray-50 hover:border-emerald-600/30 hover:text-emerald-600 transition-all cursor-pointer"
                  >
                    <PencilIcon className="w-4 h-4" />
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
                <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                  <button
                    onClick={handleSaveCompany}
                    disabled={companySaved}
                    className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-[13px] rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 min-w-40"
                  >
                    {companySaved ? (
                      <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={() => setEditingCompany(false)}
                    className="px-5 py-2.5 text-gray-400 font-bold text-[13px] hover:text-gray-600 cursor-pointer"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Notifications */}
          <Section
            title="Communications"
            subtitle="Configure system alerts and telemetry notifications"
          >
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
              <Toggle value={notifications.sms} onChange={toggle("sms")} />
            </SettingRow>
            <SettingRow
              label="Email Snapshots"
              subtitle="Daily delivery performance and billing summaries."
            >
              <Toggle value={notifications.email} onChange={toggle("email")} />
            </SettingRow>
            <SettingRow
              label="Browser System Notifications"
              subtitle="In-app alerts for real-time fleet map events."
            >
              <Toggle value={notifications.push} onChange={toggle("push")} />
            </SettingRow>
          </Section>

          {/* Security & Access */}
          <Section
            title="Security & API"
            subtitle="Secure your workspace and integrate with external APIs"
          >
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-5 bg-gray-50/50 border border-black/5 rounded-2xl group hover:bg-white hover:border-emerald-600/30 hover:shadow-xl transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                    <ShieldCheckIcon className="w-5.5 h-5.5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[14px] font-bold text-gray-900 mb-0.5">
                      Workspace Credentials
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium">
                      Reset your system password and active sessions
                    </p>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-4.5 h-4.5 text-gray-300 group-hover:text-emerald-600" />
              </button>

              <div className="p-6 bg-gray-50/50 border border-black/5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="w-4 h-4 text-emerald-600" />
                    <span className="text-[13px] font-bold text-gray-900">
                      Live API Secret
                    </span>
                  </div>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:underline cursor-pointer"
                  >
                    {showApiKey ? "Hide Secret" : "Reveal Secret"}
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 bg-white border border-gray-100 rounded-xl px-4 py-3 font-mono text-[13px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
                    {showApiKey ? apiKey : "••••••••••••••••••••••••••••"}
                  </div>
                  <button
                    onClick={handleCopyApiKey}
                    className={`px-4 py-3 rounded-xl border font-bold text-[12px] transition-all flex items-center gap-2 cursor-pointer ${
                      apiKeyCopied
                        ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                        : "bg-white border-gray-100 text-gray-400 hover:border-emerald-600/30 hover:text-emerald-600"
                    }`}
                  >
                    {apiKeyCopied ? (
                      <CheckCircleIcon className="w-4 h-4" />
                    ) : (
                      <ClipboardDocumentIcon className="w-4 h-4" />
                    )}
                    {apiKeyCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* Danger Zone */}
          <div className="bg-red-50 border-2 border-red-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-extrabold text-red-700 tracking-tight">
                System Danger Zone
              </h2>
            </div>
            <p className="text-[13px] text-red-600/70 mb-8 leading-relaxed font-bold">
              These actions are strictly irreversible. Executing these will
              trigger a formal audit report to the workspace owner.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsDataCleaningOpen(true)}
                className="px-6 py-3 border-2 border-red-200 text-red-600 font-bold text-[13px] rounded-2xl hover:bg-white hover:border-red-600 hover:text-red-600 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <TrashIcon className="w-4.5 h-4.5" />
                Purge All Workspace Data
              </button>
              <button
                onClick={() => setIsDeleteAccountOpen(true)}
                className="px-6 py-3 bg-red-600 text-white font-bold text-[13px] rounded-2xl shadow-lg shadow-red-600/10 hover:bg-red-700 hover:shadow-red-600/20 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <XMarkIcon className="w-4.5 h-4.5" />
                Permanent Deactivate Account
              </button>
            </div>
          </div>

          <p className="text-center text-[12px] text-gray-400 pt-8 pb-12 font-medium">
            VECTOR v2.5.0 Production Tier ·{" "}
            <a href="#" className="text-emerald-600 hover:underline">
              Compliance & Privacy Policy
            </a>
          </p>
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
