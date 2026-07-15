"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  LogOut,
  X,
  Users,
  Store,
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  MinusCircle,
  FileSpreadsheet,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap = {
  LayoutDashboard,
  Wallet,
  FileText,
  Users,
  Store,
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  MinusCircle,
  FileSpreadsheet,
  IndianRupee,
};

export default function PortalSidebar({
  open,
  onClose,
  links,
  portalLabel,
  dashboardPath,
  onLogout,
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[55] bg-[#0b1f3a]/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "rt-sidebar flex flex-col bg-[#F8FAFC] text-slate-600 border-r border-slate-200 shadow-[4px_0_32px_rgba(11,31,58,0.08)]",
          "max-md:transition-transform max-md:duration-300 max-md:ease-out",
          open ? "max-md:translate-x-0" : "max-md:-translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="shrink-0 border-b border-slate-200 px-5 py-5">
          <div className="flex items-center justify-between">
            <Link href={dashboardPath} className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center">
                <Image
                  src="/images/paytrue-logo.png"
                  alt="PayTrue Logo"
                  width={42}
                  height={42}
                  priority
                  className="object-contain"
                />
                <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  <span className="text-[#001F5B]">Pay</span>
                  <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                    true
                  </span>
                </h1>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
                  {portalLabel}
                </p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="rt-sidebar-nav flex-1 space-y-0.5 px-3 py-4">
          {links.map((link) => {
            const Icon = iconMap[link.icon] || LayoutDashboard;
            const isActive =
              link.href === dashboardPath
                ? pathname === dashboardPath
                : pathname.startsWith(link.href) && link.href !== dashboardPath;

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#1565d8] text-white shadow-lg shadow-blue-200"
                    : "text-slate-600 hover:bg-blue-50 hover:text-[#1565d8]"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#ff9800]" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-[#1565d8]"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[13px] font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
