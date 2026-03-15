import React from "react";

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function Input({
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  icon,
  fullWidth = false,
  className = "",
}: InputProps) {
  return (
    <div style={{ width: fullWidth ? "100%" : "auto" }} className={className}>
      {label && (
        <label
          style={{
            display: "block",
            marginBottom: "var(--spacing-2)",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative", width: "100%" }}>
        {icon && (
          <div
            style={{
              position: "absolute",
              left: "var(--spacing-4)",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: "100%",
            padding: icon
              ? "var(--spacing-3) var(--spacing-3) var(--spacing-3) 44px"
              : "var(--spacing-3) var(--spacing-4)",
            fontSize: "var(--text-base)",
            color: "var(--color-text-primary)",
            background: "white",
            border: `2px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            outline: "none",
            transition: "all var(--duration-fast) var(--ease-standard)",
            fontWeight: "var(--weight-regular)",
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.boxShadow =
                "0 0 0 3px var(--color-primary-light)";
            } else {
              e.currentTarget.style.boxShadow =
                "0 0 0 3px rgba(239, 68, 68, 0.1)";
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = "var(--color-border)";
            }
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
      {error && (
        <p
          style={{
            marginTop: "var(--spacing-2)",
            fontSize: "var(--text-sm)",
            color: "var(--color-error)",
            fontWeight: "var(--weight-medium)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
