"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layouts/navbar/Navbar";

const PUBLIC_ROUTES = ["/login"];

export function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
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
  }, [isAuthenticated, isLoading, isPublicRoute, router]);

  return (
    <>
      {!isPublicRoute && <Navbar />}
      {children}
    </>
  );
}
