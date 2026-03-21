import { LocalShippingIcon } from "./icons/LocalShippingIcon";

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({
  show,
  message,
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={`
        ${fullScreen ? "fixed" : "absolute"} 
        inset-0 z-1000 flex flex-col items-center justify-center 
        bg-white/80 backdrop-blur-[6px] transition-all duration-300
      `}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        {/* Pulsing Brand Skeleton */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-[22px] flex items-center justify-center shadow-2xl shadow-emerald-600/20 animate-pulse">
            <LocalShippingIcon size={32} className="text-white" />
          </div>
          <div className="absolute -inset-2 bg-emerald-600/10 rounded-[30px] animate-ping duration-2000" />
        </div>

        {message && (
          <div className="space-y-2 text-center">
            <p className="text-[15px] font-bold text-gray-900 tracking-tight">
              {message}
            </p>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600/40 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600/40 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600/40 animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
