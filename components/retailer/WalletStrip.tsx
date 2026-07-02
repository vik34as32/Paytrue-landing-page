"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import WalletCard from "./WalletCard";
import { SUPPORT_MOBILE } from "@/features/retailer/constants";

export default function WalletStrip() {
  return (
    <div className="w-full max-w-none border-b border-slate-200/60 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-5 lg:px-6 print:hidden">
      <div className="grid w-full max-w-none">
        <WalletCard />
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
          href="/rt/retailer/fund-request"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1565d8] py-2.5 text-xs font-semibold text-white shadow-sm"
        >
          Add Funds
        </Link>
      </div>
    </div>
  );
}
