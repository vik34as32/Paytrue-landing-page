"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import { useDmt3Store } from "../lib/dmt3-store";
import { fetchTransaction } from "../lib/dmt3-service";
import {
  formatDmt3Date,
  formatDmt3Inr,
  maskAccountNumber,
} from "../utils/dmt3.utils";
import type { Dmt3Transaction } from "../types/dmt3.types";

export default function Dmt3ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading receipt…
        </div>
      }
    >
      <Dmt3ReceiptContent />
    </Suspense>
  );
}

function Dmt3ReceiptContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id ?? "";
  const success = searchParams?.get("success") === "1";
  const lastTxn = useDmt3Store((s) => s.lastTxn);
  const resetTransferFlow = useDmt3Store((s) => s.resetTransferFlow);
  const [txn, setTxn] = useState<Dmt3Transaction | null>(
    lastTxn && lastTxn.id === id ? lastTxn : null
  );
  const [loading, setLoading] = useState(!txn);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (lastTxn && lastTxn.id === id) {
        setTxn(lastTxn);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const row = await fetchTransaction(id);
        if (active) setTxn(row);
      } catch {
        if (active) setTxn(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [id, lastTxn]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading receipt…
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Receipt not found.
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/rt/retailer/dmt3/transactions">Back to history</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const text = [
      "DMT3 Transaction Receipt",
      `Transaction ID: ${txn.id}`,
      `Beneficiary: ${txn.beneficiaryName}`,
      `Amount: ${formatDmt3Inr(txn.amount)}`,
      `Total Debit: ${formatDmt3Inr(txn.totalDebit ?? txn.amount)}`,
      `Mode: ${txn.transferMode}`,
      `Status: ${txn.status}`,
      txn.utr ? `UTR: ${txn.utr}` : "",
      `Date: ${formatDmt3Date(txn.createdAt)}`,
    ]
      .filter(Boolean)
      .join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Receipt details copied");
  };

  return (
    <div className="space-y-5">
      {success ? <Dmt3FlowHeader activeStep={5} /> : null}

      {success ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-[#0b1f3a]">
            {txn.status === "SUCCESS" ? "Transfer Successful" : "Transfer Submitted"}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">
            {formatDmt3Inr(txn.amount)}
          </p>
          <div className="mt-4 space-y-2 text-left text-sm">
            <Row label="Beneficiary" value={txn.beneficiaryName} />
            <Row label="Transfer Mode" value={txn.transferMode} />
            <Row label="Transaction ID" value={txn.id} />
            <Row label="Status" value={txn.status} />
            {txn.utr ? <Row label="UTR" value={txn.utr} /> : null}
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href={`/rt/retailer/dmt3/receipt/${txn.id}`}>View Receipt</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-700"
              onClick={() => {
                resetTransferFlow();
                router.push("/rt/retailer/dmt3/beneficiaries");
              }}
            >
              Make Another Transfer
            </Button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" onClick={() => void handleDownload()}>
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button asChild variant="outline">
              <Link href="/rt/retailer/dmt3/transactions">Back</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-[#0b1f3a]">Transaction Receipt</h1>
            <p className="mt-1 text-sm text-slate-500">PayTrue DMT3</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Transaction ID" value={txn.id} />
              <Info label="Beneficiary" value={txn.beneficiaryName} />
              <Info label="Amount" value={formatDmt3Inr(txn.amount)} />
              <Info
                label="Total Debit"
                value={formatDmt3Inr(txn.totalDebit ?? txn.amount)}
              />
              <Info label="Mode" value={txn.transferMode} />
              <Info label="Status" value={txn.status} />
              {txn.utr ? <Info label="UTR" value={txn.utr} /> : null}
              <Info label="Date & Time" value={formatDmt3Date(txn.createdAt)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-[#0b1f3a]">{value}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-[#001F5B]">{value}</p>
    </div>
  );
}
