import { useState } from "react";
import { useNavigate } from "react-router";
import { AxiosError } from "axios";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { TruckIcon } from "@heroicons/react/24/solid";

import { useAuthStore } from "../../../store/authStore";
import { api } from "../../../lib/api";
import { signInSchema, SignInValues } from "../../../lib/validations";
import { ErrorAlert } from "../../../components/ui/ErrorAlert";

export function DashboardSignIn() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
  });

  const emailValue = useWatch({ control, name: "email" });
  const emailValid = !errors.email && emailValue?.length > 0;

  const onSubmit = async (data: SignInValues) => {
    setGlobalError("");
    try {
      const res = await api.post("/auth/sign-in", {
        email: data.email,
        password: data.password,
        device_id: navigator.userAgent,
      });

      const { user, access_token, refresh_token } = res.data;
      setAuth(user, access_token, refresh_token);

      navigate("/dashboard");
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      const msg =
        error.response?.data?.message ||
        "Failed to sign in. Please check your credentials.";

      setGlobalError(msg);

      // If backend signals unverified email, redirect to verify page immediately
      if (msg.toLowerCase().includes("verify your email")) {
        navigate(
          `/dashboard/verify-email?email=${encodeURIComponent(data.email)}`,
        );
      }
    }
  };

  const canSubmit = isValid && !isSubmitting;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <nav className="px-6 py-4 md:px-12 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-linear-to-br from-emerald-600 to-emerald-800 group-hover:opacity-90 transition-opacity">
            <TruckIcon className="w-5 h-5 text-white" />
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

            {/* Global Error Message */}
            {globalError && (
              <div className="mb-5">
                <ErrorAlert
                  message={globalError}
                  onDismiss={() => setGlobalError("")}
                />
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    {...register("email")}
                    placeholder="name@company.com"
                    className={`w-full h-12 pl-11 pr-11 bg-white border rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none transition-all ${
                      errors.email
                        ? "border-red-500 focus:ring-4 focus:ring-red-600/10"
                        : emailValid
                          ? "border-emerald-500 ring-4 ring-emerald-600/5"
                          : "border-black/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5"
                    }`}
                  />
                  {emailValid && !errors.email && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                      <CheckCircleIcon className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
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
                    {...register("password")}
                    placeholder="••••••••"
                    className={`w-full h-12 pl-11 pr-12 bg-white border rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none transition-all ${
                      errors.password
                        ? "border-red-500 focus:ring-4 focus:ring-red-600/10"
                        : "border-black/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5"
                    }`}
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
                {errors.password && (
                  <p className="text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
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
                {isSubmitting ? (
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
