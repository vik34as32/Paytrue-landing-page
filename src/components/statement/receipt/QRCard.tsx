"use client";

import { useEffect, useState } from "react";
import { QrCode, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateReceiptQrDataUrl } from "@/src/lib/statementReceiptUtils";

interface QRCardProps {
  payload: string;
  className?: string;
}

export default function QRCard({ payload, className }: QRCardProps) {
  const [dataUrl, setDataUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    void generateReceiptQrDataUrl(payload)
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl("");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [payload]);

  return (
    <section
      className={cn(
        "flex flex-col items-center rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-[#001F5B]">
        <ScanLine className="h-4 w-4 text-[#0057D9]" />
        <h3 className="text-sm font-bold">Transaction Verification</h3>
      </div>

      <div className="flex h-[148px] w-[148px] items-center justify-center rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-3">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-slate-200/70" />
        ) : dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt="Transaction verification QR code"
            width={128}
            height={128}
            className="h-full w-full object-contain"
          />
        ) : (
          <QrCode className="h-12 w-12 text-slate-300" aria-hidden />
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-[#111827]">Scan to Verify</p>
      <p className="mt-1 text-xs text-slate-500">Transaction Verification</p>
    </section>
  );
}
