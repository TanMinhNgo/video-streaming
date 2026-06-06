import { useAuth } from "@clerk/clerk-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return (
      <div className="space-y-3" aria-label="Đang kiểm tra đăng nhập">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isSignedIn) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`} replace />;
  }

  return children;
}
