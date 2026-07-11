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
  Percent,
  Phone,
  Radio,
  Receipt,
  Wallet,
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
    { icon: Radio, label: "Operator", value: receipt.operator },
    { icon: Layers, label: "Service", value: receipt.service },
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
              label: "Bank Account Number",
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

  if (receipt.showWalletBalance) {
    rows.push(
      {
        icon: Wallet,
        label: "Opening Balance",
        value: formatCurrency(receipt.openingBalance),
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
      }
    );
  }

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
            className="flex items-start justify-between gap-4 px-5 py-3.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#0057D9]">
                <Icon className="h-4 w-4" />
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
