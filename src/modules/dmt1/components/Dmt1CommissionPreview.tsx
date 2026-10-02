"use client";

import { Button } from "@/components/ui/button";
import type { Dmt1CommissionPreview } from "../types/dmt1.types";
import { formatDmt1Inr } from "../utils/dmt1.utils";

interface Dmt1CommissionPreviewProps {
  preview: Dmt1CommissionPreview;
  loading?: boolean;
  onContinue: () => void;
  onBack: () => void;
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${highlight ? "text-[#1565d8]" : "text-[#0b1f3a]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function Dmt1CommissionPreviewCard({
  preview,
  loading,
  onContinue,
  onBack,
}: Dmt1CommissionPreviewProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-[#0b1f3a]">Commission Preview</h3>
      <p className="mt-1 text-xs text-slate-500">
        Values are calculated by DMT1 backend. No frontend estimation.
      </p>

      <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
        <Row label="Transfer Amount" value={formatDmt1Inr(preview.transferAmount)} />
        <Row label="Charges" value={formatDmt1Inr(preview.charges)} />
        <Row label="Commission" value={formatDmt1Inr(preview.commission)} />
        <Row label="Total Debit" value={formatDmt1Inr(preview.totalDebit)} highlight />
        <Row label="Available Balance" value={formatDmt1Inr(preview.availableBalance)} />
        <Row
          label="Balance After Transfer"
          value={formatDmt1Inr(preview.balanceAfterTransfer)}
          highlight
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} disabled={loading}>
          Continue to Review
        </Button>
      </div>
    </div>
  );
}
