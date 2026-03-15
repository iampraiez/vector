type Priority = "normal" | "high" | "urgent" | "critical";
type Status =
  | "pending"
  | "assigned"
  | "active"
  | "in-progress"
  | "completed"
  | "failed"
  | "unassigned";

interface StatusBadgeProps {
  type: "priority" | "status";
  value: Priority | Status;
  size?: "sm" | "md";
}

export function StatusBadge({ type, value, size = "md" }: StatusBadgeProps) {
  const sizeStyles = {
    sm: {
      padding: "4px 10px",
      fontSize: "var(--text-xs)",
      height: "22px",
    },
    md: {
      padding: "6px 12px",
      fontSize: "var(--text-xs)",
      height: "26px",
    },
  };

  const priorityStyles: Record<
    Priority,
    { bg: string; color: string; label: string }
  > = {
    normal: {
      bg: "var(--color-surface)",
      color: "var(--color-text-secondary)",
      label: "Normal",
    },
    high: {
      bg: "#FEE2E2",
      color: "#DC2626",
      label: "High Priority",
    },
    urgent: {
      bg: "#FEF3C7",
      color: "#D97706",
      label: "Urgent",
    },
    critical: {
      bg: "#FEE2E2",
      color: "#991B1B",
      label: "Critical",
    },
  };

  const statusStyles: Record<
    Status,
    { bg: string; color: string; label: string }
  > = {
    pending: {
      bg: "#F3F4F6",
      color: "#6B7280",
      label: "Pending",
    },
    unassigned: {
      bg: "#F3F4F6",
      color: "#6B7280",
      label: "Unassigned",
    },
    assigned: {
      bg: "#DBEAFE",
      color: "#1E40AF",
      label: "Assigned",
    },
    active: {
      bg: "var(--color-primary)",
      color: "white",
      label: "In Progress",
    },
    "in-progress": {
      bg: "var(--color-primary)",
      color: "white",
      label: "In Progress",
    },
    completed: {
      bg: "#DCFCE7",
      color: "#16A34A",
      label: "Completed",
    },
    failed: {
      bg: "#FEE2E2",
      color: "#DC2626",
      label: "Failed",
    },
  };

  const styles =
    type === "priority"
      ? priorityStyles[value as Priority]
      : statusStyles[value as Status];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...sizeStyles[size],
        background: styles.bg,
        color: styles.color,
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
        userSelect: "none",
      }}
    >
      {styles.label}
    </div>
  );
}
