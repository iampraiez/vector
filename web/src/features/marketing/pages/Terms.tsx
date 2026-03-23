import { useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  CheckBadgeIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  HandRaisedIcon,
  GlobeAltIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  ScaleIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function TermsContent({
  className = "py-16 px-6 max-w-4xl mx-auto space-y-16",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Intro section */}
      <div className="relative p-8 md:p-10 bg-gray-900 border border-gray-800 rounded-4xl overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
          <CheckBadgeIcon className="w-32 h-32 text-emerald-500" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black text-white tracking-tight mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-gray-900 text-sm font-bold">
              1
            </span>
            Acceptance of Terms
          </h2>
          <p className="text-[15px] text-gray-400 leading-relaxed font-medium">
            By accessing or using the Vector platform ("Service"), you agree to
            be bound by these Terms of Service. These terms constitute a legally
            binding agreement between you and Vector Logistics Technologies Inc.
          </p>
        </div>
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold">
            2
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Service Description
          </h2>
        </div>
        <div className="p-8 bg-white border border-black/8 rounded-3xl shadow-sm relative group">
          <p className="text-[15px] text-gray-600 leading-relaxed font-medium relative z-10">
            Vector provides a comprehensive fleet management and logistics
            tracking platform. Our services include route optimization,
            real-time tracking, driver management, and order processing. We
            reserve the right to modify or discontinue any part of the service
            with reasonable notice.
          </p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-black/5">
              <GlobeAltIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Real-time
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-black/5">
              <ComputerDesktopIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Dashboard
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-black/5">
              <IdentificationIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Drivers
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 border border-black/5">
              <LocalShippingIcon size={20} className="text-emerald-600" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Fleet
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold">
            3
          </span>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Account Responsibilities
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: IdentificationIcon,
              title: "Accuracy",
              desc: "You must provide accurate and complete registration info.",
            },
            {
              icon: HandRaisedIcon,
              title: "Security",
              desc: "You are responsible for maintaining credential secrecy.",
            },
            {
              icon: ExclamationTriangleIcon,
              title: "Notification",
              desc: "Report unauthorized account access immediately.",
            },
            {
              icon: LocalShippingIcon,
              title: "Usage",
              desc: "You are responsible for all activities under your account.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-4 p-5 bg-white border border-black/8 rounded-2xl shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-bold">
              4
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Usage Restrictions
            </h2>
          </div>
          <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
            To maintain platform integrity, you agree NOT to:
          </p>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-[14px] text-gray-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Track individuals without legal consent
            </li>
            <li className="flex items-center gap-3 text-[14px] text-gray-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Reverse engineer our routing proprietary engine
            </li>
            <li className="flex items-center gap-3 text-[14px] text-gray-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              Attempt to breach system security layers
            </li>
          </ul>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-900 text-white text-sm font-bold">
              5
            </span>
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              Payments & Subs
            </h2>
          </div>
          <div className="p-6 bg-emerald-50/30 border border-emerald-100/50 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <CreditCardIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-[14px] font-bold text-gray-900">
                Billing Policy
              </span>
            </div>
            <p className="text-[13px] text-gray-600 leading-relaxed font-medium mb-4">
              Paid plans are billed in advance. All fees are non-refundable
              except where required by law.
            </p>
            <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              Standard 14-day free trial on all plans
            </div>
          </div>
        </section>
      </div>

      <section className="p-10 bg-red-50/30 border border-red-100 rounded-4xl text-center">
        <h2 className="text-xl font-black text-red-900 tracking-tight mb-4 flex items-center justify-center gap-3">
          Limitation of Liability
        </h2>
        <p className="text-[14px] text-red-700/80 font-bold max-w-2xl mx-auto leading-relaxed uppercase">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, VECTOR SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES RESULTING
          FROM THE USE OR INABILITY TO USE OUR SERVICES.
        </p>
      </section>

      <section className="pt-8 border-t border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-6">
          Legal Questions?
        </h2>
        <div className="bg-white border border-black/8 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
              <ScaleIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">
                Reach our Legal Team
              </p>
              <p className="text-gray-500 font-medium">
                Response time within 48 business hours.
              </p>
            </div>
          </div>
          <a
            href="mailto:himpraise571@gmail.com"
            className="px-8 py-3.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition-colors no-underline"
          >
            Email Legal Department
          </a>
        </div>
      </section>
    </div>
  );
}

export function Terms() {
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
          Terms of Service
        </h1>
        <p className="text-lg text-gray-500 font-medium leading-relaxed">
          Last Updated: March 16, 2026. Please read these terms carefully before
          using our services.
        </p>
      </header>

      {/* Content */}
      <TermsContent />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 px-6 text-center">
        <p className="text-[13px] text-gray-400 font-bold tracking-widest uppercase">
          &copy; 2026 Vector Logistics Technologies Inc.
        </p>
      </footer>
    </div>
  );
}
