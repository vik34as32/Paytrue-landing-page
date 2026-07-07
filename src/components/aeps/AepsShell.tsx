"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/src/redux/types";
import { cn } from "@/lib/utils";
import AepsDailyLoginGuard from "@/src/components/aeps/AepsDailyLoginGuard";
import {
  AepsSessionContext,
  useAepsSessionState,
} from "@/src/components/aeps/AepsSessionContext";
import { useAepsBanks } from "@/src/hooks/useAeps";
import {
  AEPS_BASE_PATH,
  AEPS_LOGIN_PATH,
  initAepsSession,
} from "@/src/lib/aepsSession";
import {
  hydrateSelectedDevice,
  selectAepsDailyLoginDone,
} from "@/src/redux/slices/aepsSlice";
import { BIOMETRIC_DEVICE_STORAGE_KEY } from "@/src/types/biometric";

const NAV = [
  { label: "Daily Login", href: AEPS_LOGIN_PATH },
  { label: "Dashboard", href: AEPS_BASE_PATH },
  { label: "Cash Withdrawal", href: "/rt/retailer/aeps/cash-withdrawal" },
  { label: "Balance Enquiry", href: "/rt/retailer/aeps/balance-enquiry" },
  { label: "Mini Statement", href: "/rt/retailer/aeps/mini-statement" },
  { label: "Cash Deposit", href: "/rt/retailer/aeps/cash-deposit" },
  { label: "Aadhaar Pay", href: "/rt/retailer/aeps/aadhaar-pay" },
  {
    label: "Transaction Status",
    href: "/rt/retailer/aeps/transaction-status",
  },
];

function AepsNav() {
  const pathname = usePathname() ?? "";
  const { loginDone } = useAepsSessionState();

  const visibleNav = NAV.filter((item) => {
    if (item.href === AEPS_LOGIN_PATH) return !loginDone;
    return loginDone;
  });

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {visibleNav.map((item) => {
        const active =
          item.href === AEPS_BASE_PATH
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition",
              active
                ? "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#1565d8]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function AepsBankPrefetch() {
  useAepsBanks();
  return null;
}

export default function AepsShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const loginDoneFromStore = useSelector(selectAepsDailyLoginDone);
  const [sessionReady, setSessionReady] = useState(false);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  useEffect(() => {
    initAepsSession(dispatch);
    try {
      const savedDevice = localStorage.getItem(BIOMETRIC_DEVICE_STORAGE_KEY);
      if (savedDevice === "MANTRA" || savedDevice === "MORPHO") {
        dispatch(hydrateSelectedDevice(savedDevice));
      }
    } catch {
      /* ignore */
    }
    setSessionReady(true);
  }, [dispatch]);

  const sessionValue = useMemo(
    () => ({
      sessionReady,
      loginDone: sessionReady && loginDoneFromStore,
    }),
    [sessionReady, loginDoneFromStore]
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AepsSessionContext.Provider value={sessionValue}>
        <div className="space-y-5">
          <AepsBankPrefetch />
          <AepsNav />
          <AepsDailyLoginGuard>{children}</AepsDailyLoginGuard>
        </div>
      </AepsSessionContext.Provider>
    </QueryClientProvider>
  );
}
