"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Dmt3PaginationMeta, Dmt3Transaction } from "../types/dmt3.types";
import { formatDmt3Date, formatDmt3Inr } from "../utils/dmt3.utils";
import { Dmt3TxnStatusBadge } from "./Dmt3StatusBadge";

interface Dmt3TransactionHistoryProps {
  items: Dmt3Transaction[];
  pagination: Dmt3PaginationMeta;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export default function Dmt3TransactionHistory({
  items,
  pagination,
  loading,
  onPageChange,
}: Dmt3TransactionHistoryProps) {
  const totalPages = pagination.totalPages || 1;

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4 sm:p-5">
        <h3 className="text-base font-bold text-[#0b1f3a]">DMT3 Transaction History</h3>
        <p className="text-xs text-slate-500">Backend paginated transaction records</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Beneficiary</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">UTR</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading transactions…
                  </span>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No DMT3 transactions found
                </td>
              </tr>
            ) : (
              items.map((txn) => (
                <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-mono text-xs">{txn.id}</td>
                  <td className="px-4 py-3 font-medium">{txn.beneficiaryName}</td>
                  <td className="px-4 py-3 font-semibold">{formatDmt3Inr(txn.amount)}</td>
                  <td className="px-4 py-3">
                    <Dmt3TxnStatusBadge status={txn.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{txn.utr || "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {formatDmt3Date(txn.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/rt/retailer/dmt3/transactions/${encodeURIComponent(txn.id)}`}
                      className="text-xs font-semibold text-[#1565d8] hover:underline"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4">
        <p className="text-xs text-slate-500">
          Page {pagination.page} of {totalPages}
          {pagination.total ? ` · ${pagination.total} records` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={loading || pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={loading || pagination.page >= totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
