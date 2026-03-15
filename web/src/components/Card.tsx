import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className = "",
  onClick,
  padding = "md",
  hover = false,
}: CardProps) {
  const paddingMap = {
    sm: "var(--spacing-4)",
    md: "var(--spacing-6)",
    lg: "var(--spacing-8)",
  };

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: "white",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        padding: paddingMap[padding],
        cursor: onClick ? "pointer" : "default",
        transition: "all var(--duration-fast) var(--ease-standard)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
          e.currentTarget.style.borderColor = "var(--color-primary)";
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (hover || onClick) {
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
          e.currentTarget.style.borderColor = "var(--color-border)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </div>
  );
}
