interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

export function Skeleton({
  width = "100%",
  height = "20px",
  className = "",
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer ${className}`}
      style={{
        width,
        height,
        borderRadius: circle ? "50%" : "var(--radius-sm)",
        background:
          "linear-gradient(to right, var(--color-surface) 0%, #F0F0F0 50%, var(--color-surface) 100%)",
        backgroundSize: "1000px 100%",
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        background: "white",
        padding: "var(--spacing-md)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Skeleton height="24px" width="60%" className="mb-3" />
      <Skeleton height="16px" width="100%" className="mb-2" />
      <Skeleton height="16px" width="80%" className="mb-4" />
      <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
        <Skeleton height="32px" width="80px" />
        <Skeleton height="32px" width="80px" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-sm)",
      }}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "var(--spacing-md)",
            padding: "var(--spacing-md)",
            background: "white",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Skeleton circle width="40px" height="40px" />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-xs)",
            }}
          >
            <Skeleton height="16px" width="40%" />
            <Skeleton height="14px" width="60%" />
          </div>
          <Skeleton height="32px" width="80px" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 6 }: { items?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-sm)",
      }}
    >
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "var(--spacing-md)",
            padding: "var(--spacing-md)",
            background: "white",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div style={{ flex: 1 }}>
            <Skeleton height="18px" width="70%" className="mb-2" />
            <Skeleton height="14px" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}
