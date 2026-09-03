"use client";

import { Suspense } from "react";
import CcbpPayPage from "@/src/modules/ccbp/pages/CcbpPayPage";

export default function CreditCardBillPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <CcbpPayPage />
    </Suspense>
  );
}
