import { useRouteError, isRouteErrorResponse, Link } from "react-router";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export function ErrorPage() {
  const error = useRouteError();
  console.error("Router ErrorBoundary caught an error: ", error);

  let errorMessage = "An unexpected error occurred.";
  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-black/5 max-w-md w-full border border-black/5">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationCircleIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Oops!</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Something went wrong
        </h2>
        <p className="text-sm text-red-600/80 bg-red-50 p-3 rounded-xl mb-8 font-mono break-all text-left">
          {errorMessage}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-gray-100 text-gray-600 font-black text-[13px] rounded-2xl hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-black text-[13px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
