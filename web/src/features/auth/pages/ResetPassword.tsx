import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";
import { api } from "../../../lib/api";
import { AxiosError } from "axios";
import { ErrorAlert } from "../../../components/ui/ErrorAlert";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [token]);

  const passwordRequirements = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const matches = password === confirmPassword && password !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isPasswordValid || !matches || loading) return;

    setLoading(true);
    setError(null);

    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/signin"), 3000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(
        axiosError.response?.data?.message ||
          "Failed to reset password. The link may be expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white border border-black/8 rounded-2xl p-10 shadow-xl text-center animate-in zoom-in duration-500">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-6">
            <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Password reset!
          </h1>
          <p className="text-sm text-gray-400 font-medium mb-8">
            Your password has been updated successfully. Redirecting you to sign
            in...
          </p>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full animate-[progress_3s_linear_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <nav className="px-6 py-4 md:px-12 bg-white border-b border-black/5 flex items-center justify-between">
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-emerald-600 group-hover:opacity-90 transition-opacity translate-y-[-1px]">
            <LocalShippingIcon size={18} className="text-white" />
          </div>
          <span className="text-[18px] font-extrabold tracking-tight text-gray-900">
            VECTOR
          </span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-start p-6 md:p-12 pt-12 md:pt-16">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          {error && (
            <ErrorAlert message={error} variant="error" className="mb-6" />
          )}

          <div className="bg-white border border-black/8 rounded-2xl p-8 md:p-10 shadow-xl shadow-black/5">
            <div className="mb-8">
              <h1 className="text-2xl md:text-[28px] font-extrabold text-gray-900 mb-1.5 tracking-tight">
                New password
              </h1>
              <p className="text-[14px] text-gray-400 font-medium leading-relaxed">
                Please enter your new secure password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                    <LockClosedIcon className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!!error || loading}
                    className="w-full h-12 pl-11 pr-11 bg-white border border-black/10 rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-4.5 h-4.5" />
                    ) : (
                      <EyeIcon className="w-4.5 h-4.5" />
                    )}
                  </button>
                </div>

                {/* Requirements */}
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.length ? "bg-emerald-500" : "bg-gray-300"}`}
                    />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${passwordRequirements.length ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      Min. 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.number ? "bg-emerald-500" : "bg-gray-300"}`}
                    />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${passwordRequirements.number ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      At least one number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${passwordRequirements.special ? "bg-emerald-500" : "bg-gray-300"}`}
                    />
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${passwordRequirements.special ? "text-emerald-600" : "text-gray-400"}`}
                    >
                      One special character
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-600 transition-colors">
                    <CheckCircleIcon className="w-4.5 h-4.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={!!error || loading}
                    className={`w-full h-12 pl-11 pr-11 bg-white border rounded-xl text-[14px] font-medium text-gray-900 focus:outline-none transition-all ${
                      matches
                        ? "border-emerald-500 ring-4 ring-emerald-600/5"
                        : "border-black/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-600/5"
                    }`}
                  />
                  {matches && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 animate-in zoom-in duration-300">
                      <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                        Match
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid || !matches || loading || !!error}
                className={`w-full h-12 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  isPasswordValid && matches && !loading && !error
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-4.5 h-4.5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset password
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400 font-medium">
            Didn't mean to reset?{" "}
            <button
              onClick={() => navigate("/dashboard/signin")}
              className="text-emerald-600 font-bold hover:underline"
            >
              Back to sign in
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
