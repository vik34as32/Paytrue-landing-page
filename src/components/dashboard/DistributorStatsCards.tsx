"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  IndianRupee,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mapDistributorDashboardStats } from "@/src/lib/distributorDashboardMappers";
import type {
  DistributorDashboardMetrics,
  DistributorStatAccent,
} from "@/src/types/distributorDashboard";

const iconMap: Record<string, LucideIcon> = {
  IndianRupee,
  TrendingUp,
  CalendarDays,
  BarChart3,
  Wallet,
};

const accentStyles: Record<
  DistributorStatAccent,
  { bar: string; icon: string; value: string }
> = {
  blue: {
    bar: "from-blue-500 to-blue-600",
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    value: "text-blue-700",
  },
  emerald: {
    bar: "from-emerald-500 to-emerald-600",
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    value: "text-emerald-700",
  },
  violet: {
    bar: "from-violet-500 to-violet-600",
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    value: "text-violet-700",
  },
  amber: {
    bar: "from-amber-500 to-amber-600",
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    value: "text-amber-700",
  },
  cyan: {
    bar: "from-cyan-500 to-cyan-600",
    icon: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    value: "text-cyan-700",
  },
};

interface DistributorStatsCardsProps {
  metrics?: DistributorDashboardMetrics | null;
  loading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function StatSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="h-1 animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

export default function DistributorStatsCards({
  metrics,
  loading = false,
  isFetching = false,
  isError = false,
  error,
  onRetry,
}: DistributorStatsCardsProps) {
  const cards = mapDistributorDashboardStats(metrics);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StatSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6 text-center">
        <p className="text-sm font-medium text-red-700">
          {error || "Failed to load dashboard stats"}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm ring-1 ring-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isFetching ? (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Refreshing stats...
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card, index) => {
          const Icon = iconMap[card.icon] || IndianRupee;
          const accent = accentStyles[card.accent];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={cn("h-1 bg-gradient-to-r", accent.bar)} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                      accent.icon
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                </div>
                <p className={cn("mt-4 text-2xl font-bold tracking-tight", accent.value)}>
                  {card.value}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
