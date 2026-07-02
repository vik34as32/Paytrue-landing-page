"use client";

import { UserRound } from "lucide-react";
import type { ReceiptViewModel } from "@/types/statementReceipt";

interface CustomerCardProps {
  receipt: ReceiptViewModel;
}

const FIELDS = [
  { key: "customerName", label: "Customer Name" },
  { key: "retailerId", label: "Retailer ID" },
  { key: "mobile", label: "Mobile Number" },
  { key: "outletName", label: "Outlet Name" },
  { key: "location", label: "Location" },
] as const;

export default function CustomerCard({ receipt }: CustomerCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8FAFC] px-5 py-4">
        <UserRound className="h-5 w-5 text-[#0057D9]" />
        <h3 className="text-sm font-bold text-[#001F5B]">Customer Details</h3>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-[#F8FAFC] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#111827]">
              {receipt.customer[key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
