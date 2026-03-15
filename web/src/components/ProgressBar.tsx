interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = false,
  label,
  className = "",
}: ProgressBarProps) {
  return (
    <div className={className}>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "var(--spacing-xs)",
          }}
        >
          <span
            style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}
          >
            {label}
          </span>
          <span
            style={{
              fontSize: "13px",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
            }}
          >
            {value}%
          </span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: "6px",
          background: "var(--color-primary-light)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "var(--color-primary)",
            borderRadius: "3px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

export function IndeterminateProgress({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "4px",
        background: "var(--color-primary-light)",
        borderRadius: "2px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          height: "100%",
          width: "30%",
          background: "var(--color-primary)",
          borderRadius: "2px",
          animation: "progress 1.5s ease-in-out infinite",
        }}
      />
    </div>
  );
}
