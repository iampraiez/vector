import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export function DashboardSignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(value));
    if (error) setError("");
  };

  const handleSignIn = () => {
    if (!emailValid || password.length < 8) return;
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1500);
  };

  const canSubmit = emailValid && password.length >= 8 && !loading;

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
          <span className="text-[16px] font-extrabold tracking-[0.04em] text-gray-900">
            VECTOR
          </span>
        </div>

        <button
          onClick={() => navigate("/dashboard/signup")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-emerald-600 transition-colors cursor-pointer"
        >
          Don't have an account?
          <span className="font-bold text-emerald-600">Sign up</span>
          <ArrowRightIcon className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </nav>

      {/* Main Form Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 pt-12 md:pt-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Form Card */}
          <div className="bg-white border border-black/8 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-[28px] font-extrabold text-gray-900 mb-1.5 tracking-tight">
                Welcome back
              </h1>
              <p className="text-[14px] text-gray-400 font-medium">
                Sign in to manage your fleet operations
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-[13px] text-red-600 font-semibold text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Form Fields */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSignIn();
              }}
              className="space-y-5"
            >
              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="signin-email"
                  className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                >
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                    <EnvelopeIcon className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="name@company.com"
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

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="signin-password"
                    className="text-[11px] font-bold text-gray-400 uppercase tracking-widest"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard/forgot-password")}
                    className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                    <LockClosedIcon className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-12 bg-white border border-black/10 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-500 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4.5 h-4.5" />
                    ) : (
                      <EyeIcon className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="signin-submit"
                disabled={!canSubmit}
                className={`w-full h-12 mt-2 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  canSubmit
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[12px] text-gray-300 font-medium">
              Are you a driver?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-gray-400 hover:text-gray-700 transition-colors font-semibold"
              >
                Go to Mobile Sign In →
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
