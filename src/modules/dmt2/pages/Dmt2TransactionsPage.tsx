"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Dmt2StatusBadge from "../components/Dmt2StatusBadge";
import { fetchTransactions } from "../lib/dmt2-service";
import { formatDateTime, formatInr } from "../lib/dmt2-mock";
import type { Dmt2Transaction } from "../types";

export default function Dmt2TransactionsPage() {
  const [transactions, setTransactions] = useState<Dmt2Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const rows = await fetchTransactions();
        if (active) setTransactions(rows);
      } catch (error) {
        if (active) {
          toast.error(error instanceof Error ? error.message : "Unable to load transactions");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0b1f3a]">Transaction History</h1>
        <p className="text-sm text-slate-500">DMT2 payouts from the live API.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-semibold text-[#0b1f3a]">{row.customerName}</td>
                <td className="px-4 py-3">{formatInr(row.amount)}</td>
                <td className="px-4 py-3">{row.mode}</td>
                <td className="px-4 py-3 text-slate-500">{formatDateTime(row.createdAt)}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.id}</td>
                <td className="px-4 py-3">
                  <Dmt2StatusBadge status={row.status.toLowerCase()} />
                </td>
                <td className="px-4 py-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/rt/retailer/dmt2/receipt/${encodeURIComponent(row.id)}`}>
                      <Eye className="h-4 w-4" />
                      Receipt
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
            {!loading && !transactions.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  No DMT2 transactions yet.
                </td>
              </tr>
            ) : null}
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                  Loading transactions…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
