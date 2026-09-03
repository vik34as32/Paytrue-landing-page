"use client";

export default function Dmt2ApiLogsPage() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-2xl font-extrabold text-[#0b1f3a]">API Logs</h1>
      <p className="mt-2 text-sm text-slate-500">
        DMT2 now calls <code>/api/v1/dmt2</code> remitter, beneficiary, payout, and
        receipt APIs. Check network requests in the browser for live logs.
      </p>
    </div>
  );
}
