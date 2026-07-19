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
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3">
        <UserRound className="h-4 w-4 text-[#0057D9]" />
        <h3 className="text-sm font-bold text-[#001F5B]">Customer Details</h3>
      </div>
      <div className="grid gap-2.5 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-[#F8FAFC] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-[#111827]">
              {receipt.customer[key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
