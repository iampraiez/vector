import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function PrivacyContent() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-[15px] leading-relaxed text-gray-700">
      <h2 className="text-xl font-bold text-gray-900 mb-8">1. Introduction</h2>
      <p className="mb-8">
        This Privacy Policy explains how Vector Logistics Technologies Inc.
        (“Vector”, “we”, “us”, or “our”) collects, uses, and protects your
        personal information when you use our fleet management platform,
        including the website, mobile applications, and related services.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        2. Information We Collect
      </h2>
      <p className="mb-6">
        We collect the following categories of information:
      </p>
      <ul className="list-disc pl-6 space-y-4 mb-8 text-gray-600">
        <li>
          <span className="font-medium text-gray-900">
            Personal Information:
          </span>{" "}
          name, email address, phone number, and billing details provided during
          account registration or subscription.
        </li>
        <li>
          <span className="font-medium text-gray-900">
            Fleet and Operational Data:
          </span>{" "}
          GPS coordinates, delivery addresses, route information, driver
          performance metrics, and proof-of-delivery records.
        </li>
        <li>
          <span className="font-medium text-gray-900">Technical Data:</span> IP
          address, device type, browser information, and usage logs
          automatically collected when you access our services.
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        3. How We Use Your Information
      </h2>
      <p className="mb-8">
        We use the collected information solely for the following purposes:
      </p>
      <ul className="list-disc pl-6 space-y-4 mb-8 text-gray-600">
        <li>
          Providing and improving our route optimization and fleet management
          services
        </li>
        <li>Enabling real-time tracking and customer notifications</li>
        <li>
          Managing accounts, processing payments, and handling subscriptions
        </li>
        <li>Ensuring the security and proper functioning of the platform</li>
        <li>Complying with applicable legal and regulatory requirements</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mb-8">
        4. Data Sharing and Disclosure
      </h2>
      <p className="mb-8">
        We do not sell your personal data. We may share information only in the
        following limited circumstances:
      </p>
      <ul className="list-disc pl-6 space-y-4 mb-8 text-gray-600">
        <li>
          With trusted service providers who assist us in operating the platform
          (e.g., mapping, SMS delivery, payment processors)
        </li>
        <li>With your customers when you send them tracking links</li>
        <li>
          With law enforcement or regulatory authorities when required by law
        </li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mb-8">5. Your Rights</h2>
      <p className="mb-8">You have the right to:</p>
      <ul className="list-disc pl-6 space-y-4 mb-8 text-gray-600">
        <li>Access and obtain a copy of the personal data we hold about you</li>
        <li>Request correction of inaccurate or incomplete data</li>
        <li>
          Request deletion of your account and associated data (subject to legal
          retention obligations)
        </li>
        <li>Opt out of certain processing activities where applicable</li>
      </ul>

      <h2 className="text-xl font-bold text-gray-900 mb-8">6. Data Security</h2>
      <p className="mb-12">
        We implement appropriate technical and organizational measures to
        protect your information against unauthorized access, alteration, or
        destruction.
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-8">7. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at{" "}
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

export function Privacy() {
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
        <h1 className="text-5xl font-black tracking-tight">Privacy Policy</h1>
        <p className="mt-4 text-lg text-gray-500">Last updated: March 2026</p>
      </header>

      <PrivacyContent />

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
