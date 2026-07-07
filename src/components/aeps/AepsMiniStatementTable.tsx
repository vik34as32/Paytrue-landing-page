"use client";

import type { AepsMiniStatementRow } from "@/src/types/aeps";
import { formatCurrency } from "@/lib/utils";

interface AepsMiniStatementTableProps {
  rows: AepsMiniStatementRow[];
}

export default function AepsMiniStatementTable({ rows }: AepsMiniStatementTableProps) {
  if (!rows.length) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        No transactions found in mini statement.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Narration</th>
            <th className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount</th>
            <th className="px-4 py-3 text-right font-semibold text-slate-600">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => (
            <tr key={`${row.date}-${index}`}>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.date}</td>
              <td className="px-4 py-3 text-slate-700">{row.narration}</td>
              <td className="px-4 py-3 text-slate-600">{row.type}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-800">
                {formatCurrency(row.amount)}
              </td>
              <td className="px-4 py-3 text-right text-slate-600">
                {row.balance != null ? formatCurrency(row.balance) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
