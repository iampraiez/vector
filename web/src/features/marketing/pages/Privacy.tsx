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

export function PrivacyContent() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 text-[15px] leading-relaxed text-gray-600">
      <SectionHeading>1. Introduction</SectionHeading>
      <p className="mb-6 text-gray-700">
        This Privacy Policy explains how Vector Logistics Technologies Inc.
        ("Vector", "we", "us", or "our") collects, uses, and protects your
        personal information when you use our fleet management platform,
        including the website, mobile applications, and related services.
      </p>

      <SectionHeading>2. Information We Collect</SectionHeading>
      <p className="mb-4">
        We collect the following categories of information:
      </p>
      <ul className="list-disc pl-6 space-y-3 mb-6">
        <li>
          <span className="font-medium text-gray-800">
            Personal Information:
          </span>{" "}
          name, email address, phone number, and billing details provided during
          account registration or subscription.
        </li>
        <li>
          <span className="font-medium text-gray-800">
            Fleet and Operational Data:
          </span>{" "}
          GPS coordinates, delivery addresses, route information, driver
          performance metrics, and proof-of-delivery records.
        </li>
        <li>
          <span className="font-medium text-gray-800">Technical Data:</span> IP
          address, device type, browser information, and usage logs
          automatically collected when you access our services.
        </li>
      </ul>

      <SectionHeading>3. How We Use Your Information</SectionHeading>
      <p className="mb-4">
        We use the collected information solely for the following purposes:
      </p>
      <ul className="list-disc pl-6 space-y-3 mb-6">
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

      <SectionHeading>4. Data Sharing and Disclosure</SectionHeading>
      <p className="mb-4">
        We do not sell your personal data. We may share information only in the
        following limited circumstances:
      </p>
      <ul className="list-disc pl-6 space-y-3 mb-6">
        <li>
          With trusted service providers who assist us in operating the platform
          (e.g., mapping, SMS delivery, payment processors)
        </li>
        <li>With your customers when you send them tracking links</li>
        <li>
          With law enforcement or regulatory authorities when required by law
        </li>
      </ul>

      <SectionHeading>5. Your Rights</SectionHeading>
      <p className="mb-4">You have the right to:</p>
      <ul className="list-disc pl-6 space-y-3 mb-6">
        <li>Access and obtain a copy of the personal data we hold about you</li>
        <li>Request correction of inaccurate or incomplete data</li>
        <li>
          Request deletion of your account and associated data (subject to legal
          retention obligations)
        </li>
        <li>Opt out of certain processing activities where applicable</li>
      </ul>

      <SectionHeading>6. Data Security</SectionHeading>
      <p className="mb-6">
        We implement appropriate technical and organizational measures to
        protect your information against unauthorized access, alteration, or
        destruction.
      </p>

      <SectionHeading>7. Contact Us</SectionHeading>
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
      <Helmet>
        <title>Privacy Policy | Vector</title>
        <link rel="canonical" href="https://vector-fleet.vercel.app/privacy" />
        <meta
          property="og:image"
          content="https://vector-fleet.vercel.app/icon.png"
        />
        <meta
          property="twitter:image"
          content="https://vector-fleet.vercel.app/icon.png"
        />
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-[13px] text-gray-400">
          Last updated: March 2026
        </p>
      </header>

      <PrivacyContent />

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
