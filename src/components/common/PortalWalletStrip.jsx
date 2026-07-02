"use client";

import Link from "next/link";
import { Phone, Wallet, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SUPPORT_MOBILE } from "@/src/constants/portalConfig";

export default function PortalWalletStrip({
  balance,
  fundRequestPath,
  userName,
  userId,
  roleLabel,
  loading = false,
  loaded = false,
  error = null,
}) {
  return (
    <div className="w-full max-w-none border-b border-slate-200/60 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-5 lg:px-6">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#18335D] via-[#204E9D] to-[#1F6BFF] p-5 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-white/60">
              Paytrue Virtual
            </p>
            <h2 className="text-2xl font-bold">{roleLabel || "Portal"} Wallet</h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase text-white/50">Available Balance</p>
            {loading ? (
              <div className="mt-1 flex items-center justify-end gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                <span className="text-sm text-white/70">Loading balance...</span>
              </div>
            ) : (
              <p className="text-2xl font-bold">
                {loaded ? formatCurrency(balance) : error ? "—" : formatCurrency(balance)}
              </p>
            )}
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
          <div>
            <p className="text-[10px] uppercase text-white/50">Holder</p>
            <p className="font-bold">{userName?.toUpperCase() || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/50">ID</p>
            <p className="font-bold">{userId || "—"}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2 sm:hidden">
        <Link
          href={`tel:${SUPPORT_MOBILE.replace(/\s/g, "")}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-[#1565d8]"
        >
          <Phone className="h-3.5 w-3.5" />
          Call Support
        </Link>
        <Link
          href={fundRequestPath}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1565d8] py-2.5 text-xs font-semibold text-white shadow-sm"
        >
          <Wallet className="h-3.5 w-3.5" />
          Fund Request
        </Link>
      </div>
    </div>
  );
}
