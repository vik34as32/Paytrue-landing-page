"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Copy, Printer, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import CcbpStatusBadge from "../components/CcbpStatusBadge";
import { fetchCcbpReceipt } from "../lib/ccbp-service";
import { formatDateTime, formatInr, maskCard } from "../lib/ccbp-normalizers";
import type { CcbpTransaction } from "../types";

export default function CcbpReceiptPage() {
  const params = useParams<{ reference: string }>();
  const searchParams = useSearchParams();
  const reference = decodeURIComponent(params?.reference ?? "");
  const success = searchParams?.get("success") === "1";
  const [txn, setTxn] = useState<CcbpTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const row = await fetchCcbpReceipt(reference);
        if (active) setTxn(row);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Receipt not found");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (reference) void load();
    return () => {
      active = false;
    };
  }, [reference]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
        Preparing receipt…
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Receipt not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/rt/retailer/credit-card/history">Back to ledger</Link>
        </Button>
      </div>
    );
  }

  const ok = txn.status === "SUCCESS";

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="rounded-2xl border border-slate-200 bg-white p-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 280, damping: 16 }}
          className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
            ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
          }`}
        >
          {ok ? <CheckCircle2 className="h-9 w-9" /> : <XCircle className="h-9 w-9" />}
        </motion.div>
        <h1 className="mt-3 text-xl font-extrabold tracking-tight text-[#0b1f3a]">
          {success || ok ? "Settlement complete" : `Payment ${txn.status.toLowerCase()}`}
        </h1>
        <p className="mt-1 text-3xl font-extrabold tabular-nums text-[#0b1f3a]">{formatInr(txn.amount)}</p>
        <p className="mt-2">
          <CcbpStatusBadge status={txn.status} />
        </p>
        <p className="mt-2 text-xs text-slate-400">{formatDateTime(txn.createdAt)}</p>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">
        <div className="border-b border-dashed border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Official receipt
          </p>
        </div>
        <div className="space-y-0 px-5 py-2">
          <Info label="Reference" value={txn.reference} />
          <Info label="Cardholder" value={txn.payeeName} />
          <Info label="Card" value={maskCard(txn.creditCardNumber)} />
          <Info label="IFSC" value={txn.ifscCode} />
          <Info label="Rail" value={txn.paymentType} />
          {txn.remarks ? <Info label="Remarks" value={txn.remarks} /> : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" className="h-11" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={async () => {
            await navigator.clipboard.writeText(
              `CCBP ${txn.reference} ${formatInr(txn.amount)} ${txn.status}`
            );
            toast.success("Reference copied");
          }}
        >
          <Copy className="h-4 w-4" />
          Copy
        </Button>
        <Button asChild className="h-11 bg-[#0b1f3a] hover:bg-[#132a4a]">
          <Link href="/rt/retailer/credit-card">Pay another bill</Link>
        </Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[62%] break-all text-right text-sm font-semibold text-[#0b1f3a]">
        {value || "—"}
      </span>
    </div>
  );
}
