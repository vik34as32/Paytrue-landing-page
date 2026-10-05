"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Clock3, Copy, History, Printer, RefreshCw, SendHorizontal, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import UpiAppMark from "../components/UpiAppMark";
import UpiPayoutStatusBadge from "../components/UpiPayoutStatusBadge";
import {
  formatDateTime,
  formatInr,
  UPI_PAYOUT_TERMINAL_STATUSES,
} from "../lib/upi-payout-normalizers";
import { fetchUpiPayoutReceipt, fetchUpiPayoutStatus } from "../lib/upi-payout-service";
import type { UpiPayoutTransaction } from "../types";

const POLL_INTERVAL_MS = 4000;
const POLL_MAX_MS = 3 * 60 * 1000;

const BURST = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * Math.PI * 2;
  return {
    x: Math.cos(angle) * 70,
    y: Math.sin(angle) * 70,
    color: ["#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"][index % 4],
  };
});

function SuccessMark() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      {BURST.map((dot, index) => (
        <motion.span
          key={index}
          className="absolute h-2 w-2 rounded-full"
          style={{ backgroundColor: dot.color }}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: dot.x, y: dot.y, opacity: [0, 1, 0], scale: [0, 1.2, 0.4] }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
        />
      ))}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 15 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-200"
      >
        <svg viewBox="0 0 52 52" className="h-11 w-11" fill="none">
          <motion.path
            d="M14 27 L23 36 L39 18"
            stroke="white"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

function PendingMark() {
  return (
    <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          className="absolute inset-2 rounded-full border-2 border-indigo-300"
          animate={{ scale: [0.8, 1.3], opacity: [0.8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: ring * 0.9 }}
        />
      ))}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}>
          <Clock3 className="h-9 w-9" />
        </motion.span>
      </div>
    </div>
  );
}

function FailedMark() {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: [0, -8, 8, 0] }}
      transition={{ type: "spring", stiffness: 260, damping: 14 }}
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600"
    >
      <XCircle className="h-10 w-10" />
    </motion.div>
  );
}

