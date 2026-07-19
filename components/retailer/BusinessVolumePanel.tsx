"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Landmark,
  SunMedium,
  type LucideIcon,
} from "lucide-react";
import { mapBusinessVolumeCards } from "@/src/lib/retailerDashboardMappers";
import type { RetailerBusinessPeriods } from "@/src/types/retailerDashboard";

interface BusinessVolumePanelProps {
  business?: RetailerBusinessPeriods;
  loading?: boolean;
}

const cardMeta: Record<
  string,
  {
    icon: LucideIcon;
    accent: string;
    accentSoft: string;
    bar: string;
    hint: string;
  }
> = {
  today: {
    icon: SunMedium,
    accent: "text-[#1565d8]",
    accentSoft: "bg-[#e8f1fc] text-[#1565d8] ring-[#c5daf7]",
    bar: "from-[#42a5f5] to-[#1565d8]",
    hint: "Current day",
  },
  monthly: {
    icon: CalendarDays,
    accent: "text-[#0f766e]",
    accentSoft: "bg-[#e6f7f5] text-[#0f766e] ring-[#b8e8e2]",
    bar: "from-[#2dd4bf] to-[#0f766e]",
    hint: "This calendar month",
  },
  yearly: {
    icon: CalendarRange,
    accent: "text-[#4338ca]",
    accentSoft: "bg-[#eef0ff] text-[#4338ca] ring-[#c7cbfa]",
    bar: "from-[#818cf8] to-[#4338ca]",
    hint: "This calendar year",
  },
  total: {
    icon: Landmark,
    accent: "text-[#0b2a4a]",
    accentSoft: "bg-[#e8eef5] text-[#0b2a4a] ring-[#c5d2e0]",
    bar: "from-[#334e68] to-[#0b2a4a]",
    hint: "Lifetime volume",
  },
};

function VolumeSkeleton() {
  return (
    <div className="h-[108px] animate-pulse rounded-2xl border border-slate-100 bg-white" />
  );
}

export default function BusinessVolumePanel({
  business,
  loading = false,
}: BusinessVolumePanelProps) {
  const cards = mapBusinessVolumeCards(business);
  const totalAmount = business?.total ?? 0;

  if (loading && !business) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(11,31,58,0.06)]">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#0b2a4a] to-[#1565d8] px-4 py-3 sm:px-5">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/90">
            Business Volume
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <VolumeSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!cards.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-[#f4f7fb] shadow-[0_8px_30px_rgba(11,31,58,0.06)]">
      {/* Bank-style section header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 bg-gradient-to-r from-[#0b2a4a] via-[#0e3a63] to-[#1565d8] px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/12 ring-1 ring-white/20">
            <BarChart3 className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white">
              Business Volume
            </p>
            <p className="text-[11px] font-medium text-blue-100/85">
              Performance overview · Retailer ledger
            </p>
          </div>
        </div>
        <div className="rounded-full bg-white/12 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 ring-1 ring-white/15">
          Live summary
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3.5 sm:gap-3.5 sm:p-4 lg:grid-cols-4">
        {cards.map((card, i) => {
          const meta = cardMeta[card.id] ?? cardMeta.total;
          const Icon = meta.icon;
          const amount = card.amount ?? 0;
          const share =
            totalAmount > 0 && card.id !== "total"
              ? Math.min(100, Math.round((amount / totalAmount) * 100))
              : card.id === "total"
                ? 100
                : 0;

          return (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_2px_12px_rgba(11,31,58,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(11,31,58,0.1)] sm:p-4"
            >
              {/* Left accent */}
              <div
                className={`absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b ${meta.bar}`}
              />

              <div className="flex items-start justify-between gap-2 pl-1.5">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-xl ring-1 ${meta.accentSoft}`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2.25} />
                </div>
                {share > 0 && card.id !== "total" ? (
                  <span className={`text-[11px] font-bold tabular-nums ${meta.accent}`}>
                    {share}% of total
                  </span>
                ) : card.id === "total" ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    All time
                  </span>
                ) : null}
              </div>

              <p className="mt-3 pl-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-1 pl-1.5 text-xl font-extrabold tracking-tight text-[#0b1f3a] sm:text-[1.35rem]">
                {card.value}
              </p>
              <p className="mt-1 pl-1.5 text-[11px] font-medium text-slate-400">
                {meta.hint}
              </p>

              {/* Share bar vs lifetime total */}
              {card.id !== "total" && totalAmount > 0 ? (
                <div className="mt-3 pl-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${meta.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.06 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-3 pl-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full w-full rounded-full bg-gradient-to-r ${meta.bar} opacity-80`}
                    />
                  </div>
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
