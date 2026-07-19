"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ReceiptViewModel } from "@/types/statementReceipt";
import { PAYTRUE_LOGO_PATH } from "@/types/statementReceipt";

interface ReceiptHeaderProps {
  receipt: ReceiptViewModel;
}

export default function ReceiptHeader({ receipt }: ReceiptHeaderProps) {
  const badgeStyles =
    receipt.status === "success"
      ? "bg-emerald-50 text-[#16A34A] border-emerald-200"
      : receipt.status === "pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-red-50 text-red-600 border-red-200";

  return (
    <header className="receipt-header border-b border-[#E5E7EB] bg-white px-5 py-5 sm:px-7 lg:px-9">
      <div className="receipt-header-row flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-1.5 shadow-sm">
            <Image
              src={PAYTRUE_LOGO_PATH}
              alt="PayTrue Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              <span className="text-[#001F5B]">Pay</span>
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                true
              </span>
            </h1>
            <p className="mt-0.5 text-sm font-medium text-slate-500">
              Retailer Payment Receipt
            </p>
          </div>
        </div>

        <div className="grid gap-1 text-sm lg:text-right">
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <span
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                badgeStyles
              )}
            >
              {receipt.statusBadge}
            </span>
          </div>
          <p className="text-[#111827]">
            <span className="font-medium text-slate-500">Receipt No.</span>{" "}
            <span className="font-semibold break-all">{receipt.receiptNo}</span>
          </p>
          <p className="text-[#111827]">
            <span className="font-medium text-slate-500">Transaction ID</span>{" "}
            <span className="font-semibold">{receipt.transactionId}</span>
          </p>
          <p className="text-[#111827]">
            <span className="font-medium text-slate-500">Date</span>{" "}
            <span className="font-semibold">{receipt.date}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-medium text-slate-500">Time</span>{" "}
            <span className="font-semibold">{receipt.time}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
