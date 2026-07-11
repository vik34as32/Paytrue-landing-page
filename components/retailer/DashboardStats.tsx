"use client";

import { motion } from "framer-motion";
import {
  Activity,
  IndianRupee,
  CheckCircle2,
  Clock,
  TrendingUp,
  Loader2,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mapRetailerDashboardStats } from "@/src/lib/retailerDashboardMappers";
import type {
  DashboardStatAccent,
  RetailerDashboardData,
} from "@/src/types/retailerDashboard";

const iconMap: Record<string, LucideIcon> = {
  Activity,
  IndianRupee,
  CheckCircle2,
  Clock,
};

const accentStyles: Record<
  DashboardStatAccent,
  {
    bar: string;
    icon: string;
    panel: string;
    today: string;
  }
> = {
  blue: {
    bar: "from-blue-500 to-blue-600",
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    panel: "bg-blue-50/40",
    today: "text-blue-700",
  },
  emerald: {
    bar: "from-emerald-500 to-emerald-600",
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    panel: "bg-emerald-50/40",
    today: "text-emerald-700",
  },
  violet: {
    bar: "from-violet-500 to-violet-600",
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    panel: "bg-violet-50/40",
    today: "text-violet-700",
  },
  amber: {
    bar: "from-amber-500 to-amber-600",
    icon: "bg-amber-50 text-amber-600 ring-amber-100",
    panel: "bg-amber-50/40",
    today: "text-amber-700",
  },
};

interface DashboardStatsProps {
  dashboard?: RetailerDashboardData;
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
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
      </div>
    </div>
  );
}

export default function DashboardStats({
  dashboard,
  loading = false,
  isFetching = false,
  isError = false,
  error,
  onRetry,
}: DashboardStatsProps) {
  const stats = mapRetailerDashboardStats(dashboard);

  if (loading && !dashboard) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError && !dashboard) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center">
        <p className="text-sm font-medium text-red-700">
          {error || "Unable to load dashboard stats."}
        </p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {isFetching ? (
        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Refreshing live stats...
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon] || Activity;
          const theme = accentStyles[stat.accent];
          const isUp = stat.trend === "up";
          const hideChangeBadge = stat.id === "pending";

          return (
            <motion.article
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(11,31,58,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(21,101,216,0.12)]"
            >
              <div className={cn("h-1 bg-gradient-to-r", theme.bar)} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1",
                        theme.icon
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-bold leading-tight text-[#0b1f3a] sm:text-sm">
                        {stat.label}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                        Live performance
                      </p>
                    </div>
                  </div>

                  {!hideChangeBadge ? (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-1 text-[10px] font-bold",
                        isUp
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {isUp ? (
                        <span className="inline-flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3" />
                          {stat.change}
                        </span>
                      ) : (
                        stat.change
                      )}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                      Awaiting
                    </span>
                  )}
                </div>

                <div
                  className={cn(
                    "mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-100",
                    theme.panel
                  )}
                >
                  <div className="bg-white/90 px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {stat.todayLabel}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-xl font-bold tracking-tight sm:text-2xl",
                        theme.today
                      )}
                    >
                      {stat.todayValue}
                    </p>
                  </div>

                  <div className="border-l border-slate-100 bg-white/70 px-3 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {stat.totalLabel}
                    </p>
                    <p className="mt-1 text-base font-bold tracking-tight text-[#0b1f3a] sm:text-lg">
                      {stat.totalValue}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
