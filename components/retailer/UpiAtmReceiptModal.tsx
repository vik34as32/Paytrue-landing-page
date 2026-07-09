"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { CheckCircle2, Printer, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { isUpiAtmSuccessStatus, normalizeUpiAtmStatus } from "@/src/lib/upiAtmUtils";
import type { UpiAtmTransaction } from "@/src/types/upiAtm";

interface UpiAtmReceiptModalProps {
  open: boolean;
  transaction: UpiAtmTransaction | null;
  onClose: () => void;
}

function ReceiptRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="max-w-[60%] break-all text-right font-semibold text-slate-900">
        {value || "-"}
      </span>
    </div>
  );
}

export default function UpiAtmReceiptModal({
  open,
  transaction,
  onClose,
}: UpiAtmReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const status = normalizeUpiAtmStatus(transaction?.status);
  const success = isUpiAtmSuccessStatus(status);
  const amount = Number(transaction?.amount || 0);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {success ? "Payment Successful" : "Payment Failed"}
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
            <p className="text-sm text-slate-500">Amount Collected</p>
            <p className="mt-1 text-3xl font-extrabold text-[#0b1f3a]">{formatCurrency(amount)}</p>
            <p
              className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                success ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
              }`}
            >
              {status}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <ReceiptRow label="Reference ID" value={transaction?.referenceId} />
            <ReceiptRow label="Transaction ID" value={transaction?.transactionId || transaction?.id} />
            <ReceiptRow label="UTR" value={transaction?.utr} />
            <ReceiptRow label="RRN" value={transaction?.rrn} />
            <ReceiptRow label="Mobile" value={transaction?.mobile} />
            <ReceiptRow label="External Ref" value={transaction?.externalRef} />
            <ReceiptRow label="Paid At" value={transaction?.paidAt} />
            {transaction?.message ? (
              <ReceiptRow label="Message" value={transaction.message} />
            ) : null}
          </div>
        </div>

        <div className="flex gap-2">
          {success ? (
            <Button variant="outline" className="flex-1" onClick={() => handlePrint()}>
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          ) : null}
          <Button className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
