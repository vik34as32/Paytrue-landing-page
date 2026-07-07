"use client";

import { forwardRef } from "react";
import { formatCurrency } from "@/lib/utils";
import type { AepsTransactionResult } from "@/src/types/aeps";
import { maskAadhaar } from "@/src/lib/aepsUtils";

interface AepsReceiptProps {
  result: AepsTransactionResult;
  serviceLabel: string;
}

const AepsReceipt = forwardRef<HTMLDivElement, AepsReceiptProps>(
  function AepsReceipt({ result, serviceLabel }, ref) {
    return (
      <div
        ref={ref}
        className="receipt-print-area w-full bg-white p-6 text-sm text-slate-800"
      >
        <div className="border-b border-slate-200 pb-4 text-center">
          <p className="text-lg font-bold text-[#001F5B]">PayTrue</p>
          <p className="text-xs text-slate-500">AEPS Transaction Receipt</p>
          <p className="mt-1 font-semibold">{serviceLabel}</p>
        </div>

        <div className="mt-4 space-y-2">
          <Row label="Status" value={result.status.toUpperCase()} />
          <Row label="Reference ID" value={result.referenceId} />
          <Row label="Transaction ID" value={result.transactionId} />
          {result.customerName ? (
            <Row label="Customer" value={result.customerName} />
          ) : null}
          {result.aadhaarNumber ? (
            <Row label="Aadhaar" value={maskAadhaar(result.aadhaarNumber)} />
          ) : null}
          {result.mobileNumber ? (
            <Row label="Mobile" value={result.mobileNumber} />
          ) : null}
          {result.bankName ? <Row label="Bank" value={result.bankName} /> : null}
          {result.amount != null ? (
            <Row label="Amount" value={formatCurrency(result.amount)} />
          ) : null}
          {result.balance != null ? (
            <Row label="Balance" value={formatCurrency(result.balance)} />
          ) : null}
          {result.rrn ? <Row label="RRN" value={result.rrn} /> : null}
          {result.stan ? <Row label="STAN" value={result.stan} /> : null}
          {result.message ? <Row label="Message" value={result.message} /> : null}
        </div>

        <p className="mt-6 border-t border-slate-200 pt-4 text-center text-xs text-slate-500">
          This is a computer-generated receipt. Keep it for your records.
        </p>
      </div>
    );
  }
);

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-slate-100 py-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default AepsReceipt;
