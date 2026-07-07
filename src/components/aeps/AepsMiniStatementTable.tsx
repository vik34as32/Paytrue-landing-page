"use client";

import type { AepsMiniStatementRow } from "@/src/types/aeps";
import { cn, formatCurrency } from "@/lib/utils";

interface AepsMiniStatementTableProps {
  rows: AepsMiniStatementRow[];
  compact?: boolean;
}

function TxnTypeBadge({ type }: { type: string }) {
  const normalized = type.trim().toUpperCase();
  const isCredit = normalized === "C" || normalized === "CR" || normalized === "CREDIT";
  const isDebit = normalized === "D" || normalized === "DR" || normalized === "DEBIT";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        isCredit && "bg-emerald-100 text-emerald-700",
        isDebit && "bg-rose-100 text-rose-700",
        !isCredit && !isDebit && "bg-slate-100 text-slate-600"
      )}
    >
      {isCredit ? "Credit" : isDebit ? "Debit" : type || "—"}
    </span>
  );
}

export default function AepsMiniStatementTable({
  rows,
  compact = false,
}: AepsMiniStatementTableProps) {
  if (!rows.length) {
    return (
      <p
        className={cn(
          "text-center text-sm text-slate-500",
          compact ? "py-6" : "rounded-lg border border-slate-200 bg-slate-50 px-4 py-8"
        )}
      >
        No transactions found in mini statement.
      </p>
    );
  }

  const showBalanceColumn = rows.some((row) => row.balance != null);
  const cellPad = compact ? "px-2.5 py-2" : "px-4 py-3";

  return (
    <div className={cn("overflow-x-auto", !compact && "rounded-xl border border-slate-200")}>
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_rgb(226_232_240)]">
          <tr>
            <th
              className={cn(
                cellPad,
                "text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              )}
            >
              Date
            </th>
            <th
              className={cn(
                cellPad,
                "text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              )}
            >
              Narration
            </th>
            <th
              className={cn(
                cellPad,
                "text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              )}
            >
              Type
            </th>
            <th
              className={cn(
                cellPad,
                "text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              )}
            >
              Amount
            </th>
            {showBalanceColumn ? (
              <th
                className={cn(
                  cellPad,
                  "text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                )}
              >
                Balance
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => {
            const normalized = row.type.trim().toUpperCase();
            const isCredit =
              normalized === "C" || normalized === "CR" || normalized === "CREDIT";

            return (
              <tr key={`${row.date}-${row.narration}-${index}`} className="hover:bg-slate-50/80">
                <td className={cn(cellPad, "whitespace-nowrap font-mono text-xs text-slate-600")}>
                  {row.date || "—"}
                </td>
                <td
                  className={cn(
                    cellPad,
                    "max-w-[140px] truncate text-slate-700 sm:max-w-[200px]",
                    !compact && "max-w-none"
                  )}
                  title={row.narration}
                >
                  {row.narration || "—"}
                </td>
                <td className={cellPad}>
                  <TxnTypeBadge type={row.type} />
                </td>
                <td
                  className={cn(
                    cellPad,
                    "whitespace-nowrap text-right font-semibold",
                    isCredit ? "text-emerald-700" : "text-rose-700"
                  )}
                >
                  {isCredit ? "+" : "−"}
                  {formatCurrency(Math.abs(row.amount))}
                </td>
                {showBalanceColumn ? (
                  <td className={cn(cellPad, "whitespace-nowrap text-right text-slate-600")}>
                    {row.balance != null ? formatCurrency(row.balance) : "—"}
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
