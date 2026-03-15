import React from "react";
import { ButtonSpinner } from "./Spinner";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: React.ReactNode;
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  type = "button",
  className = "",
  icon,
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-2)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    transition: "all var(--duration-fast) var(--ease-standard)",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    border: "none",
    outline: "none",
    width: fullWidth ? "100%" : "auto",
    position: "relative",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
  };

  const sizeStyles = {
    sm: {
      padding: "var(--spacing-2) var(--spacing-4)",
      fontSize: "var(--text-sm)",
      height: "36px",
    },
    md: {
      padding: "var(--spacing-3) var(--spacing-6)",
      fontSize: "var(--text-base)",
      height: "44px",
    },
    lg: {
      padding: "var(--spacing-4) var(--spacing-8)",
      fontSize: "var(--text-lg)",
      height: "52px",
    },
  };

  const variantStyles = {
    primary: {
      background: "var(--color-primary)",
      color: "white",
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-text-primary)",
      border: "1px solid var(--color-border)",
    },
    outline: {
      background: "transparent",
      color: "var(--color-primary)",
      border: "1px solid var(--color-primary)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
    },
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = "translateY(-1px)";
          if (variant === "primary") {
            e.currentTarget.style.background = "var(--color-primary-hover)";
            e.currentTarget.style.boxShadow = "var(--shadow-md)";
          } else if (variant === "secondary") {
            e.currentTarget.style.background = "var(--color-surface)";
            e.currentTarget.style.borderColor = "var(--color-primary)";
          } else if (variant === "outline") {
            e.currentTarget.style.background = "var(--color-primary-light)";
            e.currentTarget.style.borderColor = "var(--color-primary-hover)";
          } else if (variant === "ghost") {
            e.currentTarget.style.background = "var(--color-surface)";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.background = variantStyles[variant].background;
          if (variant === "secondary" || variant === "outline") {
            e.currentTarget.style.borderColor =
              variant === "outline"
                ? "var(--color-primary)"
                : "var(--color-border)";
          }
        }
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = "translateY(0) scale(0.98)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = "translateY(-1px) scale(1)";
        }
      }}
    >
      {loading ? (
        <>
          <ButtonSpinner />
          {children}
        </>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </button>
  );
}
