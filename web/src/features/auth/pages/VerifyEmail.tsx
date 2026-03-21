import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { AxiosError } from "axios";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { api } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";

export function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email in URL, we might want to redirect back to signup or signin
      // setGlobalError("Email address missing. Please try signing in again.");
    }
  }, [location]);

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const onVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setGlobalError("Please enter the full 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    setGlobalError("");
    try {
      const res = await api.post("/auth/verify-email", {
        email,
        token: code,
      });

      const { user, access_token, refresh_token } = res.data;
      if (user && access_token) {
        useAuthStore.getState().setAuth(user, access_token, refresh_token);
        setSuccessMessage("Account verified! Logging you in...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setSuccessMessage("Email verified successfully!");
        setTimeout(() => {
          navigate("/dashboard/signin");
        }, 2000);
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setGlobalError(
        error.response?.data?.message ||
          "Verification failed. Please check the code.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email) {
      setGlobalError("Please enter your email to resend the code.");
      return;
    }

    setResending(true);
    setGlobalError("");
    try {
      await api.post("/auth/resend-verification", { email });
      setSuccessMessage("A new verification code has been sent.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      setGlobalError(error.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Nav */}
      <nav className="px-6 py-4 md:px-12 bg-white border-b border-black/5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-600 group-hover:opacity-90 transition-opacity -translate-y-px">
            <LocalShippingIcon size={18} className="text-white" />
          </div>
          <span className="text-[18px] font-bold tracking-tight text-gray-900">
            VECTOR
          </span>
        </Link>
        <button
          onClick={() => navigate("/dashboard/signin")}
          className="text-[13px] font-bold text-gray-500 hover:text-emerald-600 transition-colors"
        >
          Cancel
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-20">
        <div className="w-full max-w-md">
          <div className="bg-white border border-black/8 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <EnvelopeIcon className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
                Verify your email
              </h1>
              <p className="text-[14px] text-gray-500 font-medium">
                We've sent a 6-digit verification code to
                <br />
                <span className="font-bold text-gray-900">
                  {email || "your email"}
                </span>
              </p>
            </div>

            {globalError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                <p className="text-[13px] text-red-600 font-semibold">
                  {globalError}
                </p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center animate-in zoom-in duration-300">
                <p className="text-[13px] text-emerald-600 font-semibold flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-4 h-4" />
                  {successMessage}
                </p>
              </div>
            )}

            <form onSubmit={onVerify}>
              <div className="flex justify-between gap-2.5 mb-8">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className="w-full h-14 bg-gray-50 border-2 border-transparent rounded-xl text-center text-xl font-black text-gray-900 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-600/5 transition-all outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.some((d) => !d)}
                className={`w-full h-13 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 ${
                  isSubmitting || otp.some((d) => !d)
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Verify Account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[13px] text-gray-400 font-medium">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={onResend}
                disabled={resending}
                className="mt-1 text-[13px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center justify-center gap-1.5 mx-auto px-4 py-2 rounded-lg hover:bg-emerald-50"
              >
                {resending ? (
                  <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4" />
                )}
                Resend Code
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate("/dashboard/signin")}
            className="mt-8 flex items-center gap-2 text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors mx-auto group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Sign In
          </button>
        </div>
      </main>
    </div>
  );
}
