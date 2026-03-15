import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && emailValid && password.length >= 8) {
      handleSignIn();
    }
  };

  const canSubmit = emailValid && password.length >= 8 && !loading;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <nav className="px-6 py-5 md:px-12 md:py-6 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-emerald-600/10">
            <TruckIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            VECTOR
          </span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[14px] font-bold text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to home
        </button>
      </nav>

      {/* Main Form Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-110 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white border border-black/8 rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/5">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-600/30">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Fleet Dashboard
              </h1>
              <p className="text-[14px] text-gray-400 font-medium">
                Log in to manage your global fleet operations
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-in shake duration-500">
                <p className="text-[13px] text-red-600 font-bold text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Workspace Email
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="you@company.com"
                    className={`w-full h-14 pl-12 pr-12 bg-white border rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none transition-all ${
                      emailValid
                        ? "border-emerald-600 ring-4 ring-emerald-600/5"
                        : "border-black/10 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5"
                    }`}
                  />
                  {emailValid && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your security phrase"
                    className="w-full h-14 pl-12 pr-14 bg-white border border-black/10 rounded-2xl text-[15px] font-medium text-gray-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Forgot access?
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSignIn}
                disabled={!canSubmit}
                className={`w-full h-14 rounded-2xl font-bold text-[15px] transition-all flex items-center justify-center gap-3 cursor-pointer ${
                  canSubmit
                    ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-gray-100 text-gray-300"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Enter Workspace"
                )}
              </button>
            </div>
          </div>

          {/* Secondary Actions */}
          <div className="mt-10 text-center space-y-8">
            <p className="text-[14px] font-medium text-gray-400">
              Don't have a fleet workspace?{" "}
              <button
                onClick={() => navigate("/dashboard/signup")}
                className="text-emerald-600 font-bold hover:underline"
              >
                Create one for free
              </button>
            </p>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-[13px] font-bold text-gray-300 uppercase tracking-widest leading-loose">
                Are you a driver?{" "}
                <button
                  onClick={() => navigate("/signin")}
                  className="text-gray-500 hover:text-gray-900 transition-colors ml-1"
                >
                  Go to Mobile Sign In →
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="py-8 text-center">
        <p className="text-[11px] font-bold text-gray-300 uppercase tracking-[4px]">
          VECTOR v2.5.0 Production Tier
        </p>
      </footer>
    </div>
  );
}
