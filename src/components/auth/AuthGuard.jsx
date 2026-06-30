"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/src/hooks/useAuth";
import PageLoader from "@/src/components/common/PageLoader";

export default function AuthGuard({ children, allowedTypes = [] }) {
  const { hydrated, isAuthenticated } = useRequireAuth(allowedTypes);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return <PageLoader message="Loading session..." />;
  }

  if (!isAuthenticated) {
    return <PageLoader message="Redirecting to login..." />;
  }

  return children;
}
