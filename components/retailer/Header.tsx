"use client";

import Link from "next/link";
import { Mail, Menu, Phone } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_MOBILE } from "@/features/retailer/constants";
import HeaderWalletBalance from "./HeaderWalletBalance";
import HeaderCommissionBalance from "./HeaderCommissionBalance";
import ProfileDropdown from "./ProfileDropdown";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl print:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-sm transition hover:border-[#1565d8]/30 hover:text-[#1565d8] md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0 md:hidden">
            <p className="truncate text-[13px] font-bold text-[#0b1f3a]">
              PayTrue Retailer
            </p>
          </div>

          <div className="hidden items-center gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-1 py-1 md:flex">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-[#1565d8] hover:shadow-sm"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />
              <span className="hidden lg:inline">{SUPPORT_EMAIL}</span>
              <span className="lg:hidden">Email</span>
            </a>
            <span className="h-4 w-px bg-slate-200" />
            <a
              href={`tel:${SUPPORT_MOBILE.replace(/\s/g, "")}`}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-[#1565d8] hover:shadow-sm"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />
              {SUPPORT_MOBILE}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 md:hidden">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#1565d8]"
              aria-label="Email support"
            >
              <Mail className="h-4 w-4" />
            </a>
            <Link
              href={`tel:${SUPPORT_MOBILE.replace(/\s/g, "")}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-[#1565d8]"
              aria-label="Call support"
            >
              <Phone className="h-4 w-4" />
            </Link>
          </div>
          <HeaderWalletBalance />
          <HeaderCommissionBalance />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
