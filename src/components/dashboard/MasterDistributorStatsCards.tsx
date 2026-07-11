"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CalendarPlus,
  IndianRupee,
  Loader2,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mapMasterDistributorDashboardStats } from "@/src/lib/masterDistributorDashboardMappers";
import type {
  MasterDistributorDashboardMetrics,
  MasterDistributorStatAccent,
} from "@/src/types/masterDistributorDashboard";

const iconMap: Record<string, LucideIcon> = {
  Users,
  UserCheck,
  UserX,
  CalendarPlus,
  IndianRupee,
  CalendarDays,
  BarChart3,
  TrendingUp,
};

const accentStyles: Record<
  MasterDistributorStatAccent,
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
  rose: {
    bar: "from-rose-500 to-rose-600",
    icon: "bg-rose-50 text-rose-600 ring-rose-100",
    value: "text-rose-700",
  },
  violet: {
    bar: "from-violet-500 to-violet-600",
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    value: "text-violet-700",
  },
  cyan: {
    bar: "from-cyan-500 to-cyan-600",
    icon: "bg-cyan-50 text-cyan-600 ring-cyan-100",
    value: "text-cyan-700",
  },
  indigo: {
    bar: "from-indigo-500 to-indigo-600",
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    value: "text-indigo-700",
  },
  orange: {
    bar: "from-orange-500 to-orange-600",
    icon: "bg-orange-50 text-orange-600 ring-orange-100",
    value: "text-orange-700",
  },
  amber: {
    bar: "from-amber-500 to-amber-600",
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    value: "text-amber-700",
  },
};

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

interface MasterDistributorStatsCardsProps {
  metrics?: MasterDistributorDashboardMetrics | null;
  loading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function StatGrid({
  title,
  cards,
  startDelay = 0,
}: {
  title: string;
  cards: ReturnType<typeof mapMasterDistributorDashboardStats>;
  startDelay?: number;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = iconMap[card.icon] || Users;
          const accent = accentStyles[card.accent];

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: startDelay + index * 0.06 }}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className={cn("h-1 bg-gradient-to-r", accent.bar)} />
              <div className="p-4">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl ring-1",
                    accent.icon
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
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

export default function MasterDistributorStatsCards({
  metrics,
  loading = false,
  isFetching = false,
  isError = false,
  error,
  onRetry,
}: MasterDistributorStatsCardsProps) {
  const cards = mapMasterDistributorDashboardStats(metrics);
  const networkCards = cards.filter((card) => card.group === "network");
  const businessCards = cards.filter((card) => card.group === "business");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatSkeleton key={`network-${index}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <StatSkeleton key={`business-${index}`} />
          ))}
        </div>
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
    <div className="space-y-6">
      {isFetching ? (
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Refreshing stats...
        </div>
      ) : null}

      <StatGrid title="Network Overview" cards={networkCards} />
      <StatGrid title="Business Performance" cards={businessCards} startDelay={0.2} />
    </div>
  );
}
