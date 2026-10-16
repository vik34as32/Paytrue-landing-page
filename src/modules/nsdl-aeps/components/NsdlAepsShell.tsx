"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PageLoader from "@/src/components/common/PageLoader";
import {
  NSDL_AEPS_BASE_PATH,
  NSDL_AEPS_LEDGER_PATH,
  NSDL_AEPS_LOGIN_PATH,
  NSDL_AEPS_ONBOARDING_PATH,
  NSDL_AEPS_STATUS_PATH,
} from "../lib/nsdl-aeps-endpoints";
import { useNsdlMerchant } from "../lib/nsdl-aeps-hooks";

type NavVisibility = "always" | "onboarding" | "login" | "service";

const NAV: { label: string; href: string; show: NavVisibility }[] = [
  { label: "Onboarding", href: NSDL_AEPS_ONBOARDING_PATH, show: "onboarding" },
  { label: "Daily Login", href: NSDL_AEPS_LOGIN_PATH, show: "login" },
  { label: "Dashboard", href: NSDL_AEPS_BASE_PATH, show: "always" },
  { label: "Cash Withdrawal", href: `${NSDL_AEPS_BASE_PATH}/cash-withdrawal`, show: "service" },
  { label: "Balance Enquiry", href: `${NSDL_AEPS_BASE_PATH}/balance-enquiry`, show: "service" },
  { label: "Mini Statement", href: `${NSDL_AEPS_BASE_PATH}/mini-statement`, show: "service" },
  { label: "Cash Deposit", href: `${NSDL_AEPS_BASE_PATH}/cash-deposit`, show: "service" },
  { label: "Aadhaar Pay", href: `${NSDL_AEPS_BASE_PATH}/aadhaar-pay`, show: "service" },
  { label: "Transaction Status", href: NSDL_AEPS_STATUS_PATH, show: "always" },
  { label: "Ledger", href: NSDL_AEPS_LEDGER_PATH, show: "always" },
];

const OPEN_PATHS = new Set([
  NSDL_AEPS_BASE_PATH,
  NSDL_AEPS_ONBOARDING_PATH,
  NSDL_AEPS_LOGIN_PATH,
  NSDL_AEPS_STATUS_PATH,
  NSDL_AEPS_LEDGER_PATH,
]);

function NsdlNav({ activated, loginDone }: { activated: boolean; loginDone: boolean }) {
  const pathname = usePathname() ?? "";

  const visible = NAV.filter((item) => {
    if (item.show === "onboarding") return !activated;
    if (item.show === "login") return activated && !loginDone;
    if (item.show === "service") return loginDone;
    return true;
  });

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {visible.map((item) => {
        const active =
          item.href === NSDL_AEPS_BASE_PATH ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition",
              active
                ? "bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-[#6D28D9]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function NsdlGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { isLoading, isError, error, refetch, activated, loginDone } = useNsdlMerchant();

  const isOpen = OPEN_PATHS.has(pathname);
  const redirectTo = isLoading || isError
    ? null
    : pathname === NSDL_AEPS_LOGIN_PATH
      ? !activated
        ? NSDL_AEPS_ONBOARDING_PATH
        : loginDone
          ? NSDL_AEPS_BASE_PATH
          : null
      : !isOpen && !activated
        ? NSDL_AEPS_ONBOARDING_PATH
        : !isOpen && !loginDone
          ? NSDL_AEPS_LOGIN_PATH
          : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (isLoading && !isOpen) {
    return <PageLoader message="Checking NSDL AEPS session..." />;
  }

  if (isError && !isOpen) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
        <p className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4" />
          Unable to load NSDL AEPS merchant status
        </p>
        <p>{error instanceof Error ? error.message : "Please try again."}</p>
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (redirectTo) {
    return <PageLoader message="Redirecting..." />;
  }

  return <>{children}</>;
}

function NsdlFrame({ children }: { children: ReactNode }) {
  const { activated, loginDone } = useNsdlMerchant();
  return (
    <div className="space-y-5">
      <NsdlNav activated={activated} loginDone={loginDone} />
      <NsdlGuard>{children}</NsdlGuard>
    </div>
  );
}

export default function NsdlAepsShell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 20_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NsdlFrame>{children}</NsdlFrame>
    </QueryClientProvider>
  );
}
