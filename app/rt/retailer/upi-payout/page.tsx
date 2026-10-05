"use client";

import { Suspense } from "react";
import UpiPayoutPage from "@/src/modules/upi-payout/pages/UpiPayoutPage";

export default function UpiPayoutRoute() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Loading…
        </div>
      }
    >
      <UpiPayoutPage />
    </Suspense>
  );
}
