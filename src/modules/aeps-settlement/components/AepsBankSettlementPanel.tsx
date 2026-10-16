"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  History,
  Landmark,
  Loader2,
  MapPin,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankLogo } from "@/components/retailer/BankLogo";
import { cn, formatCurrency } from "@/lib/utils";
import { useIfscLookup } from "@/src/hooks/useIfscLookup";
import { useRefreshAepsWalletBalance } from "@/src/hooks/useAepsWalletBalance";
import { getCurrentLocation } from "@/src/lib/rdService";
import {
  fetchRetailerBankAccount,
  hasRetailerBankAccount,
  RETAILER_BANK_ACCOUNT_QUERY_KEY,
} from "@/src/modules/retailer-bank-account/api";
import type { RetailerBankAccount } from "@/src/modules/retailer-bank-account/types";
import {
  aepsSettlementErrorMessage,
  AEPS_SETTLEMENTS_PATH,
  createSettlementIdempotencyKey,
  isUncertainSettlementError,
  settleAepsToBank,
} from "../api";
import type { AepsSettlement, AepsTransferMode } from "../types";

const RTGS_MINIMUM = 200000;
const QUICK_AMOUNTS = [500, 1000, 5000];

const TRANSFER_MODES: Array<{
  value: AepsTransferMode;
  title: string;
  hint: string;
}> = [
  { value: "IMPS", title: "IMPS", hint: "Instant · 24x7" },
  { value: "NEFT", title: "NEFT", hint: "Within a few hours" },
  { value: "RTGS", title: "RTGS", hint: "₹2,00,000 and above" },
];

type Step = "form" | "confirm" | "result";

function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

function useBankDisplay(account: RetailerBankAccount | undefined) {
  const ifsc = account?.ifscCode ?? "";
  const { data: ifscDetails } = useIfscLookup(ifsc);
  const stored = account?.bankName && account.bankName !== ifsc.slice(0, 4) ? account.bankName : "";
  return {
    ifsc,
    bankName: ifscDetails?.BANK || stored || account?.bankName || "Bank",
    branch: [ifscDetails?.BRANCH, ifscDetails?.CITY].filter(Boolean).join(", "),
  };
}

function LinkedAccountCard({ account, compact = false }: { account: RetailerBankAccount; compact?: boolean }) {
  const { ifsc, bankName, branch } = useBankDisplay(account);
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50",
        compact ? "p-3" : "p-4"
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <BankLogo bank={{ name: bankName, ifscPrefix: ifsc.slice(0, 4) }} size={30} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#0b1f3a]">{bankName}</p>
        {account.accountHolderName ? (
          <p className="truncate text-xs text-slate-500">{account.accountHolderName}</p>
        ) : null}
        <p className="font-mono text-xs tracking-wider text-slate-600">
          {account.accountNumberMasked || "—"} · {ifsc || "—"}
        </p>
        {branch && !compact ? <p className="truncate text-[11px] text-slate-400">{branch}</p> : null}
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
          account.status === "LINKED"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-amber-50 text-amber-700 ring-amber-200"
        )}
      >
        <ShieldCheck className="h-3 w-3" />
        {account.status === "LINKED" ? "Own account" : account.status.replace(/_/g, " ")}
      </span>
    </div>
  );
}

function SummaryRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={cn("text-right font-semibold text-slate-800", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

function SettlementResult({ result, onDone }: { result: AepsSettlement; onDone: () => void }) {
  const config =
    result.status === "SUCCESS"
      ? {
          Icon: CheckCircle2,
          tone: "bg-emerald-50 text-emerald-600",
          title: "Transfer Successful",
          text: result.message || "Money has been sent to your bank account.",
        }
      : result.status === "FAILED"
        ? {
            Icon: XCircle,
            tone: "bg-red-50 text-red-600",
            title: "Transfer Failed",
            text: result.walletReversed
              ? "The amount has been refunded to your AEPS wallet."
              : result.message || "The bank rejected this transfer.",
          }
        : {
            Icon: Clock,
            tone: "bg-amber-50 text-amber-600",
            title: "Transfer Pending",
            text:
              result.message ||
              "The bank has not confirmed this transfer yet. Check Settlement History for the final status.",
          };
  const { Icon } = config;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center text-center">
        <span className={cn("flex h-16 w-16 items-center justify-center rounded-full", config.tone)}>
          <Icon className="h-9 w-9" />
        </span>
        <p className="mt-3 text-lg font-bold text-[#0b1f3a]">{config.title}</p>
        <p className="mt-1 text-3xl font-extrabold text-[#0b1f3a]">{formatCurrency(result.amount)}</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">{config.text}</p>
        {result.status === "FAILED" && result.message && result.walletReversed ? (
          <p className="mt-1 text-xs text-slate-400">Reason: {result.message}</p>
        ) : null}
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
        <SummaryRow label="To account" value={`${result.accountNumberMasked} · ${result.ifscCode}`} mono />
        <SummaryRow label="Transfer mode" value={result.transferMode} />
        <SummaryRow label="Reference" value={result.externalRef} mono />
        {result.txnReferenceId ? <SummaryRow label="Bank reference (UTR)" value={result.txnReferenceId} mono /> : null}
        {result.closingBalance != null ? (
          <SummaryRow label="AEPS wallet balance" value={formatCurrency(result.closingBalance)} />
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={AEPS_SETTLEMENTS_PATH}>
            <History className="h-4 w-4" />
            Settlement History
          </Link>
        </Button>
        <Button type="button" onClick={onDone} className="rounded-xl bg-[#1565d8] text-white hover:bg-[#0b4fb3]">
          Done
        </Button>
      </div>
    </div>
  );
}

export default function AepsBankSettlementPanel({
  balance,
  onClose,
}: {
  balance: number;
  onClose: () => void;
}) {
  const refreshBalance = useRefreshAepsWalletBalance();
  const accountQuery = useQuery({
    queryKey: RETAILER_BANK_ACCOUNT_QUERY_KEY,
    queryFn: fetchRetailerBankAccount,
    staleTime: 60_000,
  });
  const account = accountQuery.data;

  const [step, setStep] = useState<Step>("form");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<AepsTransferMode>("IMPS");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState<"idle" | "locating" | "submitting">("idle");
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [uncertain, setUncertain] = useState(false);
  const [result, setResult] = useState<AepsSettlement | null>(null);

  const numericAmount = roundAmount(Number(amount));
  const busy = stage !== "idle";

  const validate = (): string => {
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return "Enter a valid amount greater than 0.";
    if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) return "Amount can have at most 2 decimal places.";
    if (numericAmount > balance) return "Amount cannot exceed your AEPS wallet balance.";
    if (mode === "RTGS" && numericAmount < RTGS_MINIMUM) return "RTGS requires a minimum of ₹2,00,000.";
    return "";
  };

  const goToConfirm = () => {
    const message = validate();
    setError(message);
    if (message) return;
    setIdempotencyKey(createSettlementIdempotencyKey());
    setUncertain(false);
    setStep("confirm");
  };

  const submit = async () => {
    if (busy || !idempotencyKey) return;
    setError("");
    setStage("locating");
    let location: { latitude: string; longitude: string };
    try {
      location = await getCurrentLocation();
    } catch (locationError) {
      setStage("idle");
      setError(locationError instanceof Error ? locationError.message : "Unable to fetch current location.");
      return;
    }

    setStage("submitting");
    try {
      const settlement = await settleAepsToBank({
        amount: numericAmount,
        transferMode: mode,
        latitude: location.latitude,
        longitude: location.longitude,
        remarks: remarks.trim() || undefined,
        idempotencyKey,
      });
      setResult(settlement);
      setStep("result");
      if (settlement.status === "SUCCESS") toast.success("AEPS settlement successful");
      else if (settlement.status === "FAILED") toast.error(settlement.message || "AEPS settlement failed");
      else toast.info("AEPS settlement is pending bank confirmation");
    } catch (submitError) {
      if (isUncertainSettlementError(submitError)) {
        setUncertain(true);
        setError(
          "We could not confirm this transfer. Retrying below is safe — it reuses the same reference and will not debit you twice."
        );
      } else {
        setError(aepsSettlementErrorMessage(submitError));
      }
    } finally {
      setStage("idle");
      void refreshBalance();
    }
  };

  if (accountQuery.isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your bank account...
      </div>
    );
  }

  if (accountQuery.isError) {
    return (
      <div className="space-y-3 py-6 text-center">
        <p className="text-sm text-red-600">Unable to load your bank account.</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void accountQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!hasRetailerBankAccount(account)) {
    const pending = account?.status === "PENDING";
    return (
      <div className="space-y-4 py-4 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1565d8]">
          <Landmark className="h-7 w-7" />
        </span>
        <div>
          <p className="font-semibold text-[#0b1f3a]">
            {pending ? "Bank account confirmation pending" : "Link your bank account first"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            {pending
              ? "Your bank account link is awaiting confirmation. You can transfer once it is linked."
              : "AEPS balance can only be transferred to your own linked bank account."}
          </p>
        </div>
        <Button asChild className="rounded-xl bg-[#1565d8] text-white hover:bg-[#0b4fb3]">
          <Link href="/rt/retailer/bank-account">{pending ? "View Bank Account" : "Add Bank Account"}</Link>
        </Button>
      </div>
    );
  }

  if (step === "result" && result) {
    return <SettlementResult result={result} onDone={onClose} />;
  }

  if (step === "confirm") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#1565d8] to-[#0b4fb3] p-5 text-center text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-blue-100">You are transferring</p>
          <p className="mt-1 text-3xl font-extrabold">{formatCurrency(numericAmount)}</p>
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
            <Zap className="h-3 w-3" />
            via {mode}
          </p>
        </div>

        <LinkedAccountCard account={account} compact />

        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
          <SummaryRow label="AEPS wallet balance" value={formatCurrency(balance)} />
          <SummaryRow label="Balance after transfer" value={formatCurrency(roundAmount(balance - numericAmount))} />
          {remarks.trim() ? <SummaryRow label="Remarks" value={remarks.trim()} /> : null}
        </div>

        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          Your current location will be shared with the bank for this transfer.
        </p>

        {error ? (
          <div
            className={cn(
              "flex gap-2 rounded-xl border p-3 text-sm",
              uncertain ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-700"
            )}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {uncertain ? (
            <Button asChild variant="outline" className="rounded-xl">
              <Link href={AEPS_SETTLEMENTS_PATH}>
                <History className="h-4 w-4" />
                Check History
              </Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setError("");
                setStep("form");
              }}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
              Edit
            </Button>
          )}
          <Button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="rounded-xl bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white shadow-md"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {stage === "locating" ? "Fetching location..." : "Transferring..."}
              </>
            ) : uncertain ? (
              "Retry Transfer"
            ) : (
              "Confirm & Transfer"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AEPS wallet balance</p>
          <p className="text-xl font-bold text-[#0b1f3a]">{formatCurrency(balance)}</p>
        </div>
        <Link
          href={AEPS_SETTLEMENTS_PATH}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1565d8] hover:underline"
        >
          <History className="h-3.5 w-3.5" />
          History
        </Link>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transfer to</Label>
        <LinkedAccountCard account={account} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="aeps-settle-amount">Amount (₹)</Label>
        <Input
          id="aeps-settle-amount"
          inputMode="decimal"
          value={amount}
          placeholder="Enter amount"
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
          className="h-12 rounded-xl text-lg font-semibold"
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_AMOUNTS.map((value) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setAmount(String(value))}
            >
              ₹{value.toLocaleString("en-IN")}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full border-emerald-300 text-emerald-700"
            onClick={() => setAmount(String(roundAmount(balance)))}
          >
            Full balance
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Transfer mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {TRANSFER_MODES.map((option) => {
            const active = mode === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={cn(
                  "relative rounded-xl border p-3 text-left transition",
                  active
                    ? "border-[#1565d8] bg-blue-50 ring-2 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-blue-200"
                )}
              >
                {option.value === "IMPS" ? (
                  <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    Fast
                  </span>
                ) : null}
                <p className={cn("text-sm font-bold", active ? "text-[#1565d8]" : "text-slate-800")}>
                  {option.title}
                </p>
                <p className="text-[11px] text-slate-500">{option.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="aeps-settle-remarks">
          Remarks <span className="font-normal text-slate-400">(optional)</span>
        </Label>
        <Input
          id="aeps-settle-remarks"
          value={remarks}
          maxLength={20}
          placeholder="e.g. Shop settlement"
          onChange={(event) => setRemarks(event.target.value.replace(/[^A-Za-z ]/g, ""))}
          className="h-11 rounded-xl"
        />
      </div>

      {error ? (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-xl">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={goToConfirm}
          disabled={balance <= 0}
          className="rounded-xl bg-gradient-to-r from-[#1565d8] to-[#0b4fb3] text-white shadow-md"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
