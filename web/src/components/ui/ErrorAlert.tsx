import { useEffect, useState } from "react";
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

type AlertVariant = "error" | "success" | "warning";

interface ErrorAlertProps {
  message: string;
  variant?: AlertVariant;
  autoDismissMs?: number;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<
  AlertVariant,
  { container: string; icon: React.ReactNode }
> = {
  error: {
    container: "bg-red-50 border-red-200 text-red-700",
    icon: <XCircleIcon className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />,
  },
  success: {
    container: "bg-emerald-50 border-emerald-200 text-emerald-700",
    icon: (
      <CheckCircleIcon className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
    ),
  },
  warning: {
    container: "bg-amber-50 border-amber-200 text-amber-700",
    icon: (
      <ExclamationTriangleIcon className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
    ),
  },
};

export function ErrorAlert({
  message,
  variant = "error",
  autoDismissMs = 6000,
  onDismiss,
  className = "",
}: ErrorAlertProps) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);
    return () => clearTimeout(timer);
  }, [message, autoDismissMs, onDismiss]);

  if (!visible || !message) return null;

  const { container, icon } = variantStyles[variant];

  return (
    <div
      className={`flex items-start gap-3 p-3.5 border rounded-xl text-[13px] font-medium animate-in slide-in-from-top-2 fade-in duration-300 ${container} ${className}`}
    >
      {icon}
      <p className="flex-1 leading-relaxed">{message}</p>
      {/* <button
        type="button"
        onClick={() => {
          setVisible(false);
          onDismiss?.();
        }}
        className="ml-auto text-current/50 hover:text-current/80 transition-colors shrink-0"
      >
        <XMarkIcon className="w-4 h-4" />
      </button> */}
    </div>
  );
}
