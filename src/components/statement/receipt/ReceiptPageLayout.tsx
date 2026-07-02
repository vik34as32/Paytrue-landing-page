"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ReceiptPageLayoutProps {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ReceiptPageLayout({
  actions,
  children,
  className,
}: ReceiptPageLayoutProps) {
  return (
    <div
      className={cn(
        "receipt-page-view -mx-4 -my-4 min-h-screen w-full bg-slate-100 sm:-mx-5 sm:-my-5 lg:-mx-6 lg:-my-6",
        className
      )}
    >
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8">
        <div className="receipt-page-card overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white shadow-xl">
          {actions}
          {children}
        </div>
      </div>
    </div>
  );
}
