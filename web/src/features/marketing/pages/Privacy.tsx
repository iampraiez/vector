import { useNavigate } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function PrivacyContent({
  className = "py-16 px-6 max-w-4xl mx-auto space-y-12",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          1. Introduction
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          Welcome to Vector. This Privacy Policy explanation describes how our
          company ("we", "us", or "our") collects, uses, and shares your
          personal information when you use our logistics and fleet management
          platform. By accessing or using Vector, you agree to the collection
          and use of information in accordance with this policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          2. Information We Collect
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">
              Personal Information
            </h3>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              We collect personal information that you provide directly to us
              when you create an account, such as your name, email address,
              company name, and payment information.
            </p>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">
              Fleet and Logistics Data
            </h3>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              Our platform processes operational data including driver names,
              delivery addresses, order details, and real-time GPS coordinates
              to provide fleet management and tracking services.
            </p>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-gray-800 mb-2">
              Usage and Device Data
            </h3>
            <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
              We automatically collect certain information when you visit
              Vector, including your IP address, browser type, device
              information, and how you interact with our services.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          3. How We Use Your Information
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          We use your information for various purposes, including:
        </p>
        <ul className="list-disc list-inside space-y-2 text-[15px] text-gray-600 font-medium pl-2">
          <li>Providing, maintaining, and improving our services</li>
          <li>Processing transactions and managing subscriptions</li>
          <li>Enabling real-time tracking and delivery status updates</li>
          <li>Optimizing delivery routes and fleet efficiency</li>
          <li>
            Communicating with you about updates, security alerts, and support
          </li>
          <li>Compliance with legal obligations and fraud prevention</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          4. Data Sharing and Disclosure
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          We do not sell your personal data. We may share your information with:
        </p>
        <ul className="list-disc list-inside space-y-2 text-[15px] text-gray-600 font-medium pl-2">
          <li>
            Service providers who assist in our operations (e.g., cloud hosting,
            payment processing)
          </li>
          <li>
            Designated recipients of delivery tracking information (as
            configured by your fleet settings)
          </li>
          <li>
            Legal authorities when required by law or to protect our rights
          </li>
          <li>Business partners in the event of a merger or acquisition</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          5. Data Security
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          We implement industry-standard security measures to protect your data,
          including encryption in transit (SSL/TLS) and at rest. However, no
          method of transmission over the Internet is 100% secure, and we cannot
          guarantee absolute security.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          6. Your Data Rights
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          Depending on your location, you may have the following rights
          regarding your personal information:
        </p>
        <ul className="list-disc list-inside space-y-2 text-[15px] text-gray-600 font-medium pl-2">
          <li>The right to access the data we hold about you</li>
          <li>The right to request correction of inaccurate information</li>
          <li>
            The right to request deletion of your data (under certain
            conditions)
          </li>
          <li>The right to object to or restrict processing of your data</li>
          <li>The right to data portability</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          7. Changes to This Policy
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the "Last Updated" date at the top.
        </p>
      </section>

      <section className="pt-8 border-t border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">
          Contact Us
        </h2>
        <p className="text-[15px] text-gray-600 leading-relaxed font-medium mb-4">
          If you have any questions about this Privacy Policy, please contact
          us:
        </p>
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <p className="text-[14px] font-bold text-gray-900">Privacy Team</p>
          <p className="text-[14px] text-gray-500 font-medium">
            himpraise571@gmail.com
          </p>
          <p className="text-[14px] text-gray-500 font-medium mt-1">
            123 Logistics Way, Suite 100, San Francisco, CA 94107
          </p>
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
            Vector
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
