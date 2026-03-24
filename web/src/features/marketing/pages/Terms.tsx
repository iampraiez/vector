import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function TermsContent() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-[15px] leading-relaxed text-gray-700">
      <h2 className="text-xl font-bold text-gray-900 mb-8">
        1. Acceptance of Terms
      </h2>
      <p className="mb-12">
        By accessing or using the Vector platform, including our website and
        mobile applications, you agree to be bound by these Terms of Service.
        These terms constitute a legally binding agreement between you and
        Vector Logistics Technologies Inc.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        2. Description of Service
      </h2>
      <p className="mb-12">
        Vector provides a fleet management platform that includes AI-powered
        route optimization, live GPS tracking, proof of delivery, customer
        notifications, and analytics tools. We reserve the right to modify,
        suspend, or discontinue any part of the service at any time.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        3. User Accounts and Responsibilities
      </h2>
      <p className="mb-8">You are responsible for:</p>
      <ul className="list-disc pl-6 space-y-4 mb-12 text-gray-600">
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

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        4. Prohibited Conduct
      </h2>
      <p className="mb-12">You agree not to:</p>
      <ul className="list-disc pl-6 space-y-4 mb-12 text-gray-600">
        <li>
          Reverse engineer, decompile, or attempt to discover the source code of
          our platform
        </li>
        <li>
          Use the service to track individuals without their knowledge or
          consent
        </li>
        <li>
          Attempt to overload, disrupt, or interfere with the platform’s
          operation
        </li>
        <li>Use the service for any illegal or unauthorized purpose</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        5. Billing and Payments
      </h2>
      <p className="mb-12">
        Paid subscriptions are billed in advance on a monthly or annual basis.
        All fees are non-refundable except where required by law. You may cancel
        your subscription at any time. A 14-day free trial is available on all
        paid plans.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        6. Limitation of Liability
      </h2>
      <p className="mb-12 text-gray-600">
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, VECTOR SHALL NOT BE LIABLE FOR
        ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES
        ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">7. Governing Law</h2>
      <p className="mb-8">
        These terms are governed by the laws of the State of California, without
        regard to conflict of law principles.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">8. Contact</h2>
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to site
        </button>
      </nav>

      {/* Hero */}
      <header className="pt-32 pb-12 px-6 max-w-3xl mx-auto border-b border-black/5">
        <h1 className="text-5xl font-black tracking-tight">Terms of Service</h1>
        <p className="mt-4 text-lg text-gray-500">Last updated: March 2026</p>
      </header>

      <TermsContent />

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-black/5 py-12 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Vector Logistics Technologies Inc. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
}
