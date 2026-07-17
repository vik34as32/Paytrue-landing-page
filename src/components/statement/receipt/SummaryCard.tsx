"use client";

import { IndianRupee } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReceiptViewModel } from "@/types/statementReceipt";

interface SummaryCardProps {
  receipt: ReceiptViewModel;
}

export default function SummaryCard({ receipt }: SummaryCardProps) {
  const rows = [
    {
      label: "Amount",
      value: formatCurrency(receipt.amount),
      highlight: true,
    },
    { label: "Charges", value: formatCurrency(receipt.charge) },
    { label: "Commission", value: formatCurrency(receipt.commission) },
    { label: "GST", value: formatCurrency(receipt.gst) },
    {
      label: "Net Amount",
      value: formatCurrency(receipt.netAmount),
      bold: true,
    },
    ...(receipt.showWalletBalance
      ? [
          {
            label: "Wallet Balance",
            value: formatCurrency(receipt.closingBalance),
            accent: true,
          },
        ]
      : []),
  ];

  return (
    <section className="receipt-payment-summary overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-gradient-to-r from-[#0A84FF]/10 to-[#0057D9]/10 px-5 py-4">
        <IndianRupee className="h-5 w-5 text-[#0057D9]" />
        <h3 className="text-sm font-bold text-[#001F5B]">Payment Summary</h3>
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {rows.map(({ label, value, highlight, bold, accent }) => (
          <div
            key={label}
            className="receipt-detail-row flex items-center justify-between gap-4 px-5 py-4"
          >
            <span className="text-sm text-slate-600">{label}</span>
            <span
              className={cn(
                "text-sm font-semibold text-[#111827]",
                highlight &&
                  "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-xl font-extrabold text-transparent",
                bold && "font-bold",
                accent && "font-bold text-[#0057D9]"
              )}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
