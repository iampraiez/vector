interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "white";
  className?: string;
}

export function Spinner({
  size = "md",
  color = "primary",
  className = "",
}: SpinnerProps) {
  const sizeMap = {
    sm: "16px",
    md: "24px",
    lg: "40px",
  };

  const colorMap = {
    primary: "var(--color-primary)",
    white: "#FFFFFF",
  };

  return (
    <div
      className={`animate-spin ${className}`}
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `3px solid ${color === "primary" ? "var(--color-primary-light)" : "rgba(255, 255, 255, 0.3)"}`,
        borderTopColor: colorMap[color],
        borderRadius: "50%",
      }}
      role="status"
      aria-label="Loading"
    />
  );
}

interface ButtonSpinnerProps {
  className?: string;
}

export function ButtonSpinner({ className = "" }: ButtonSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Spinner size="sm" color="white" />
    </div>
  );
}
