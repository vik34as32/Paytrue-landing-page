"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const FUND_REQUEST_PATH = "/rt/retailer/fund-request";
const BANK_DETAILS_PATH = "/rt/retailer/fund-request/bank-details";

const TABS = [
  { href: FUND_REQUEST_PATH, label: "Fund Request", exact: true },
  { href: BANK_DETAILS_PATH, label: "Bank Details", exact: false },
] as const;

function isTabActive(pathname: string, href: string, exact: boolean) {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FundRequestNavTabs() {
  const pathname = usePathname();

  return (
    <div className="overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200/80 dark:ring-slate-800">
      <div className="grid grid-cols-2">
        {TABS.map((tab) => {
          const active = isTabActive(pathname, tab.href, tab.exact);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-3.5 text-center text-sm font-bold text-white transition-colors sm:text-base",
                active
                  ? "bg-[#1E1B4B]"
                  : "bg-[#00B5E2] hover:bg-[#00a3cc]"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
