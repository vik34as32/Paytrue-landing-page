"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, FileText, Loader2, RefreshCw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import CustomerReceiptModal from "@/src/components/receipt/CustomerReceiptModal";
import { mapDmt2TransactionToStatement } from "@/src/lib/serviceReceiptMappers";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import Dmt2ReceiptDetails from "../components/Dmt2ReceiptDetails";
import Dmt2StatusBadge from "../components/Dmt2StatusBadge";
import { useDmt2Store } from "../lib/dmt2-store";
import { fetchFinalReceipt, fetchReceipt } from "../lib/dmt2-service";
import { mergeDmt2Transaction } from "../lib/dmt2-normalizers";
import { useDmt2StatusPolling } from "../lib/useDmt2StatusPolling";
import { formatDateLong, formatInr } from "../lib/dmt2-mock";
import type { Dmt2Beneficiary, Dmt2Transaction } from "../types";

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

function accountTail(value?: string): string {
  return String(value || "").replace(/\s+/g, "").slice(-4);
}

/** Only trust the selected beneficiary when it is the payee of this transaction. */
function matchesBeneficiary(txn: Dmt2Transaction, beneficiary: Dmt2Beneficiary | null): boolean {
  if (!beneficiary) return false;
  const txnTail = accountTail(txn.accountNumber);
  const benTail = accountTail(beneficiary.accountNumber || beneficiary.accountMasked);
  if (txnTail && benTail && txnTail !== benTail) return false;
  if (txn.ifsc && beneficiary.ifsc && txn.ifsc.toUpperCase() !== beneficiary.ifsc.toUpperCase()) {
    return false;
  }
  return Boolean(txnTail || txn.ifsc);
}

function Dmt2ReceiptContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id ?? "";
  const success = searchParams?.get("success") === "1";
  const resetFlow = useDmt2Store((s) => s.resetFlow);
  const setLastTransaction = useDmt2Store((s) => s.setLastTransaction);
  const selectedBeneficiary = useDmt2Store((s) => s.getSelectedBeneficiary());
  const retailer = useDmt2Store((s) => s.retailer);

  const [txn, setTxn] = useState<Dmt2Transaction | null>(() => {
    const last = useDmt2Store.getState().lastTxn;
    return last && last.id === id ? last : null;
  });
  const [loadFailed, setLoadFailed] = useState(false);
  const [receipt, setReceipt] = useState<Dmt2Transaction | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const receiptRequestedRef = useRef<string | null>(null);

  const needsLoad = !txn && !loadFailed;
  useEffect(() => {
    if (!needsLoad || !id) return;
    let active = true;
    fetchReceipt(id)
      .then((row) => {
        if (active) setTxn(row);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [id, needsLoad]);

  // Live IMPS result: final status must come from GET /transaction/status, never from payout HTTP 200.
  const liveImps = success && txn?.mode === "IMPS";

  const { phase, restart } = useDmt2StatusPolling({
    reference: id,
    enabled: liveImps,
    fallback: txn ?? undefined,
    onUpdate: (update) => setTxn((prev) => (prev ? mergeDmt2Transaction(prev, update) : update)),
  });

  const loadFinalReceipt = useCallback(async (reference: string) => {
    console.log("[DMT2 FRONTEND] fetching receipt:", { reference });
    try {
      const row = await fetchFinalReceipt(reference, { status: "SUCCESS" });
      console.log("[DMT2 FRONTEND] receipt received:", { reference, status: row.status });
      setReceipt(row);
    } catch (error) {
      setReceiptError(error instanceof Error ? error.message : "Unable to fetch receipt");
    } finally {
      setReceiptOpen(true);
    }
  }, []);

  const retryReceipt = () => {
    setReceiptError("");
    void loadFinalReceipt(id);
  };

  useEffect(() => {
    if (phase !== "success" || receiptRequestedRef.current === id) return;
    receiptRequestedRef.current = id;
    void loadFinalReceipt(id);
  }, [phase, id, loadFinalReceipt]);

  const finalReceipt = useMemo(
    () => (receipt && txn ? mergeDmt2Transaction(txn, receipt) : receipt),
    [receipt, txn]
  );

  useEffect(() => {
    if (success && txn) setLastTransaction(finalReceipt ?? txn);
  }, [success, txn, finalReceipt, setLastTransaction]);

  const receiptSource = finalReceipt ?? txn;
  const receiptTransaction = useMemo(() => {
    if (!receiptSource) return null;
    const beneficiary = matchesBeneficiary(receiptSource, selectedBeneficiary)
      ? selectedBeneficiary
      : null;
    const sender = success
      ? { name: retailer.fullName, mobile: retailer.mobile }
      : undefined;
    return mapDmt2TransactionToStatement(receiptSource, beneficiary, sender);
  }, [receiptSource, selectedBeneficiary, retailer.fullName, retailer.mobile, success]);

  if (!txn && !loadFailed) {
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

  const startNewTransfer = () => {
    setReceiptOpen(false);
    resetFlow();
    router.push("/rt/retailer/dmt2");
  };

  const isSuccess = (receiptSource ?? txn).status === "SUCCESS";

  const receiptModal = (
    <CustomerReceiptModal
      open={Boolean(receiptOpen && receiptTransaction)}
      onClose={() => setReceiptOpen(false)}
      transaction={receiptTransaction}
      title={isSuccess ? "Money Transfer Successful" : "Xpress DMT Receipt"}
    />
  );

  const viewReceiptButton = (
    <Button
      className="bg-gradient-to-r from-indigo-500 to-violet-700"
      onClick={() => setReceiptOpen(true)}
      disabled={!receiptTransaction}
    >
      <FileText className="h-4 w-4" />
      View Receipt
    </Button>
  );

  if (liveImps) {
    const receiptLoading = phase === "success" && !receipt && !receiptError;
    const checking = phase === "polling" || receiptLoading;
    return (
      <div className="space-y-5">
        <Dmt2FlowHeader activeStep={5} />

        <ProcessLoadingOverlay
          open={checking}
          message={phase === "success" ? "Generating receipt..." : "Transaction processing..."}
          detail={
            phase === "success"
              ? "Fetching your final receipt from the bank"
              : "Checking bank status every 20–25 seconds — please do not refresh or go back"
          }
        />

        {phase === "polling" ? (
          <StatusCard
            tone="processing"
            txn={txn}
            title="Transaction Processing..."
            subtitle="Waiting for bank confirmation. Please do not refresh or go back."
          >
            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              Checking status every 20–25 seconds
            </div>
          </StatusCard>
        ) : null}

        {phase === "timeout" ? (
          <StatusCard
            tone="pending"
            txn={txn}
            title="Still Processing"
            subtitle="The bank has not confirmed this transfer yet. You can check again or track it in transaction history."
          >
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Button variant="outline" asChild>
                <Link href="/rt/retailer/dmt2/transactions">Transaction History</Link>
              </Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-violet-700" onClick={restart}>
                <RefreshCw className="h-4 w-4" />
                Check Again
              </Button>
            </div>
          </StatusCard>
        ) : null}

        {phase === "failed" ? (
          <StatusCard
            tone="failed"
            txn={txn}
            title="Transaction Failed"
            subtitle={txn.failureReason || txn.providerMessage || "The bank could not process this transfer."}
          >
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Button variant="outline" asChild>
                <Link href="/rt/retailer/dmt2/transactions">Transaction History</Link>
              </Button>
              <Button className="bg-gradient-to-r from-indigo-500 to-violet-700" onClick={startNewTransfer}>
                Make Another Transfer
              </Button>
            </div>
          </StatusCard>
        ) : null}

        {phase === "success" ? (
          <StatusCard
            tone="success"
            txn={receiptSource ?? txn}
            title="Transaction Successful"
            subtitle="Money has been transferred successfully."
          >
            {receiptError ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <p className="font-semibold">{receiptError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={retryReceipt}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Receipt
                </Button>
              </div>
            ) : null}
            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {viewReceiptButton}
              <Button variant="outline" asChild>
                <Link href="/rt/retailer/dmt2/transactions">History</Link>
              </Button>
              <Button variant="outline" onClick={startNewTransfer}>
                New Transfer
              </Button>
            </div>
          </StatusCard>
        ) : null}

        {receiptModal}
      </div>
    );
  }

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
            {viewReceiptButton}
            <Button variant="outline" onClick={startNewTransfer}>
              Make Another Transfer
            </Button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex flex-wrap gap-2 print:hidden">
            {viewReceiptButton}
            <Button asChild variant="outline">
              <Link href="/rt/retailer/dmt2/transactions">Back</Link>
            </Button>
          </div>
          <Dmt2ReceiptDetails txn={txn} />
        </div>
      )}

      {receiptModal}
    </div>
  );
}

