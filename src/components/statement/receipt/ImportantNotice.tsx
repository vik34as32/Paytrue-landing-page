"use client";

import { Info } from "lucide-react";

export default function ImportantNotice() {
  return (
    <section className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 shadow-sm">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#0057D9]" />
      <div className="text-sm leading-relaxed text-[#111827]">
        <p className="font-semibold text-[#001F5B]">Important Notice</p>
        <p className="mt-1 text-slate-700">
          This transaction has been securely processed through the Paytrue Digital
          Payment Platform. Please keep this receipt for future reference.
        </p>
      </div>
    </section>
  );
}
