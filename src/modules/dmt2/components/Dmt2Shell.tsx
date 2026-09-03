"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Search", href: "/rt/retailer/dmt2" },
  { label: "Retailer", href: "/rt/retailer/dmt2/retailer" },
  { label: "Beneficiaries", href: "/rt/retailer/dmt2/beneficiaries" },
  { label: "History", href: "/rt/retailer/dmt2/transactions" },
];

const theme = createTheme({
  palette: {
    primary: { main: "#4f46e5" },
    background: { default: "#f8f5ff", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: { button: { textTransform: "none", fontWeight: 700 } },
});

function Dmt2Nav() {
  const pathname = usePathname() ?? "";

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 p-4 text-white shadow-lg shadow-indigo-200/60 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-100">
            Xpress Transfer
          </p>
          <h2 className="text-lg font-extrabold sm:text-xl">DMT2</h2>
          <p className="mt-0.5 text-xs text-indigo-100 sm:text-sm">
            Separate money-transfer workspace. Not connected to DMT.
          </p>
        </div>
      </div>
      <nav className="mt-4 flex flex-wrap gap-1 border-t border-white/15 pt-3">
        {NAV.map((item) => {
          const active =
            item.href === "/rt/retailer/dmt2"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:px-4",
                active
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-indigo-100 hover:bg-white/10 hover:text-white"
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

export default function Dmt2Shell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="space-y-5">
        <Dmt2Nav />
        {children}
      </div>
    </ThemeProvider>
  );
}
