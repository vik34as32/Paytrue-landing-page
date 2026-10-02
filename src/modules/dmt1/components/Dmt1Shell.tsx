"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Search", href: "/rt/retailer/dmt1" },
  { label: "Retailer", href: "/rt/retailer/dmt1/retailer" },
  { label: "Beneficiaries", href: "/rt/retailer/dmt1/beneficiaries" },
  { label: "History", href: "/rt/retailer/dmt1/transactions" },
];

const theme = createTheme({
  palette: {
    primary: { main: "#0891b2" },
    background: { default: "#f0f9ff", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

function Dmt1Nav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-[#0b1f3a] via-[#0e4a6e] to-cyan-600 p-4 text-white shadow-lg shadow-cyan-200/40 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Banknote className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">
            Domestic Money Transfer
          </p>
          <h2 className="text-lg font-extrabold sm:text-xl">DMT1</h2>
          <p className="mt-0.5 text-xs text-cyan-100 sm:text-sm">
            InstantPay remittance · remitter OTP · IMPS payout
          </p>
        </div>
      </div>
      <nav className="mt-4 flex flex-wrap gap-1 border-t border-white/15 pt-3">
        {NAV.map((item) => {
          const active =
            item.href === "/rt/retailer/dmt1"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4",
                active
                  ? "bg-white text-cyan-700 shadow-sm"
                  : "text-cyan-100 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function Dmt1Shell({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="w-full max-w-none space-y-5">
          <Dmt1Nav />
          {children}
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
