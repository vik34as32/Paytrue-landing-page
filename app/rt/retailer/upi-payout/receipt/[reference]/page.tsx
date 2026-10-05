"use client";

import { Suspense } from "react";
import UpiPayoutReceiptPage from "@/src/modules/upi-payout/pages/UpiPayoutReceiptPage";

export default function UpiPayoutReceiptRoute() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading receipt…
        </div>
      }
    >
      <UpiPayoutReceiptPage />
    </Suspense>
  );
}
