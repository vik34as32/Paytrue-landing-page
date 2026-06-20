"use client";

import { Eye, EyeOff, Wifi } from "lucide-react";
import { useState } from "react";
import { useWalletStore } from "@/features/retailer/store/walletStore";
import { formatCurrency } from "@/lib/utils";

interface WalletCardProps {
  type: "main" | "retailer";
}

export default function WalletCard({
  type,
}: WalletCardProps) {
  const [hidden, setHidden] = useState(false);

  const balance = useWalletStore((s) =>
    type === "main" ? s.mainWallet : s.retailerWallet
  );

  return (
    <div className="w-full">
  <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#18335D] via-[#204E9D] to-[#1F6BFF] p-5 text-white shadow-xl">

    {/* Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_35%)]" />

    {/* Header */}
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[3px] text-white/60">
          Paytrue Virtual
        </p>

        <h2 className="text-2xl font-bold">
          Retailer Card
        </h2>
      </div>

      <Wifi
        size={22}
        className="rotate-90 text-white/60"
      />
    </div>

    {/* Card Number */}
    <div className="mt-6">
      <p className="text-2xl font-medium tracking-[5px]">
        4532 •••• •••• 4521
      </p>
    </div>

    {/* Bottom Row */}
    <div className="mt-6 flex flex-wrap items-end justify-between gap-4">

      <div>
        <p className="text-[10px] uppercase text-white/50">
          Holder
        </p>

        <h4 className="font-bold">
          AMIT KUMAR
        </h4>
      </div>

      <div>
        <p className="text-[10px] uppercase text-white/50">
          Retailer ID
        </p>

        <h4 className="font-bold">
          PTR784521
        </h4>
      </div>

      <div>
        <p className="text-[10px] uppercase text-white/50">
          Balance
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            {hidden
              ? "₹••••••"
              : formatCurrency(balance)}
          </span>

          {/* <button
            onClick={() => {
    alert("clicked");
    setHidden((prev) => !prev);
  }}
            className="rounded-md bg-white/10 p-1.5"
          >
            {hidden ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button> */}
        </div>
      </div>

    </div>
  </div>
</div>
  );
}