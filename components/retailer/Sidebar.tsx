"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Grid3x3,
  FileText,
  UserCog,
  User,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SIDEBAR_LINKS } from "@/features/retailer/constants";

const iconMap = {
  LayoutDashboard,
  Wallet,
  Grid3x3,
  FileText,
  UserCog,
  User,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
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
    "rt-sidebar print:hidden flex flex-col bg-[#F8FAFC] text-slate-600 border-r border-slate-200 shadow-[4px_0_32px_rgba(11,31,58,0.08)]",
    "max-md:transition-transform max-md:duration-300 max-md:ease-out",
    open ? "max-md:translate-x-0" : "max-md:-translate-x-full",
    "md:translate-x-0"
  )}
>
        {/* Logo — sticky top */}
        <div className="shrink-0 border-b border-slate-200 px-5 py-5 bg">
  <div className="flex items-center justify-between">
    <Link
      href="/rt/retailer"
      className="flex items-center gap-3"
    >
      <div className="relative flex h-14 w-14 items-center  ">
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
          <span className="text-[#001F5B]">
            Pay
          </span>

          <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
            true
          </span>
        </h1>

        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
          Retailer Portal
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

        {/* Menu — scrollable middle */}
        <nav className="rt-sidebar-nav flex-1 space-y-0.5 px-3 py-4">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = iconMap[link.icon as keyof typeof iconMap];
            const isActive =
              link.href === "/rt/retailer"
                ? pathname === "/rt/retailer"
                : pathname.startsWith(link.href) &&
                  link.href !== "/rt/retailer";

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

        {/* Logout — sticky bottom */}
        <div className="shrink-0 border-t border-white/[0.08] p-4">
          <Link
            href="/auth/login"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-[13px] font-semibold text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </Link>
        </div>
      </aside>
    </>
  );
}
