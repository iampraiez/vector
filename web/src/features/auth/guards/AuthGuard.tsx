import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../../../store/authStore";
import { Skeleton } from "../../../components/ui/skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const _hydrated = useAuthStore((state) => state._hydrated);
  const location = useLocation();

  // If not authenticated, redirect to signin immediately (don't wait for hydration)
  if (!isAuthenticated) {
    return (
      <Navigate to="/dashboard/signin" state={{ from: location }} replace />
    );
  }

  // Show skeleton only if authenticated but still hydrating
  if (!_hydrated) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
        <div className="max-w-300 mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-96 max-w-full" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
