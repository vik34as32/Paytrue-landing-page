"use client";

import type { AepsMiniStatementRow } from "@/src/types/aeps";
import { cn, formatCurrency } from "@/lib/utils";

interface AepsMiniStatementTableProps {
  rows: AepsMiniStatementRow[];
  compact?: boolean;
  statementStyle?: boolean;
}

function TxnTypeBadge({
  type,
  statementStyle = false,
}: {
  type: string;
  statementStyle?: boolean;
}) {
  const normalized = type.trim().toUpperCase();
  const isCredit = normalized === "C" || normalized === "CR" || normalized === "CREDIT";
  const isDebit = normalized === "D" || normalized === "DR" || normalized === "DEBIT";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
        statementStyle && "rounded-md px-2.5 py-1 text-[11px]",
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
  statementStyle = false,
}: AepsMiniStatementTableProps) {
  if (!rows.length) {
    return (
      <p
        className={cn(
          "text-center text-sm text-slate-500",
          compact ? "py-6" : "rounded-lg border border-slate-200 bg-slate-50 px-4 py-8",
          statementStyle && "rounded-xl border border-dashed border-slate-300 bg-white py-10"
        )}
      >
        No transactions found in mini statement.
      </p>
    );
  }

  const showBalanceColumn = rows.some((row) => row.balance != null);
  const cellPad = statementStyle
    ? "px-3 py-2.5 sm:px-4 sm:py-3"
    : compact
      ? "px-2.5 py-2"
      : "px-4 py-3";

  return (
    <div
      className={cn(
        "overflow-x-auto",
        !compact && !statementStyle && "rounded-xl border border-slate-200",
        statementStyle && "rounded-xl border border-[#E5E7EB] bg-white shadow-sm"
      )}
    >
      <table className="min-w-full text-sm">
        <thead
          className={cn(
            "sticky top-0 z-10",
            statementStyle
              ? "bg-[#001F5B] text-white shadow-none"
              : "bg-slate-50 shadow-[0_1px_0_0_rgb(226_232_240)]"
          )}
        >
          <tr>
            {["Date", "Narration", "Type", "Amount", ...(showBalanceColumn ? ["Balance"] : [])].map(
              (label) => (
                <th
                  key={label}
                  className={cn(
                    cellPad,
                    "text-[11px] font-semibold uppercase tracking-wide",
                    statementStyle ? "text-blue-100" : "text-slate-500",
                    label === "Amount" || label === "Balance" ? "text-right" : "text-left"
                  )}
                >
                  {label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody
          className={cn(
            "divide-y",
            statementStyle ? "divide-[#E5E7EB] bg-white" : "divide-slate-100 bg-white"
          )}
        >
          {rows.map((row, index) => {
            const normalized = row.type.trim().toUpperCase();
            const isCredit =
              normalized === "C" || normalized === "CR" || normalized === "CREDIT";

            return (
              <tr
                key={`${row.date}-${row.narration}-${index}`}
                className={cn(
                  statementStyle
                    ? index % 2 === 0
                      ? "bg-white"
                      : "bg-[#F8FAFC]"
                    : "hover:bg-slate-50/80"
                )}
              >
                <td
                  className={cn(
                    cellPad,
                    "whitespace-nowrap font-mono text-xs text-slate-600",
                    statementStyle && "text-[13px] text-slate-700"
                  )}
                >
                  {row.date || "—"}
                </td>
                <td
                  className={cn(
                    cellPad,
                    "max-w-[140px] truncate text-slate-700 sm:max-w-[220px]",
                    !compact && !statementStyle && "max-w-none",
                    statementStyle && "max-w-none font-medium"
                  )}
                  title={row.narration}
                >
                  {row.narration || "—"}
                </td>
                <td className={cellPad}>
                  <TxnTypeBadge type={row.type} statementStyle={statementStyle} />
                </td>
                <td
                  className={cn(
                    cellPad,
                    "whitespace-nowrap text-right font-semibold",
                    isCredit ? "text-emerald-700" : "text-rose-700",
                    statementStyle && "font-bold"
                  )}
                >
                  {isCredit ? "+" : "−"}
                  {formatCurrency(Math.abs(row.amount))}
                </td>
                {showBalanceColumn ? (
                  <td
                    className={cn(
                      cellPad,
                      "whitespace-nowrap text-right font-medium text-slate-700",
                      statementStyle && "font-semibold text-[#001F5B]"
                    )}
                  >
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
