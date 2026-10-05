"use client";

import Dmt2StatusBadge from "./Dmt2StatusBadge";
import { formatDateLong, maskAccount } from "../lib/dmt2-mock";
import type { Dmt2Transaction } from "../types";

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

function resolveTotalDebit(txn: Dmt2Transaction): number | undefined {
  if (txn.totalDebit != null) return txn.totalDebit;
  if (txn.charges == null && txn.gst == null) return undefined;
  return txn.amount + (txn.charges ?? 0) + (txn.gst ?? 0);
}

export default function Dmt2ReceiptDetails({ txn }: { txn: Dmt2Transaction }) {
  const totalDebit = resolveTotalDebit(txn);
  const rows: Array<[string, string | undefined]> = [
    ["Transaction Reference", txn.id],
    ["API Transaction ID", txn.apiTxnId],
    ["External Reference", txn.externalRef],
    ["Bank Reference No. (UTR)", txn.bankRef],
    ["Beneficiary Name", txn.customerName],
    ["Account Number", txn.accountNumber ? maskAccount(txn.accountNumber) : undefined],
    ["IFSC", txn.ifsc],
    ["Transfer Mode", txn.mode],
    ["Amount", formatMoney(txn.amount)],
    ["Charges", txn.charges != null ? formatMoney(txn.charges) : undefined],
    ["GST / Tax", txn.gst != null ? formatMoney(txn.gst) : undefined],
    ["Total Debit", totalDebit != null ? formatMoney(totalDebit) : undefined],
    ["Date & Time", formatDateLong(txn.updatedAt || txn.createdAt)],
    ["Provider Message", txn.providerMessage],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0b1f3a]">Transaction Receipt</h1>
          <p className="mt-1 text-sm text-slate-500">PayTrue DMT2</p>
        </div>
        <Dmt2StatusBadge status={txn.status} className="text-sm" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {rows
          .filter(([, value]) => Boolean(value))
          .map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 break-all text-sm font-semibold text-[#001F5B]">{value}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
