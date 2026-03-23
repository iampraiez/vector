import { useNavigate } from "react-router";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { LocalShippingIcon } from "../../../components/icons/LocalShippingIcon";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-center px-6 py-12 font-sans selection:bg-emerald-100">
      {/* Background patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[120px]" />
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
          <div className="text-[140px] font-black text-gray-900/5 leading-none select-none tracking-tighter">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white border border-black/8 rounded-[28px] shadow-2xl shadow-black/5 flex items-center justify-center">
              <div className="relative">
                <MagnifyingGlassIcon className="w-10 h-10 text-emerald-600" />
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 absolute -bottom-1 -right-1" />
              </div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Page Not Found
        </h1>
        <p className="text-gray-500 font-medium leading-relaxed mb-12 text-lg">
          The route you requested could not be found. It might have been moved,
          renamed, or perhaps it never existed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-8 py-4 bg-white border border-black/8 rounded-2xl text-[14px] font-bold text-gray-900 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-bold text-[14px] rounded-2xl shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            Return Home
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-black/5">
          <p className="text-[12px] text-gray-400 font-medium">
            Lost your way?{" "}
            <a
              href="/track"
              className="text-emerald-600 font-bold hover:underline"
            >
              Track a Delivery
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
