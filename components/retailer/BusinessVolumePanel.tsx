"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { mapBusinessVolumeCards } from "@/src/lib/retailerDashboardMappers";
import type { RetailerBusinessPeriods } from "@/src/types/retailerDashboard";

interface BusinessVolumePanelProps {
  business?: RetailerBusinessPeriods;
  loading?: boolean;
}

function VolumeSkeleton() {
  return (
    <div className="h-16 animate-pulse rounded-xl border border-slate-100 bg-white" />
  );
}

export default function BusinessVolumePanel({
  business,
  loading = false,
}: BusinessVolumePanelProps) {
  const cards = mapBusinessVolumeCards(business);

  if (loading && !business) {
    return (
      <div className="space-y-2">
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Business Volume
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <VolumeSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!cards.length) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-[#1565d8]" />
        <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Business Volume
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            className="rounded-xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/80 px-4 py-3.5"
            style={{ boxShadow: "0 2px 12px rgba(11, 31, 58, 0.04)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-1 text-lg font-bold tracking-tight text-[#0b1f3a] sm:text-xl">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
