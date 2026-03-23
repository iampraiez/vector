import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import {
  ExclamationCircleIcon,
  ArrowLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  console.error("Router ErrorBoundary caught an error: ", error);

  let errorMessage = "An unexpected error occurred.";
  let status = "Error";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    status = error.status.toString();
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-6 py-12 font-sans selection:bg-red-100">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-12 opacity-40">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <LocalShippingIcon size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-gray-900">
            VECTOR
          </span>
        </div>

        <div className="relative mb-10">
          <div className="text-[120px] font-black text-gray-900/5 leading-none select-none">
            {status}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white border border-black/8 rounded-[28px] shadow-2xl shadow-black/5 flex items-center justify-center animate-bounce-subtle">
              <ExclamationCircleIcon className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
          System Interrupted
        </h1>
        <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg">
          We encountered an unexpected issue while processing your request. Our
          team has been notified.
        </p>

        <div className="bg-red-50/50 border border-red-100/50 rounded-2xl p-5 mb-10 text-left relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-400 opacity-40" />
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">
            Technical Details
          </p>
          <code className="text-xs text-red-700 font-mono break-all leading-relaxed">
            {errorMessage}
          </code>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white border border-black/8 rounded-2xl text-[14px] font-bold text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer group"
          >
            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Try Again
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2.5 px-8 py-4 bg-gray-900 border-none rounded-2xl text-[14px] font-bold text-white shadow-xl shadow-gray-900/20 transition-all hover:bg-gray-800 hover:-translate-y-0.5 cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            Return Home
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-black/5">
          <p className="text-[12px] text-gray-400 font-medium">
            Need immediate help?{" "}
            <a
              href="mailto:support@vector-route.com"
              className="text-emerald-600 font-bold hover:underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
