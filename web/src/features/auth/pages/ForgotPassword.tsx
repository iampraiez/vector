import { useState } from "react";
import { useNavigate } from "react-router";
import {
  TruckIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = () => {
    if (!emailValid || loading) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <nav className="px-6 py-4 md:px-12 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800 group-hover:opacity-90 transition-opacity">
            <TruckIcon className="w-4.5 h-4.5 text-white" strokeWidth={2.4} />
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-gray-900">
            VECTOR
          </span>
        </div>

        <button
          onClick={() => navigate("/dashboard/signin")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to sign in
        </button>
      </nav>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 pt-12 md:pt-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border border-black/8 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5">
            {!sent ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl md:text-[28px] font-extrabold text-gray-900 mb-1.5 tracking-tight">
                    Reset password
                  </h1>
                  <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                    Enter your account email and we'll send you a reset link.
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5 mb-6">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Email address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                      <EnvelopeIcon className="w-4.5 h-4.5" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="you@company.com"
                      className={`w-full h-12 pl-11 pr-11 bg-white border rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none transition-all ${
                        emailValid
                          ? "border-emerald-500 ring-4 ring-emerald-600/5"
                          : "border-black/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5"
                      }`}
                    />
                    {emailValid && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                        <CheckCircleIcon className="w-4.5 h-4.5 text-emerald-600" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  id="forgot-submit"
                  onClick={handleSubmit}
                  disabled={!emailValid || loading}
                  className={`w-full h-12 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                    emailValid && !loading
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              /* ── Success State ── */
              <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-6">
                  <InboxIcon className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-[22px] font-extrabold text-gray-900 mb-2 tracking-tight">
                  Check your inbox
                </h2>
                <p className="text-[14px] text-gray-400 font-medium leading-relaxed mb-8">
                  We've sent a password reset link to{" "}
                  <span className="font-bold text-gray-700">{email}</span>. It
                  may take a minute to arrive.
                </p>
                <button
                  onClick={() => navigate("/dashboard/signin")}
                  className="flex items-center gap-2 mx-auto text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  Back to sign in
                </button>
              </div>
            )}
          </div>

          {/* Footer fine print */}
          {!sent && (
            <div className="mt-5 text-center">
              <p className="text-[12px] text-gray-300 font-medium">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/dashboard/signup")}
                  className="text-gray-400 hover:text-emerald-600 transition-colors font-semibold"
                >
                  Sign up free →
                </button>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
