"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Clock, Loader2, QrCode, ShieldCheck, Smartphone, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, cn } from "@/lib/utils";
import {
  formatUpiAtmCountdown,
  getUpiAtmRemainingSeconds,
  resolveUpiAtmQrValue,
} from "@/src/lib/upiAtmUtils";
import type { UpiAtmTransaction } from "@/src/types/upiAtm";

interface UpiAtmQrModalProps {
  open: boolean;
  transaction: UpiAtmTransaction | null;
  polling?: boolean;
  statusLabel?: string;
  onClose?: () => void;
  onExpired?: () => void;
}

function resolveCountdownEndMs(transaction: UpiAtmTransaction): number | null {
  const fromApi = Number(transaction.displayExpirySec);
  if (Number.isFinite(fromApi) && fromApi > 0) {
    // Prefer API validity window so "30 sec" means exactly 30 sec countdown
    return Date.now() + Math.round(fromApi * 1000);
  }
  if (transaction.expiresAtMs != null && Number.isFinite(transaction.expiresAtMs)) {
    return transaction.expiresAtMs;
  }
  return null;
}

function formatValidityWindow(totalSec: number): string {
  if (totalSec >= 60) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs} sec`;
  }
  return `${totalSec} sec`;
}

export default function UpiAtmQrModal({
  open,
  transaction,
  polling = false,
  statusLabel = "Waiting for customer payment...",
  onClose,
  onExpired,
}: UpiAtmQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrError, setQrError] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState<number | null>(null);
  const [validitySec, setValiditySec] = useState<number | null>(null);
  const endsAtRef = useRef<number | null>(null);
  const expiredNotifiedRef = useRef(false);

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

    QRCode.toDataURL(qrValue, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: "M",
    })
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

  useEffect(() => {
    if (!open || !transaction) {
      setRemainingSec(null);
      setValiditySec(null);
      endsAtRef.current = null;
      expiredNotifiedRef.current = false;
      return undefined;
    }

    const fromApi = Number(transaction.displayExpirySec);
    const endMs = resolveCountdownEndMs(transaction);
    if (endMs == null) {
      setRemainingSec(null);
      setValiditySec(null);
      endsAtRef.current = null;
      return undefined;
    }

    // Lock once per QR session
    if (endsAtRef.current == null) {
      endsAtRef.current = endMs;
      setValiditySec(
        Number.isFinite(fromApi) && fromApi > 0
          ? Math.round(fromApi)
          : getUpiAtmRemainingSeconds(endMs)
      );
    }

    expiredNotifiedRef.current = false;

    const tick = () => {
      const end = endsAtRef.current;
      if (end == null) return;
      const left = getUpiAtmRemainingSeconds(end);
      setRemainingSec(left);

      if (left === 0 && !expiredNotifiedRef.current) {
        expiredNotifiedRef.current = true;
        onExpired?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction?.referenceId, onExpired]);

  // Reset lock when modal closes
  useEffect(() => {
    if (!open) {
      endsAtRef.current = null;
      expiredNotifiedRef.current = false;
    }
  }, [open]);

  const amount = Number(transaction?.amount || 0);
  const countdown =
    remainingSec != null ? formatUpiAtmCountdown(remainingSec) : null;
  const isExpired = remainingSec === 0;
  const urgentThreshold =
    validitySec != null ? Math.max(5, Math.ceil(validitySec * 0.2)) : 10;
  const isUrgent =
    remainingSec != null &&
    remainingSec > 0 &&
    remainingSec <= urgentThreshold;

  const progress =
    validitySec && remainingSec != null && validitySec > 0
      ? Math.min(100, Math.max(0, (remainingSec / validitySec) * 100))
      : null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[min(100vw-1.5rem,380px)] gap-0 overflow-hidden border-0 bg-transparent p-0 shadow-none sm:max-w-[380px] [&>button]:hidden"
        onPointerDownOutside={(e) => {
          // Allow close via X / Cancel only — keep overlay click from dismissing mid-pay
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          onClose?.();
        }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
          {/* Brand header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#5b21b6] via-[#6d28d9] to-[#4c1d95] px-5 pb-8 pt-5 text-white">
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-fuchsia-400/20 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <DialogHeader className="space-y-1 text-left">
                <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                    <QrCode className="h-4 w-4" />
                  </span>
                  Scan &amp; Pay
                </DialogTitle>
                <DialogDescription className="text-xs text-violet-100/90">
                  Customer UPI QR · secure collection
                </DialogDescription>
              </DialogHeader>

              <button
                type="button"
                onClick={() => onClose?.()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-violet-200">
                  Collecting
                </p>
                <p className="mt-0.5 text-3xl font-black tracking-tight">
                  {formatCurrency(amount)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/15 px-3 py-2 text-right backdrop-blur">
                <p className="flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-wide text-violet-100">
                  <Smartphone className="h-3 w-3" />
                  Mobile
                </p>
                <p className="font-mono text-sm font-bold tabular-nums">
                  {transaction?.mobile || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="relative -mt-4 space-y-3 px-4 pb-4 pt-0">
            {/* Countdown card */}
            {countdown && validitySec != null ? (
              <div
                className={cn(
                  "rounded-2xl border bg-white p-3 shadow-lg shadow-slate-200/60",
                  isExpired
                    ? "border-red-200"
                    : isUrgent
                      ? "border-amber-200"
                      : "border-slate-100"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl",
                        isExpired
                          ? "bg-red-50 text-red-600"
                          : isUrgent
                            ? "bg-amber-50 text-amber-600"
                            : "bg-violet-50 text-violet-700"
                      )}
                    >
                      <Clock className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {isExpired
                          ? "Expired"
                          : `Valid for ${formatValidityWindow(validitySec)}`}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isExpired
                            ? "text-red-600"
                            : isUrgent
                              ? "text-amber-700"
                              : "text-slate-700"
                        )}
                      >
                        {isExpired ? "Generate a new QR" : countdown.label}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-mono text-2xl font-black tabular-nums tracking-tight",
                      isExpired
                        ? "text-red-600"
                        : isUrgent
                          ? "text-amber-700"
                          : "text-[#4c1d95]"
                    )}
                  >
                    {countdown.clock}
                  </p>
                </div>

                {progress != null && !isExpired ? (
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-200 ease-linear",
                        isUrgent
                          ? "bg-gradient-to-r from-amber-400 to-orange-500"
                          : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* QR */}
            <div
              className={cn(
                "rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-3 text-center",
                isExpired && "opacity-40 grayscale"
              )}
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="UPI payment QR code"
                  className="mx-auto h-[200px] w-[200px] rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100"
                />
              ) : qrError ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-red-600">
                  {qrError}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-violet-600" />
                </div>
              )}
              <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Ask customer to scan with any UPI app
              </p>
            </div>

            {transaction?.referenceId ? (
              <p className="truncate text-center text-[11px] text-slate-400">
                Ref{" "}
                <span className="font-mono font-semibold text-slate-600">
                  {transaction.referenceId}
                </span>
              </p>
            ) : null}

            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold",
                isExpired
                  ? "bg-red-50 text-red-700"
                  : "bg-violet-50 text-violet-800"
              )}
            >
              {polling && !isExpired ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              {isExpired ? "QR expired" : statusLabel}
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 w-full rounded-xl border-slate-200 font-semibold"
              onClick={() => onClose?.()}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
