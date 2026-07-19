"use client";

import type { ReactNode } from "react";
import {
  BadgeIndianRupee,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Hash,
  Layers,
  Phone,
  Receipt,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import ReferenceCopyCell from "@/src/components/statement/ReferenceCopyCell";
import type { ReceiptViewModel } from "@/types/statementReceipt";
import type { LucideIcon } from "lucide-react";

interface TransactionCardProps {
  receipt: ReceiptViewModel;
}

interface DetailItem {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  valueClassName?: string;
}

/** Customer-facing fields only — no operator/service/commission/wallet. */
export default function TransactionCard({ receipt }: TransactionCardProps) {
  const statusColor =
    receipt.status === "success"
      ? "text-[#16A34A]"
      : receipt.status === "pending"
        ? "text-amber-600"
        : "text-red-600";

  const rows: DetailItem[] = [
    {
      icon: BadgeIndianRupee,
      label: "Amount",
      value: formatCurrency(receipt.amount),
      valueClassName:
        "bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-base font-extrabold text-transparent",
    },
    { icon: Hash, label: "Transaction ID", value: receipt.transactionId },
    {
      icon: FileText,
      label: "Reference Number",
      value: <ReferenceCopyCell value={receipt.referenceNumber} />,
    },
    ...(receipt.bankReference
      ? [
          {
            icon: FileText,
            label: "Bank Reference / RRN",
            value: receipt.bankReference,
            valueClassName: "font-mono text-xs break-all",
          } as DetailItem,
        ]
      : []),
    ...(receipt.aepsTransactionLabel
      ? [
          {
            icon: Layers,
            label: "Transaction Type",
            value: receipt.aepsTransactionLabel,
          } as DetailItem,
        ]
      : []),
    ...(receipt.showBankDetailsCard
      ? []
      : receipt.bankName
        ? [
            {
              icon: Building2,
              label: "Bank Name",
              value: receipt.bankName,
            } as DetailItem,
          ]
        : []),
    ...(receipt.showBankDetailsCard
      ? []
      : receipt.accountNumber
        ? [
            {
              icon: CreditCard,
              label: "Account Number",
              value: receipt.accountNumber,
              valueClassName: "font-mono text-xs break-all",
            } as DetailItem,
          ]
        : []),
    ...(receipt.txnMobile
      ? [
          {
            icon: Phone,
            label: "Mobile Number",
            value: receipt.txnMobile,
          } as DetailItem,
        ]
      : []),
    { icon: CreditCard, label: "Payment Mode", value: receipt.paymentMode },
    {
      icon: Receipt,
      label: "Status",
      value: receipt.status.toUpperCase(),
      valueClassName: cn("font-semibold uppercase", statusColor),
    },
    { icon: Calendar, label: "Date", value: receipt.date },
    { icon: Clock, label: "Time", value: receipt.time },
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
        <FileText className="h-4 w-4 text-[#0057D9]" />
        <h3 className="text-sm font-bold text-[#001F5B]">Transaction Details</h3>
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {rows.map(({ icon: Icon, label, value, valueClassName }) => (
          <div
            key={label}
            className="receipt-detail-row flex items-center justify-between gap-3 px-4 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="receipt-detail-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#0057D9]">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-slate-500">{label}</span>
            </div>
            <div
              className={cn(
                "max-w-[58%] text-right text-sm font-semibold text-[#111827]",
                valueClassName
              )}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
