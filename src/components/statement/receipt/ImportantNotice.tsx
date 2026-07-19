"use client";

import { Info } from "lucide-react";

export default function ImportantNotice() {
  return (
    <section className="flex gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0057D9]" />
      <div className="text-xs leading-relaxed text-[#111827] sm:text-sm">
        <p className="font-semibold text-[#001F5B]">Important Notice</p>
        <p className="mt-0.5 text-slate-700">
          This transaction has been securely processed through the Paytrue Digital
          Payment Platform. Please keep this receipt for future reference.
        </p>
      </div>
    </section>
  );
}