export default function UpiPayoutReceiptPage() {
  const params = useParams<{ reference: string }>();
  const reference = decodeURIComponent(params?.reference ?? "");
  const [txn, setTxn] = useState<UpiPayoutTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [pollRun, setPollRun] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();

    const poll = async (current: UpiPayoutTransaction) => {
      if (!active) return;
      try {
        const next = await fetchUpiPayoutStatus(reference, current);
        if (!active) return;
        current = { ...current, ...next, createdAt: current.createdAt };
        setTxn(current);
      } catch {
        /* transient status error — retry on next tick */
      }
      if (!active) return;
      if (UPI_PAYOUT_TERMINAL_STATUSES.includes(current.status)) {
        if (current.status !== "SUCCESS") void refreshRetailerWalletData();
        return;
      }
      if (Date.now() - startedAt >= POLL_MAX_MS) {
        setTimedOut(true);
        return;
      }
      timer = setTimeout(() => void poll(current), POLL_INTERVAL_MS);
    };

    const load = async () => {
      try {
        const row = await fetchUpiPayoutReceipt(reference);
        if (!active) return;
        setTxn(row);
        setTimedOut(false);
        if (!UPI_PAYOUT_TERMINAL_STATUSES.includes(row.status)) {
          timer = setTimeout(() => void poll(row), POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : "Receipt not found");
      } finally {
        if (active) setLoading(false);
      }
    };
    if (reference) void load();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [reference, pollRun]);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <PendingMark />
        <p className="mt-4 text-sm text-slate-500">Fetching payout status…</p>
      </div>
    );
  }

  if (!txn) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="text-sm text-slate-500">Receipt not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/rt/retailer/upi-payout/history">Back to history</Link>
        </Button>
      </div>
    );
  }

  const ok = txn.status === "SUCCESS";
  const inFlight = !UPI_PAYOUT_TERMINAL_STATUSES.includes(txn.status);
  const failed = !ok && !inFlight;
  const heading = ok
    ? "Money sent successfully"
    : inFlight
      ? timedOut
        ? "Still processing"
        : "Transfer processing…"
      : `Transfer ${txn.status.toLowerCase()}`;

  const rows: { label: string; value?: string; mono?: boolean }[] = [
    { label: "Reference", value: txn.reference, mono: true },
    { label: "UTR / RRN", value: txn.utr, mono: true },
    { label: "Beneficiary", value: txn.payeeName },
    { label: "UPI ID", value: txn.vpa, mono: true },
    { label: "Mobile", value: txn.payeeMobile },
    { label: "Amount", value: formatInr(txn.amount) },
    { label: "Charges", value: txn.charges != null ? formatInr(txn.charges) : undefined },
    { label: "GST", value: txn.gst ? formatInr(txn.gst) : undefined },
    { label: "Total debit", value: txn.totalDebit != null ? formatInr(txn.totalDebit) : undefined },
    { label: "Date & time", value: formatDateTime(txn.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <motion.div
        key={txn.status}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
        className={`relative overflow-hidden rounded-3xl border p-6 text-center ${
          ok
            ? "border-emerald-200 bg-gradient-to-b from-emerald-50 to-white"
            : failed
              ? "border-rose-200 bg-gradient-to-b from-rose-50 to-white"
              : "border-indigo-100 bg-gradient-to-b from-indigo-50/60 to-white"
        }`}
      >
        {ok ? <SuccessMark /> : failed ? <FailedMark /> : <PendingMark />}
        <h1 className="mt-3 text-xl font-extrabold tracking-tight text-[#0a1630]">{heading}</h1>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-1 text-4xl font-extrabold tabular-nums tracking-tight text-[#0a1630]"
        >
          {formatInr(txn.amount)}
        </motion.p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <UpiAppMark vpa={txn.vpa} size="sm" />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-bold text-[#0a1630]">{txn.payeeName || "Beneficiary"}</p>
            <p className="truncate font-mono text-xs text-slate-500">{txn.vpa}</p>
          </div>
        </div>
        <p className="mt-3">
          <UpiPayoutStatusBadge status={txn.status} />
        </p>
        {failed && (txn.failureReason || txn.message) ? (
          <p className="mt-3 text-sm text-rose-600">{txn.failureReason || txn.message}</p>
        ) : null}
        {inFlight ? (
          <p className="mt-3 text-xs text-slate-500">
            {timedOut
              ? "The bank hasn't confirmed yet. Check again in a moment."
              : "Waiting for bank confirmation — this page updates automatically."}
          </p>
        ) : null}
        {inFlight && timedOut ? (
          <Button
            variant="outline"
            className="mt-3 h-9"
            onClick={() => {
              setTimedOut(false);
              setPollRun((run) => run + 1);
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Check again
          </Button>
        ) : null}
      </motion.div>

      {!failed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white"
        >
          <div className="border-b border-dashed border-slate-200 bg-slate-50 px-5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {ok ? "Payment receipt" : "Transfer details"}
            </p>
          </div>
          <div className="px-5 py-2">
            {rows
              .filter((row) => row.value)
              .map((row, index) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-0"
                >
                  <span className="text-sm text-slate-500">{row.label}</span>
                  <span
                    className={`max-w-[62%] break-all text-right text-sm font-semibold text-[#0a1630] ${
                      row.mono ? "font-mono text-xs" : ""
                    }`}
                  >
                    {row.value}
                  </span>
                </motion.div>
              ))}
          </div>
        </motion.div>
      ) : null}

      <div className="flex flex-wrap gap-2 print:hidden">
        {ok ? (
          <>
            <Button variant="outline" className="h-11" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={async () => {
                await navigator.clipboard.writeText(
                  `UPI Payout ${txn.reference} ${formatInr(txn.amount)} to ${txn.vpa} ${txn.status}${txn.utr ? ` UTR ${txn.utr}` : ""}`
                );
                toast.success("Details copied");
              }}
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </>
        ) : (
          <Button asChild variant="outline" className="h-11">
            <Link href="/rt/retailer/upi-payout/history">
              <History className="h-4 w-4" />
              History
            </Link>
          </Button>
        )}
        <Button asChild className="h-11 bg-[#0a1630] hover:bg-[#16244a]">
          <Link href="/rt/retailer/upi-payout">
            <SendHorizontal className="h-4 w-4" />
            Send another
          </Link>
        </Button>
      </div>
    </div>
  );
}
