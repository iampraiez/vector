import { useNavigate } from "react-router";
import { Helmet } from "react-helmet-async";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 mt-10">
      {children}
    </h2>
  );
}

export function TermsContent() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 text-[15px] leading-relaxed text-gray-600">
      <SectionHeading>1. Acceptance of Terms</SectionHeading>
      <p className="mb-6 text-gray-700">
        By accessing or using the Vector platform, including our website and
        mobile applications, you agree to be bound by these Terms of Service.
        These terms constitute a legally binding agreement between you and
        Vector Logistics Technologies Inc.
      </p>

      <SectionHeading>2. Description of Service</SectionHeading>
      <p className="mb-6 text-gray-700">
        Vector provides a fleet management platform that includes AI-powered
        route optimization, live GPS tracking, proof of delivery, customer
        notifications, and analytics tools. We reserve the right to modify,
        suspend, or discontinue any part of the service at any time.
      </p>

      <SectionHeading>3. User Accounts and Responsibilities</SectionHeading>
      <p className="mb-4">You are responsible for:</p>
      <ul className="list-disc pl-6 space-y-3 mb-6">
        <li>
          Maintaining the accuracy and completeness of your account information
        </li>
        <li>Keeping your password and company code confidential and secure</li>
        <li>All activities that occur under your account</li>
        <li>
          Ensuring that your use of the service complies with all applicable
          laws
        </li>
      </ul>

      <SectionHeading>4. Prohibited Conduct</SectionHeading>
      <p className="mb-4">You agree not to:</p>
      <ul className="list-disc pl-6 space-y-3 mb-6">
        <li>
          Reverse engineer, decompile, or attempt to discover the source code of
          our platform
        </li>
        <li>
          Use the service to track individuals without their knowledge or
          consent
        </li>
        <li>
          Attempt to overload, disrupt, or interfere with the platform's
          operation
        </li>
        <li>Use the service for any illegal or unauthorized purpose</li>
      </ul>

      <SectionHeading>5. Billing and Payments</SectionHeading>
      <p className="mb-6 text-gray-700">
        Paid subscriptions are billed in advance on a monthly or annual basis.
        All fees are non-refundable except where required by law. You may cancel
        your subscription at any time. A 14-day free trial is available on all
        paid plans.
      </p>

      <SectionHeading>6. Limitation of Liability</SectionHeading>
      <p className="mb-6">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, VECTOR SHALL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
        ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
      </p>

      <SectionHeading>7. Governing Law</SectionHeading>
      <p className="mb-6 text-gray-700">
        These terms are governed by the laws of the State of California, without
        regard to conflict of law principles.
      </p>

      <SectionHeading>8. Contact</SectionHeading>
      <p>
        If you have any questions regarding these Terms of Service, please
        contact us at{" "}
        <a
          href="mailto:himpraise571@gmail.com"
          className="text-emerald-600 hover:underline font-medium"
        >
          himpraise571@gmail.com
        </a>
        .
      </p>
    </div>
  );
}

export function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Helmet>
        <title>Terms of Service | Vector</title>
        <link rel="canonical" href="https://vector-fleet.vercel.app/terms" />
      </Helmet>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5 px-6 py-5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
            <LocalShippingIcon size={20} className="text-white" />
          </div>
          <span className="text-[17px] font-black tracking-[-0.5px]">
            VECTOR
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to site
        </button>
      </nav>

      {/* Hero */}
      <header className="pt-28 pb-10 px-6 max-w-3xl mx-auto border-b border-black/5">
        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-3">
          Legal
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Terms of Service
        </h1>
        <p className="mt-2 text-[13px] text-gray-400">
          Last updated: March 2026
        </p>
      </header>

      <TermsContent />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-black/5 py-10 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Vector Logistics Technologies Inc. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