const TONES = {
  processing: {
    border: "border-indigo-200",
    iconWrap: "bg-indigo-50 text-indigo-600",
    icon: <Loader2 className="h-8 w-8 animate-spin" />,
    amount: "text-indigo-600",
  },
  pending: {
    border: "border-amber-200",
    iconWrap: "bg-amber-50 text-amber-600",
    icon: <Clock3 className="h-8 w-8" />,
    amount: "text-amber-600",
  },
  success: {
    border: "border-emerald-200",
    iconWrap: "bg-emerald-50 text-emerald-600",
    icon: <CheckCircle2 className="h-8 w-8" />,
    amount: "text-emerald-600",
  },
  failed: {
    border: "border-rose-200",
    iconWrap: "bg-rose-50 text-rose-600",
    icon: <XCircle className="h-8 w-8" />,
    amount: "text-rose-600",
  },
} as const;

function StatusCard({
  tone,
  txn,
  title,
  subtitle,
  children,
}: {
  tone: keyof typeof TONES;
  txn: Dmt2Transaction;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  const style = TONES[tone];
  return (
    <div className={`mx-auto max-w-lg rounded-2xl border bg-white p-6 text-center shadow-sm ${style.border}`}>
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${style.iconWrap}`}>
        {style.icon}
      </div>
      <h2 className="mt-3 text-xl font-extrabold text-[#0b1f3a]">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <p className={`mt-3 text-3xl font-extrabold ${style.amount}`}>{formatInr(txn.amount)}</p>
      <div className="mt-4 space-y-2 text-left text-sm">
        <Row label="Beneficiary" value={txn.customerName || "—"} />
        <Row label="Transaction Reference" value={txn.id} />
        <Row label="Date & Time" value={formatDateLong(txn.updatedAt || txn.createdAt)} />
        <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
          <span className="text-slate-500">Status</span>
          <Dmt2StatusBadge status={txn.status} />
        </div>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className="min-w-0 break-all text-right font-bold text-[#0b1f3a]">{value}</span>
    </div>
  );
}
