"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Loader2, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { resolveUpiAtmQrValue } from "@/src/lib/upiAtmUtils";
import type { UpiAtmTransaction } from "@/src/types/upiAtm";

interface UpiAtmQrModalProps {
  open: boolean;
  transaction: UpiAtmTransaction | null;
  polling?: boolean;
  statusLabel?: string;
}

export default function UpiAtmQrModal({
  open,
  transaction,
  polling = false,
  statusLabel = "Waiting for customer payment...",
}: UpiAtmQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setQrDataUrl("");
    setQrError(null);

    if (!open || !transaction) return undefined;

    const qrValue = resolveUpiAtmQrValue(transaction);
    if (!qrValue) {
      setQrError("QR data not received from server.");
      return undefined;
    }

    if (qrValue.startsWith("data:image")) {
      setQrDataUrl(qrValue);
      return undefined;
    }

    QRCode.toDataURL(qrValue, { width: 280, margin: 2, errorCorrectionLevel: "M" })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrError("Unable to render QR code.");
      });

    return () => {
      active = false;
    };
  }, [open, transaction]);

  const amount = Number(transaction?.amount || 0);

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-violet-600" />
            Scan to Pay
          </DialogTitle>
          <DialogDescription>
            Ask customer to scan this UPI QR and complete payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="UPI payment QR code"
                className="mx-auto h-[280px] w-[280px] rounded-xl bg-white p-3 shadow-sm"
              />
            ) : qrError ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-red-600">
                {qrError}
              </div>
            ) : (
              <div className="flex h-[280px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-xs text-slate-500">Amount</p>
              <p className="font-bold text-slate-900">{formatCurrency(amount)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-xs text-slate-500">Mobile</p>
              <p className="font-bold text-slate-900">{transaction?.mobile || "-"}</p>
            </div>
          </div>

          {transaction?.referenceId ? (
            <p className="text-center text-xs text-slate-500">
              Reference: <span className="font-semibold text-slate-700">{transaction.referenceId}</span>
            </p>
          ) : null}

          <div className="flex items-center justify-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-medium text-violet-800">
            {polling ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {statusLabel}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
