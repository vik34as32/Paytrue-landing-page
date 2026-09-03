"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Start", href: "/rt/retailer/dmt3" },
  { label: "Beneficiaries", href: "/rt/retailer/dmt3/beneficiaries" },
  { label: "History", href: "/rt/retailer/dmt3/transactions" },
];

const theme = createTheme({
  palette: {
    primary: { main: "#1565d8" },
    background: { default: "#f8f5ff", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

function Dmt3Nav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-[#0b1f3a] via-[#122b5c] to-[#1565d8] p-4 text-white shadow-lg shadow-blue-200/40 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <ArrowRightLeft className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-100">
            Domestic Money Transfer
          </p>
          <h2 className="text-lg font-extrabold sm:text-xl">DMT3</h2>
          <p className="mt-0.5 text-xs text-blue-100 sm:text-sm">
            Live commission preview with secure MPIN authorization.
          </p>
        </div>
      </div>
      <nav className="mt-4 flex flex-wrap gap-1 border-t border-white/15 pt-3">
        {NAV.map((item) => {
          const active =
            item.href === "/rt/retailer/dmt3"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4",
                active
                  ? "bg-white text-[#1565d8] shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
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

export default function Dmt3Shell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="w-full max-w-none space-y-5">
        <Dmt3Nav />
        {children}
      </div>
    </ThemeProvider>
  );
}
