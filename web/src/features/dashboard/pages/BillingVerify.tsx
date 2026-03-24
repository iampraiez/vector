import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../../lib/api";
import { toast } from "sonner";

interface VerificationState {
  status: "loading" | "success" | "failed" | "pending";
  message: string;
  reference?: string;
}

export function BillingVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<VerificationState>({
    status: "loading",
    message: "Verifying your payment...",
  });
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.get("reference");

        if (!reference) {
          setState({
            status: "failed",
            message: "No payment reference found",
          });
          return;
        }

        // Call backend to verify the payment
        const response = await api.post("/dashboard/billing/verify", {
          reference,
        });

        if (response.status === 200 && response.data?.success) {
          setState({
            status: "success",
            message: "Payment verified successfully!",
            reference,
          });
          toast.success("Payment confirmed! Your plan is now active.");
          setCountdown(3);
        } else {
          setState({
            status: "pending",
            message:
              "Payment is being processed. Please check your billing page shortly.",
            reference,
          });
          setCountdown(3);
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setState({
          status: "failed",
          message:
            error instanceof Error
              ? error.message
              : "Payment verification failed. Please check your billing page.",
        });
        toast.error("Payment verification failed");
        setCountdown(3);
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Countdown and redirect timer
  useEffect(() => {
    if (state.status === "loading") return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/dashboard/billing");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center border border-black/5">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          {state.status === "loading" && (
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
            </div>
          )}
          {state.status === "success" && (
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
              <CheckCircleIcon className="w-10 h-10 text-emerald-600 relative z-10" />
            </div>
          )}
          {state.status === "failed" && (
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center relative">
              <XCircleIcon className="w-10 h-10 text-red-600" />
            </div>
          )}
          {state.status === "pending" && (
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center relative">
              <ClockIcon className="w-10 h-10 text-amber-600" />
            </div>
          )}
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {state.status === "loading" && "Verifying Payment"}
          {state.status === "success" && "Payment Successful!"}
          {state.status === "failed" && "Payment Failed"}
          {state.status === "pending" && "Payment Processing"}
        </h1>

        <p className="text-gray-600 mb-2">{state.message}</p>

        {state.reference && (
          <p className="text-[12px] text-gray-500 mt-4 font-mono bg-gray-50 p-3 rounded-xl break-all">
            Ref: {state.reference}
          </p>
        )}

        {state.status !== "loading" && (
          <div className="mt-8 text-sm text-gray-500">
            Redirecting to billing page in{" "}
            <span className="font-bold text-gray-700">{countdown}</span> second
            {countdown !== 1 ? "s" : ""}...
          </div>
        )}
      </div>
    </div>
  );
}
