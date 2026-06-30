"use client";

import { motion } from "framer-motion";
import {
  Activity,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Store,
  UserCheck,
  UserX,
  CalendarPlus,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const iconMap = {
  Activity,
  IndianRupee,
  TrendingUp,
  Wallet,
  Users,
  Store,
  UserCheck,
  UserX,
  CalendarPlus,
};

function formatStatValue(stat, values) {
  const raw = values?.[stat.valueKey] ?? 0;
  if (stat.format === "currency") return formatCurrency(raw);
  return String(raw);
}

export default function StatsCards({ stats, values, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-xl border border-slate-100 bg-white"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {stats.map((stat, i) => {
        const Icon = iconMap[stat.icon] || Activity;
        const isUp = stat.trend === "up";

        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-xl border border-slate-100 bg-white p-4 transition-all duration-300 hover:border-[#1565d8]/20 hover:shadow-[0_8px_28px_rgba(21,101,216,0.1)]"
            style={{ boxShadow: "0 2px 12px rgba(11, 31, 58, 0.05)" }}
          >
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#1565d8]/[0.04] transition group-hover:bg-[#1565d8]/[0.07]" />

            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg",
                  i === 0 && "bg-blue-50 text-blue-600",
                  i === 1 && "bg-emerald-50 text-emerald-600",
                  i === 2 && "bg-violet-50 text-violet-600",
                  i === 3 && "bg-amber-50 text-amber-600"
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </div>
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  isUp
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                {isUp ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>

            <p className="mt-3 text-xl font-bold tracking-tight text-[#0b1f3a] sm:text-2xl">
              {formatStatValue(stat, values)}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500 sm:text-xs">
              {stat.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
