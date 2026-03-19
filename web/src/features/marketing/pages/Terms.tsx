import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function TermsContent({
  className = "py-16 px-6 max-w-4xl mx-auto space-y-12",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          1. Acceptance of Terms
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          By accessing or using the Vector platform ("Service"), you agree to be
          bound by these Terms of Service ("Terms"). If you do not agree to
          these terms, you may not access or use the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          2. Description of Service
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          Vector provides a fleet management and logistics tracking platform.
          Our services include route optimization, real-time tracking, driver
          management, and order processing. We reserve the right to modify,
          suspend, or discontinue any part of the Service at any time.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          3. User Accounts
        </h2>
        <div className="space-y-4">
          <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
            To access certain features of the Service, you must create a user
            account. You agree to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-[15px] text-gray-600 font-medium pl-2">
            <li>Provide accurate, current, and complete information</li>
            <li>
              Maintain the security and confidentiality of your login
              credentials
            </li>
            <li>
              Notify us immediately of any unauthorized use of your account
            </li>
            <li>
              Assume responsibility for all activities that occur under your
              account
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          4. Usage Restrictions and Compliance
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          You agree not to use the Service to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-[15px] text-gray-600 font-medium pl-2">
          <li>
            Engage in any illegal activity or violate any local, state, or
            federal laws
          </li>
          <li>
            Tracking individuals without their explicit consent (where required
            by law)
          </li>
          <li>
            Interfere with or disrupt the integrity or performance of the
            Service
          </li>
          <li>
            Attempt to gain unauthorized access to our systems or networks
          </li>
          <li>
            Reverse engineer, decompile, or disassemble any part of the Service
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          5. Subscription and Payments
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          Certain features are available only through a paid subscription. You
          agree to pay all fees associated with your chosen plan. All payments
          are non-refundable unless otherwise stated or required by law. We
          reserve the right to change our subscription fees upon reasonable
          notice.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          6. Intellectual Property
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of Vector Logistics
          Technologies Inc. Our trademarks and trade dress may not be used in
          connection with any product or service without our prior written
          consent.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          7. Limitation of Liability
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-bold italic">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, VECTOR SHALL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
          OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR
          INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE
          LOSSES.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          8. Governing Law
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          These Terms shall be governed by and construed in accordance with the
          laws of the State of California, United States, without regard to its
          conflict of law provisions.
        </p>
      </section>

      <section className="pt-8 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">
          Questions?
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium mb-4">
          If you have any questions about these Terms of Service, please contact
          our legal team:
        </p>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <p className="text-[14px] font-bold text-gray-900">
            Legal Department
          </p>
          <p className="text-[14px] text-gray-500 font-medium">
            himpraise571@gmail.com
          </p>
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
          <span className="text-[16px] font-extrabold tracking-[0.04em] text-gray-900">
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
