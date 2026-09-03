"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { useDmt2Store } from "../lib/dmt2-store";
import { fetchReceipt } from "../lib/dmt2-service";
import {
  formatDateLong,
  formatDateTime,
  formatInr,
  maskAccount,
} from "../lib/dmt2-mock";
import type { Dmt2Transaction } from "../types";

export default function Dmt2ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading receipt…
        </div>
      }
    >
      <Dmt2ReceiptContent />
    </Suspense>
  );
}

function Dmt2ReceiptContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id ?? "";
  const success = searchParams?.get("success") === "1";
  const lastTxn = useDmt2Store((s) => s.lastTxn);
  const resetFlow = useDmt2Store((s) => s.resetFlow);
  const [txn, setTxn] = useState<Dmt2Transaction | null>(
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
        const row = await fetchReceipt(id);
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
            <Link href="/rt/retailer/dmt2/transactions">Back to history</Link>
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
      "Transaction Receipt",
      `Transaction ID: ${txn.id}`,
      `Customer: ${txn.customerName}`,
      `Account: ${maskAccount(txn.accountNumber)}`,
      `IFSC: ${txn.ifsc}`,
      `Amount: ${formatInr(txn.amount)}`,
      `Mode: ${txn.mode}`,
      `Status: ${txn.status}`,
      `Date: ${formatDateTime(txn.createdAt)}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    toast.success("Receipt details copied");
  };

  return (
    <div className="space-y-5">
      {success ? <Dmt2FlowHeader activeStep={5} /> : null}

      {success ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-[#0b1f3a]">
            {txn.status === "SUCCESS" ? "Transfer Successful" : "Transfer Submitted"}
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">{formatInr(txn.amount)}</p>
          <div className="mt-4 space-y-2 text-left text-sm">
            <Row label="Customer" value={txn.customerName} />
            <Row label="Transfer Mode" value={txn.mode} />
            <Row label="Transaction ID" value={txn.id} />
            <Row label="Status" value={txn.status} />
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline">
              <Link href={`/rt/retailer/dmt2/receipt/${txn.id}`}>View Receipt</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-700"
              onClick={() => {
                resetFlow();
                router.push("/rt/retailer/dmt2");
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
              <Link href="/rt/retailer/dmt2/transactions">Back</Link>
            </Button>
          </div>
          <div
            className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
          >
            <h1 className="text-2xl font-extrabold text-[#0b1f3a]">Transaction Receipt</h1>
            <p className="mt-1 text-sm text-slate-500">PayTrue DMT2</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info label="Transaction ID" value={txn.id} />
              <Info label="Customer" value={txn.customerName} />
              <Info label="Account" value={maskAccount(txn.accountNumber)} />
              <Info label="IFSC" value={txn.ifsc} />
              <Info label="Amount" value={formatInr(txn.amount)} />
              <Info label="Mode" value={txn.mode} />
              <Info label="Status" value={txn.status} />
              <Info label="Date & Time" value={formatDateLong(txn.createdAt)} />
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
