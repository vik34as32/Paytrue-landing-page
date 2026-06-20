"use client";

import { Megaphone, Radio } from "lucide-react";
import { NEWS_ITEMS } from "@/features/retailer/constants";

export default function NewsBar() {
  const tickerItems = [...NEWS_ITEMS, ...NEWS_ITEMS];

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[#1565d8]/15 bg-white rt-card-elevated"
      style={{ boxShadow: "0 2px 16px rgba(21, 101, 216, 0.08)" }}
    >
      <div className="absolute inset-y-0 left-0 z-10 flex items-center gap-0">
        <div className="flex h-full items-center gap-2 bg-gradient-to-r from-[#1565d8] to-[#1e6feb] px-4 py-2.5 shadow-md">
          <Radio className="h-3.5 w-3.5 animate-pulse text-white" />
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-white">
            Live
          </span>
        </div>
        <div className="h-full w-6 bg-gradient-to-r from-[#1e6feb] to-transparent" />
      </div>

      <div className="flex items-center overflow-hidden py-2.5 pl-[88px] pr-4">
        <Megaphone className="mr-3 hidden h-4 w-4 shrink-0 text-[#1565d8]/60 sm:block" />
        <div className="relative flex-1 overflow-hidden">
          <div className="rt-marquee-track flex w-max items-center gap-12">
            {tickerItems.map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className="whitespace-nowrap text-[13px] font-medium text-[#0b1f3a]/80"
              >
                {item.message}
                <span className="mx-6 text-[#1565d8]/30">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
