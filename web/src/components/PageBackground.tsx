import { ReactNode } from "react";

interface PageBackgroundProps {
  children: ReactNode;
}

export function PageBackground({ children }: PageBackgroundProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAF9",
        position: "relative",
        maxWidth: "480px",
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", minHeight: "100vh" }}>{children}</div>
    </div>
  );
}
