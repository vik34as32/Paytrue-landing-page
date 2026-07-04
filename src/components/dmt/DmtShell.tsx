"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard", href: "/rt/retailer/dmt" },
  { label: "Send Money", href: "/rt/retailer/dmt/sender" },
  { label: "Beneficiaries", href: "/rt/retailer/dmt/beneficiaries" },
  { label: "History", href: "/rt/retailer/dmt/transactions" },
];

function DmtNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {NAV.map((item) => {
        const active =
          item.href === "/rt/retailer/dmt"
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

export default function DmtShell({ children }: { children: React.ReactNode }) {
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
      <div className="space-y-5">
        <DmtNav />
        {children}
      </div>
    </QueryClientProvider>
  );
}
