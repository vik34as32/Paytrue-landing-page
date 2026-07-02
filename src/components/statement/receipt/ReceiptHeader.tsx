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
    <header className="border-b border-[#E5E7EB] bg-white px-6 py-8 sm:px-8 lg:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-2 shadow-sm">
            <Image
              src={PAYTRUE_LOGO_PATH}
              alt="PayTrue Logo"
              width={42}
              height={42}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              <span className="text-[#001F5B]">Pay</span>
              <span className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9] bg-clip-text text-transparent">
                true
              </span>
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Retailer Payment Receipt
            </p>
          </div>
        </div>

        <div className="grid gap-2 text-sm lg:text-right">
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
            <span className="font-semibold">{receipt.receiptNo}</span>
          </p>
          <p className="text-[#111827]">
            <span className="font-medium text-slate-500">Transaction ID</span>{" "}
            <span className="font-semibold">{receipt.transactionId}</span>
          </p>
          <p className="text-[#111827]">
            <span className="font-medium text-slate-500">Date</span>{" "}
            <span className="font-semibold">{receipt.date}</span>
          </p>
          <p className="text-[#111827]">
            <span className="font-medium text-slate-500">Time</span>{" "}
            <span className="font-semibold">{receipt.time}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
