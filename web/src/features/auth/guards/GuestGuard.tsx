import { Navigate } from "react-router";
import { useAuthStore } from "../../../store/authStore";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    // Redirect them to the dashboard if they are already logged in
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
