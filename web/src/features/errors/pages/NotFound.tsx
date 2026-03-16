import { Link } from "react-router";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-black/5 max-w-md w-full border border-black/5">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <ExclamationTriangleIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-black text-[13px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all w-full"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
