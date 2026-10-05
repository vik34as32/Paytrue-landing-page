"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ReceiptText, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import UpiAppMark from "../components/UpiAppMark";
import UpiPayoutStatusBadge from "../components/UpiPayoutStatusBadge";
import { formatDateTime, formatInr } from "../lib/upi-payout-normalizers";
import { fetchUpiPayoutTransactions } from "../lib/upi-payout-service";
import type { UpiPayoutStatus, UpiPayoutTransaction } from "../types";

const FILTERS: { id: "ALL" | UpiPayoutStatus; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SUCCESS", label: "Success" },
  { id: "PROCESSING", label: "Processing" },
  { id: "FAILED", label: "Failed" },
];

export default function UpiPayoutHistoryPage() {
  const [rows, setRows] = useState<UpiPayoutTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | UpiPayoutStatus>("ALL");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchUpiPayoutTransactions();
        if (active) setRows(list);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Unable to load history");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const statusOk =
        filter === "ALL" ||
        row.status === filter ||
        (filter === "PROCESSING" && row.status === "PENDING");
      if (!statusOk) return false;
      if (!term) return true;
      return [row.vpa, row.payeeName, row.reference, row.utr]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [filter, query, rows]);

  const totals = useMemo(() => {
    const sent = rows.filter((row) => row.status === "SUCCESS");
    return { count: sent.length, amount: sent.reduce((sum, row) => sum + row.amount, 0) };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Transfers", value: String(rows.length) },
          { label: "Successful", value: String(totals.count) },
          { label: "Total sent", value: formatInr(totals.amount) },
        ].map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-[#0a1630]">{loading ? "…" : card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                "relative rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition",
                filter === item.id
                  ? "text-white ring-[#0a1630]"
                  : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
              )}
            >
              {filter === item.id ? (
                <motion.span
                  layoutId="upi-history-filter"
                  className="absolute inset-0 rounded-full bg-[#0a1630]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search UPI ID, name, UTR"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : null}

        {!loading && !visible.length ? (
          <div className="p-12 text-center">
            <ReceiptText className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No UPI payouts in this view.</p>
          </div>
        ) : null}

        <AnimatePresence initial={false}>
          {visible.map((row, index) => (
            <motion.div
              key={row.reference || index}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: Math.min(index, 12) * 0.03 }}
            >
              <Link
                href={`/rt/retailer/upi-payout/receipt/${encodeURIComponent(row.reference)}`}
                className="group flex items-center gap-3 border-b border-slate-100 px-4 py-3 transition last:border-0 hover:bg-slate-50"
              >
                <UpiAppMark vpa={row.vpa} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0a1630]">{row.payeeName || row.vpa || "UPI payout"}</p>
                  <p className="truncate font-mono text-xs text-slate-500">{row.vpa}</p>
                </div>
                <div className="hidden text-xs text-slate-500 sm:block">{formatDateTime(row.createdAt)}</div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-extrabold tabular-nums text-[#0a1630]">{formatInr(row.amount)}</p>
                  <UpiPayoutStatusBadge status={row.status} />
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
