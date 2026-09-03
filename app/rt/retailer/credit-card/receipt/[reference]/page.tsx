"use client";

import { Suspense } from "react";
import CcbpReceiptPage from "@/src/modules/ccbp/pages/CcbpReceiptPage";

export default function CreditCardReceiptRoute() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading receipt…
        </div>
      }
    >
      <CcbpReceiptPage />
    </Suspense>
  );
}
