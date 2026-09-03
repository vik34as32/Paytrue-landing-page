"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import CustomerReceiptModal from "@/src/components/receipt/CustomerReceiptModal";
import { mapDmt3TransactionToStatement } from "@/src/lib/serviceReceiptMappers";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import { useDmt3Store } from "../lib/dmt3-store";
import { fetchTransactionStatus } from "../lib/dmt3-service";
import { formatDmt3Inr, isPendingLikeStatus } from "../utils/dmt3.utils";
import type { Dmt3Transaction } from "../types/dmt3.types";

const POLL_MS = 2000;
const MAX_POLLS = 20;

export default function Dmt3ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Checking transaction status…
        </div>
      }
    >
      <Dmt3ReceiptContent />
    </Suspense>
  );
}

function uniqueRefs(...values: Array<string | undefined | null>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const ref = String(value || "").trim();
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    out.push(ref);
  }
  return out;
}

async function loadStatus(references: string[]): Promise<Dmt3Transaction | null> {
  let lastError: unknown = null;
  for (const reference of references) {
    try {
      return await fetchTransactionStatus(reference);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
  return null;
}

function Dmt3ReceiptContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id ?? "";
  const lastTxn = useDmt3Store((s) => s.lastTxn);
  const remitter = useDmt3Store((s) => s.remitter);
  const beneficiary = useDmt3Store((s) => s.getSelectedBeneficiary());
  const resetTransferFlow = useDmt3Store((s) => s.resetTransferFlow);
  const setLastTransaction = useDmt3Store((s) => s.setLastTransaction);

  const [txn, setTxn] = useState<Dmt3Transaction | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const references = uniqueRefs(
      id,
      lastTxn?.id,
      lastTxn?.reference,
      lastTxn?.clientTxnId
    );
    if (!references.length) {
      setChecking(false);
      setError("Transaction reference missing.");
      return;
    }

    const poll = async () => {
      attempts += 1;
      try {
        const row = await loadStatus(references);
        if (!active) return;
        if (!row) {
          setError("Unable to fetch transaction status.");
          setChecking(false);
          return;
        }

        setTxn(row);
        setLastTransaction(row);
        setError("");

        if (row.status === "SUCCESS") {
          setChecking(false);
          setReceiptOpen(true);
          return;
        }

        if (row.status === "FAILED" || row.status === "REFUNDED" || row.status === "REVERSED") {
          setChecking(false);
          setReceiptOpen(false);
          return;
        }

        if (isPendingLikeStatus(row.status) && attempts < MAX_POLLS) {
          setChecking(true);
          timer = setTimeout(() => {
            void poll();
          }, POLL_MS);
          return;
        }

        setChecking(false);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to fetch transaction status.");
        setChecking(false);
      }
    };

    void poll();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [id, lastTxn?.id, lastTxn?.reference, lastTxn?.clientTxnId, setLastTransaction]);

  const receiptTransaction = useMemo(
    () =>
      txn?.status === "SUCCESS"
        ? mapDmt3TransactionToStatement(txn, beneficiary, {
            name: remitter.fullName,
            mobile: remitter.mobile,
          })
        : null,
    [txn, beneficiary, remitter.fullName, remitter.mobile]
  );

  const isSuccess = txn?.status === "SUCCESS";
  const isFailed =
    txn?.status === "FAILED" || txn?.status === "REFUNDED" || txn?.status === "REVERSED";

  return (
    <div className="space-y-5">
      <Dmt3FlowHeader activeStep={5} />

      <ProcessLoadingOverlay
        open={checking}
        message="Please wait..."
        detail="Checking DMT3 transaction status — do not refresh"
      />

      {!checking && error && !txn ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-3 text-xl font-extrabold text-[#0b1f3a]">Status unavailable</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/rt/retailer/dmt3/transactions">Back to history</Link>
          </Button>
        </div>
      ) : null}

      {!checking && isFailed && txn ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-rose-200 bg-white p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h2 className="mt-3 text-xl font-extrabold text-[#0b1f3a]">Transfer Failed</h2>
          <p className="mt-2 text-3xl font-extrabold text-rose-600">
            {formatDmt3Inr(txn.amount)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {txn.failureReason || "Transaction was not successful."}
          </p>
          <div className="mt-6">
            <Button
              className="bg-gradient-to-r from-indigo-500 to-violet-700"
              onClick={() => {
                resetTransferFlow();
                router.push("/rt/retailer/dmt3/beneficiaries");
              }}
            >
              Try Another Transfer
            </Button>
          </div>
        </div>
      ) : null}

      {!checking && txn && isPendingLikeStatus(txn.status) ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-200 bg-white p-6 text-center">
          <h2 className="text-xl font-extrabold text-[#0b1f3a]">Transfer Processing</h2>
          <p className="mt-2 text-sm text-slate-500">
            Status is still {txn.status}. Receipt will appear only after SUCCESS.
          </p>
          <Button asChild className="mt-5" variant="outline">
            <Link href="/rt/retailer/dmt3/transactions">Check history</Link>
          </Button>
        </div>
      ) : null}

      {!checking && isSuccess && txn ? (
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-200 bg-white p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-[#0b1f3a]">Transfer Successful</h2>
          <p className="mt-2 text-3xl font-extrabold text-indigo-600">
            {formatDmt3Inr(txn.amount)}
          </p>
          <p className="mt-2 text-sm text-slate-500">{txn.beneficiaryName}</p>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button variant="outline" onClick={() => setReceiptOpen(true)}>
              View Receipt
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
      ) : null}

      <CustomerReceiptModal
        open={Boolean(isSuccess && receiptOpen && receiptTransaction)}
        onClose={() => setReceiptOpen(false)}
        transaction={receiptTransaction}
        title="Money Transfer Successful"
      />
    </div>
  );
}
