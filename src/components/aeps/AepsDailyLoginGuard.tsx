"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AEPS_BASE_PATH, AEPS_LOGIN_PATH, isPublicAepsPath } from "@/src/lib/aepsSession";
import { useAepsSessionState } from "@/src/components/aeps/AepsSessionContext";
import PageLoader from "@/src/components/common/PageLoader";

export default function AepsDailyLoginGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { sessionReady, loginDone } = useAepsSessionState();
  const requiresLogin = !isPublicAepsPath(pathname);

  useEffect(() => {
    if (!sessionReady || !requiresLogin || loginDone) return;
    router.replace(AEPS_LOGIN_PATH);
  }, [loginDone, requiresLogin, router, sessionReady]);

  useEffect(() => {
    if (!sessionReady || !loginDone) return;
    if (pathname === AEPS_LOGIN_PATH) {
      router.replace(AEPS_BASE_PATH);
    }
  }, [loginDone, pathname, router, sessionReady]);

  if (!sessionReady && requiresLogin) {
    return <PageLoader message="Checking AEPS session..." />;
  }

  if (requiresLogin && !loginDone) {
    return <PageLoader message="Redirecting to daily login..." />;
  }

  return children;
}
