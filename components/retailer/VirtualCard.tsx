"use client";

import { Wifi } from "lucide-react";
import { RETAILER_USER } from "@/features/retailer/constants";
import { useWalletStore, selectRetailerDisplayBalance } from "@/features/retailer/store/walletStore";
import { formatCurrency } from "@/lib/utils";

export default function VirtualCard() {
  const balance = useWalletStore(selectRetailerDisplayBalance);

  const cardNumber = `4532 •••• •••• ${RETAILER_USER.retailerId.slice(-4)}`;
  const validThru = "12/28";

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        className="relative overflow-hidden rounded-[22px] p-6 shadow-[0_20px_60px_rgba(11,31,58,0.35)]"
        style={{
          background:
            "linear-gradient(135deg, #0b1f3a 0%, #122b5c 40%, #1565d8 100%)",
        }}
      >
        <div className="rt-shimmer pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#3b8af5]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#f57c00]/15 blur-2xl" />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <div className="relative space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/45">
                PayTrue Virtual
              </p>
              <p className="text-[17px] font-bold text-white">Retailer Card</p>
            </div>
            <Wifi className="h-5 w-5 rotate-90 text-white/50" />
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-12 rounded-md bg-gradient-to-br from-amber-300/90 to-amber-500 shadow-inner">
              <div className="mx-auto mt-2.5 h-3 w-7 rounded-sm border border-amber-700/20 bg-amber-200/40" />
            </div>
            <div className="h-7 w-10 rounded bg-white/10" />
          </div>

          <p className="font-mono text-[19px] tracking-[0.18em] text-white">
            {cardNumber}
          </p>

          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                Card Holder
              </p>
              <p className="text-[12px] font-bold uppercase text-white">
                {RETAILER_USER.name}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                Valid Thru
              </p>
              <p className="font-mono text-[12px] font-bold text-white">
                {validThru}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
                Retailer ID
              </p>
              <p className="font-mono text-[11px] font-bold text-[#5eb3ff]">
                {RETAILER_USER.retailerId}
              </p>
            </div>
          </div>

          <div className="rt-glass-card rounded-xl p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-white/40">
              Wallet Balance
            </p>
            <p className="text-[22px] font-bold text-white">
              {formatCurrency(balance)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex">
              <div className="h-7 w-7 rounded-full bg-red-500/90 shadow-sm" />
              <div className="-ml-2.5 h-7 w-7 rounded-full bg-amber-400/90 shadow-sm" />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/60">
              PayTrue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
