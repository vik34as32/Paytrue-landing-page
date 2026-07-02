"use client";

import {
  BadgeIndianRupee,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Hash,
  Layers,
  Percent,
  Radio,
  Receipt,
  Wallet,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ReceiptViewModel } from "@/types/statementReceipt";
import type { LucideIcon } from "lucide-react";

interface TransactionCardProps {
  receipt: ReceiptViewModel;
}

interface DetailItem {
  icon: LucideIcon;
  label: string;
  value: string;
  valueClassName?: string;
}

export default function TransactionCard({ receipt }: TransactionCardProps) {
  const statusColor =
    receipt.status === "success"
      ? "text-[#16A34A]"
      : receipt.status === "pending"
        ? "text-amber-600"
        : "text-red-600";

  const rows: DetailItem[] = [
    { icon: Hash, label: "Transaction ID", value: receipt.transactionId },
    {
      icon: FileText,
      label: "Reference Number",
      value: receipt.referenceNumber,
      valueClassName: "font-mono text-xs",
    },
    { icon: Radio, label: "Operator", value: receipt.operator },
    { icon: Layers, label: "Service", value: receipt.service },
    { icon: CreditCard, label: "Payment Mode", value: receipt.paymentMode },
    {
      icon: Receipt,
      label: "Status",
      value: receipt.status.toUpperCase(),
      valueClassName: cn("font-semibold uppercase", statusColor),
    },
    { icon: Calendar, label: "Date", value: receipt.date },
    { icon: Clock, label: "Time", value: receipt.time },
    {
      icon: Wallet,
      label: "Opening Balance",
      value: formatCurrency(receipt.openingBalance),
    },
    {
      icon: Wallet,
      label: "Closing Balance",
      value: formatCurrency(receipt.closingBalance),
    },
    {
      icon: BadgeIndianRupee,
      label: "Commission",
      value: formatCurrency(receipt.commission),
    },
    {
      icon: BadgeIndianRupee,
      label: "Charges",
      value: formatCurrency(receipt.charge),
    },
    {
      icon: Percent,
      label: "GST",
      value: formatCurrency(receipt.gst),
    },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4">
        <FileText className="h-5 w-5 text-[#0057D9]" />
        <h3 className="text-sm font-bold text-[#001F5B]">Transaction Details</h3>
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {rows.map(({ icon: Icon, label, value, valueClassName }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-5 py-3.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#0057D9]">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-sm text-slate-500">{label}</span>
            </div>
            <span
              className={cn(
                "max-w-[52%] truncate text-right text-sm font-semibold text-[#111827]",
                valueClassName
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
