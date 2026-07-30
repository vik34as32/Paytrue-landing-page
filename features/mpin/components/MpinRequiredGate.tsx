"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import PageLoader from "@/src/components/common/PageLoader";
import { fetchMpinStatus } from "../services/mpinApi";

const CREATE_PATH = "/rt/retailer/mpin/create";
const CHANGE_PATH = "/rt/retailer/mpin/change";

/**
 * Forces retailers without an MPIN onto the create flow.
 * Change page redirects to create when MPIN is missing.
 */
export function MpinRequiredGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const isCreate =
        pathname === CREATE_PATH || pathname?.startsWith(`${CREATE_PATH}/`);
      const isChange =
        pathname === CHANGE_PATH || pathname?.startsWith(`${CHANGE_PATH}/`);

      try {
        const status = await fetchMpinStatus();
        if (cancelled) return;

        if (!status.isMpinCreated && !isCreate) {
          router.replace(CREATE_PATH);
          return;
        }

        if (status.isMpinCreated && isCreate) {
          router.replace("/rt/retailer");
          return;
        }

        if (!status.isMpinCreated && isChange) {
          router.replace(CREATE_PATH);
          return;
        }

        setReady(true);
      } catch {
        if (cancelled) return;
        // Do not soft-lock the portal on network errors.
        setReady(true);
      }
    }

    void check();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return <PageLoader message="Checking MPIN security…" />;
  }

  return <>{children}</>;
}
