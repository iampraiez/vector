import { useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  EyeIcon,
  LockClosedIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function PrivacyContent({
  className = "py-16 px-6 max-w-4xl mx-auto space-y-16",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Intro section */}
      <div className="relative p-8 md:p-10 bg-emerald-50/50 border border-emerald-100/50 rounded-4xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 duration-700">
          <ShieldCheckIcon className="w-32 h-32 text-emerald-600" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm">
              1
            </span>
            Introduction
          </h2>
          <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
            Welcome to Vector. This Privacy Policy describes how Vector
            Logistics Technologies Inc. ("we", "us", or "our") collects, uses,
            and shares your personal information when you use our logistics
            platform. We take your data security personally.
          </p>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-bold">
            2
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Information We Collect
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-black/8 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Personal Data
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
              Names, email addresses, and payment details provided during
              registration.
            </p>
          </div>
          <div className="p-6 bg-white border border-black/8 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
              <EyeIcon className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Fleet Operations
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
              Real-time GPS coordinates, delivery addresses, and driver
              performance metrics.
            </p>
          </div>
          <div className="p-6 bg-white border border-black/8 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
              <LockClosedIcon className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">
              Device Info
            </h3>
            <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
              IP addresses, browser types, and device identifiers collected
              automatically.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-bold">
              3
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              How We Use Data
            </h2>
          </div>
          <ul className="space-y-4">
            {[
              "Optimizing delivery routes and fleet efficiency",
              "Providing real-time tracking to your customers",
              "Processing subscriptions and managing accounts",
              "Improving platform security and performance",
              "Compliance with logistics regulations",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                <span className="text-[14px] text-gray-600 font-medium leading-tight">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-bold">
              4
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Data Sharing
            </h2>
          </div>
          <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
            We never sell your data. We share only what's necessary with:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-black/5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-[12px] font-bold text-gray-700">
                Verified Service Providers
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-black/5">
              <EyeIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-[12px] font-bold text-gray-700">
                Tracking Link Recipients
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-black/5">
              <ScaleIcon className="w-4 h-4 text-emerald-600" />
              <span className="text-[12px] font-bold text-gray-700">
                Legal Authorities If Required
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="p-8 bg-gray-900 rounded-4xl text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10">
          <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white text-sm">
              5
            </span>
            Your Data Rights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest">
                Access & Control
              </h3>
              <p className="text-gray-400 text-[14px] leading-relaxed">
                You have the right to request a full export of all data we hold
                about your fleet and account at any time.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-emerald-400 font-bold text-sm uppercase tracking-widest">
                The Right to Erase
              </h3>
              <p className="text-gray-400 text-[14px] leading-relaxed">
                You can request the permanent deletion of your account and all
                associated operational history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-8 border-t border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
          Contact Privacy Team
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <a
            href="mailto:himpraise571@gmail.com"
            className="flex-1 p-6 bg-white border border-black/8 rounded-2xl shadow-sm hover:border-emerald-600/30 transition-all group no-underline"
          >
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
              Email Support
            </p>
            <p className="text-lg font-black text-gray-900 group-hover:text-emerald-600 transition-colors">
              himpraise571@gmail.com
            </p>
          </a>
          <div className="flex-1 p-6 bg-gray-50 border border-black/5 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Office Address
            </p>
            <p className="text-[14px] font-bold text-gray-700 leading-tight">
              123 Logistics Way, Suite 100,
              <br />
              San Francisco, CA 94107
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-md bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform -translate-y-px">
            <LocalShippingIcon size={18} className="text-white" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-gray-900">
            VECTOR
          </span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-bold text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Go Back
        </button>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-16 px-6 max-w-4xl mx-auto border-b border-gray-50">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 mb-6">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-500 font-medium leading-relaxed">
          Last Updated: March 16, 2026. We are committed to protecting your
          personal data and your right to privacy.
        </p>
      </header>

      {/* Content */}
      <PrivacyContent />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 text-center">
        <p className="text-[13px] text-gray-400 font-bold tracking-widest uppercase">
          &copy; 2026 Vector Logistics Technologies Inc.
        </p>
      </footer>
    </div>
  );
}
