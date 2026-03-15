import { Spinner } from "./Spinner";

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
      style={{
        position: fullScreen ? "fixed" : "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(255, 255, 255, 0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-md)",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
      }}
    >
      <Spinner size="lg" />
      {message && (
        <p
          style={{
            fontSize: "15px",
            color: "var(--color-text-secondary)",
            fontWeight: 500,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
