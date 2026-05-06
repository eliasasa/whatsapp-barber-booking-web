"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const PUBLIC_ROUTES = ["/login"];

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (isLoading) {
      return; // Still loading auth state
    }

    if (!isPublicRoute && !isAuthenticated) {
      // User is not authenticated and trying to access protected route
      void checkAuth().then((isValid) => {
        if (!isValid) {
          router.push("/login");
        }
      });
    } else if (isPublicRoute && isAuthenticated) {
      // User is authenticated and trying to access public route (login)
      router.push("/");
    }
  }, [isAuthenticated, isLoading, pathname, checkAuth, router]);

  return <>{children}</>;
}
