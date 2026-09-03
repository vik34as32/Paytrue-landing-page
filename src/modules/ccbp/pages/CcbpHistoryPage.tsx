"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CcbpStatusBadge from "../components/CcbpStatusBadge";
import { fetchCcbpTransactions } from "../lib/ccbp-service";
import { formatDateTime, formatInr, maskCard } from "../lib/ccbp-normalizers";
import type { CcbpStatus, CcbpTransaction } from "../types";

const FILTERS: { id: "ALL" | CcbpStatus; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SUCCESS", label: "Success" },
  { id: "PROCESSING", label: "Processing" },
  { id: "FAILED", label: "Failed" },
];

export default function CcbpHistoryPage() {
  const [rows, setRows] = useState<CcbpTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | CcbpStatus>("ALL");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const list = await fetchCcbpTransactions();
        if (active) setRows(list);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load history");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(
    () => (filter === "ALL" ? rows : rows.filter((row) => row.status === filter)),
    [filter, rows]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#0b1f3a]">Ledger</h2>
          <p className="text-sm text-slate-500">Every CCBP debit, with masked PAN and settlement rail.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                filter === item.id
                  ? "bg-[#0b1f3a] text-white ring-[#0b1f3a]"
                  : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="hidden overflow-x-auto md:block">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Cardholder</th>
                <th className="px-4 py-3 font-semibold">Card</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Rail</th>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {visible.map((row, index) => (
                <motion.tr
                  key={row.reference}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-4 py-3 font-semibold text-[#0b1f3a]">{row.payeeName || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">
                    {maskCard(row.creditCardNumber)}
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums">{formatInr(row.amount)}</td>
                  <td className="px-4 py-3 text-slate-600">{row.paymentType}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <CcbpStatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="outline" className="h-8">
                      <Link href={`/rt/retailer/credit-card/receipt/${encodeURIComponent(row.reference)}`}>
                        Receipt
                      </Link>
                    </Button>
                  </td>
                </motion.tr>
              ))}
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    Loading ledger…
                  </td>
                </tr>
              ) : null}
              {!loading && !visible.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-slate-500">
                    No payments in this view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="md:hidden">
          {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading ledger…</p> : null}
          {!loading && !visible.length ? (
            <div className="p-10 text-center">
              <ReceiptText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No payments in this view.</p>
            </div>
          ) : null}
          {visible.map((row) => (
            <Link
              key={row.reference}
              href={`/rt/retailer/credit-card/receipt/${encodeURIComponent(row.reference)}`}
              className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#0b1f3a]">{row.payeeName || "Credit card"}</p>
                <p className="text-xs text-slate-500">
                  {maskCard(row.creditCardNumber)} • {row.paymentType}
                </p>
                <p className="mt-1">
                  <CcbpStatusBadge status={row.status} />
                </p>
              </div>
              <div className="flex items-center gap-1">
                <p className="font-extrabold tabular-nums text-[#0b1f3a]">{formatInr(row.amount)}</p>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
