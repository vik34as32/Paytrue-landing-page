"use client";

import { useEffect } from "react";
import { useRequireAuth } from "@/src/hooks/useAuth";
import PageLoader from "@/src/components/common/PageLoader";
import IdleSessionGuard from "@/src/components/auth/IdleSessionGuard";

export default function AuthGuard({ children, allowedTypes = [] }) {
  const { hydrated, isAuthenticated } = useRequireAuth(allowedTypes);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      window.location.replace("/auth/login");
    }
  }, [hydrated, isAuthenticated]);

  if (!hydrated) {
    return <PageLoader message="Loading session..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <IdleSessionGuard>{children}</IdleSessionGuard>;
}
