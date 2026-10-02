"use client";

import { Button } from "@/components/ui/button";
import type { Dmt1Beneficiary, Dmt1CommissionPreview } from "../types/dmt1.types";
import { formatDmt1Inr, maskAccountNumber } from "../utils/dmt1.utils";

interface Dmt1TransferReviewProps {
  beneficiary: Dmt1Beneficiary;
  preview: Dmt1CommissionPreview;
  remarks?: string;
  loading?: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export default function Dmt1TransferReview({
  beneficiary,
  preview,
  remarks,
  loading,
  onConfirm,
  onBack,
}: Dmt1TransferReviewProps) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-[#0b1f3a]">Review Transfer</h3>
      <p className="mt-1 text-xs text-slate-500">
        Confirm details before MPIN authorization.
      </p>

      <div className="mt-5 grid w-full gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Beneficiary</p>
          <p className="mt-2 font-bold text-[#0b1f3a]">{beneficiary.name}</p>
          <p>{beneficiary.bankName}</p>
          <p className="font-mono text-xs text-slate-500">
            {beneficiary.accountMasked || maskAccountNumber(beneficiary.accountNumber)}
          </p>
          <p className="text-xs text-slate-400">IFSC {beneficiary.ifsc}</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Debit Summary</p>
          <p className="mt-2">
            Amount: <strong>{formatDmt1Inr(preview.transferAmount)}</strong>
          </p>
          <p>Mode: <strong>{preview.transferMode}</strong></p>
          <p>Total Debit: <strong>{formatDmt1Inr(preview.totalDebit)}</strong></p>
          <p>Balance After: <strong>{formatDmt1Inr(preview.balanceAfterTransfer)}</strong></p>
          {remarks ? <p className="mt-2 text-slate-500">Remark: {remarks}</p> : null}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onConfirm} disabled={loading}>
          Proceed to MPIN
        </Button>
      </div>
    </div>
  );
}
