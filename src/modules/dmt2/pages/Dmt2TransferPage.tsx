"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Landmark,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import { BankLogo } from "@/components/retailer/BankLogo";
import { cn } from "@/lib/utils";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import Dmt2BeneficiaryCard from "../components/Dmt2BeneficiaryCard";
import { RequireVerifiedRetailer } from "../components/Dmt2Guards";
import { useDmt2Store } from "../lib/dmt2-store";
import { submitTransfer } from "../lib/dmt2-service";
import { formatInr } from "../lib/dmt2-mock";
import {
  amountInWords,
  buildDmt2TransferRemarks,
  formatAccountNumber,
  ifscPrefix,
  resolveDmt2BankName,
} from "../lib/dmt2-bank";
import type { Dmt2TransferMode } from "../types";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000, 75000, 100000];

const MODE_OPTIONS: Array<{
  mode: Dmt2TransferMode;
  title: string;
  subtitle: string;
  tag: string;
  icon: typeof Zap;
}> = [
  { mode: "IMPS", title: "IMPS", subtitle: "Instant credit, 24×7", tag: "Recommended", icon: Zap },
  { mode: "NEFT", title: "NEFT", subtitle: "Credited in settlement batches", tag: "Batch", icon: Clock3 },
  { mode: "RTGS", title: "RTGS", subtitle: "High value, ₹2 lakh & above", tag: "High value", icon: Landmark },
];

const schema = z.object({
  amount: z.coerce.number().positive("Enter a valid amount"),
  mode: z.enum(["IMPS", "NEFT", "RTGS"]),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt2TransferPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading transfer…
        </div>
      }
    >
      <Dmt2TransferForm />
    </Suspense>
  );
}

function Dmt2TransferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showConfirm = searchParams?.get("otp") === "1";
  const beneficiary = useDmt2Store((s) => s.getSelectedBeneficiary());
  const transfer = useDmt2Store((s) => s.transfer);
  const retailer = useDmt2Store((s) => s.retailer);
  const setTransfer = useDmt2Store((s) => s.setTransfer);
  const setStep = useDmt2Store((s) => s.setStep);
  const setLastTransaction = useDmt2Store((s) => s.setLastTransaction);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!beneficiary) {
      toast.error("Select a beneficiary first");
      router.replace("/rt/retailer/dmt2/beneficiaries");
    }
  }, [beneficiary, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      amount: transfer.amount || undefined,
      mode: transfer.mode || "IMPS",
    },
  });

  const watchedAmount = Number(useWatch({ control: form.control, name: "amount" })) || 0;
  const watchedMode = useWatch({ control: form.control, name: "mode" });

  if (!beneficiary) return null;

  const bankName = resolveDmt2BankName(beneficiary);
  const accountNumber = beneficiary.accountNumber || beneficiary.accountMasked || "";
  const accountTail = accountNumber.replace(/\s+/g, "").slice(-4);

  const onContinue = (values: FormValues) => {
    setTransfer({
      amount: values.amount,
      mode: values.mode,
      purpose: buildDmt2TransferRemarks(values.amount, accountNumber),
    });
    setStep("txnOtp");
    router.push("/rt/retailer/dmt2/transfer?otp=1");
  };

  const onConfirm = async () => {
    setLoading(true);
    try {
      const draft = useDmt2Store.getState().transfer;
      const txn = await submitTransfer({
        retailer,
        beneficiary,
        transfer: { ...draft, purpose: buildDmt2TransferRemarks(draft.amount, accountNumber) },
        mpin,
      });
      console.log("[DMT2 FRONTEND] payout reference:", { reference: txn.id, mode: txn.mode });
      if (!txn.id) {
        toast.error("Transfer submitted but no reference was returned. Check transaction history.");
        router.push("/rt/retailer/dmt2/transactions");
        return;
      }

      const isImps = txn.mode === "IMPS";
      // IMPS final status comes only from GET /transaction/status — payout HTTP 200 is not success.
      const initial = isImps && txn.status === "SUCCESS" ? { ...txn, status: "PROCESSING" as const } : txn;
      setLastTransaction(initial);
      setStep("success");
      if (isImps) {
        toast.info("Transaction initiated. Checking status…");
      } else {
        toast.success(
          txn.status === "SUCCESS" ? "Transfer successful" : `Transfer ${txn.status.toLowerCase()}`
        );
      }
      router.push(`/rt/retailer/dmt2/receipt/${encodeURIComponent(txn.id)}?success=1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    const words = amountInWords(transfer.amount);
    return (
      <RequireVerifiedRetailer>
        <div className="space-y-5">
          <Dmt2FlowHeader activeStep={5} />

          <div className="mx-auto max-w-6xl">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#0b1f3a]">
                  Confirm Transfer
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Verify the beneficiary account details carefully before authorizing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/rt/retailer/dmt2/transfer")}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Edit details
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
              <div className="space-y-5">
                <Dmt2BeneficiaryCard beneficiary={beneficiary} />

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#0b1f3a]">
                      Beneficiary Details
                    </h3>
                  </header>
                  <dl className="divide-y divide-slate-100 px-5">
                    <DetailRow label="Account Holder Name" value={beneficiary.name || "—"} strong />
                    <DetailRow
                      label="Bank Name"
                      value={
                        <span className="inline-flex items-center gap-2">
                          <BankLogo
                            bank={{ name: bankName, ifscPrefix: ifscPrefix(beneficiary.ifsc) }}
                            size={22}
                          />
                          {bankName}
                        </span>
                      }
                      strong
                    />
                    <DetailRow
                      label="Account Number"
                      value={formatAccountNumber(accountNumber)}
                      mono
                      strong
                    />
                    <DetailRow label="IFSC Code" value={beneficiary.ifsc || "—"} mono />
                    {beneficiary.mobile ? (
                      <DetailRow label="Beneficiary Mobile" value={beneficiary.mobile} mono />
                    ) : null}
                    <DetailRow
                      label="Remitter"
                      value={[retailer.fullName, retailer.mobile].filter(Boolean).join(" · ") || "—"}
                    />
                  </dl>
                </section>
              </div>

              <div className="space-y-5">
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 px-5 py-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      You are sending
                    </p>
                    <p className="mt-1 text-4xl font-extrabold tracking-tight text-[#0b1f3a] tabular-nums">
                      {formatInr(transfer.amount)}
                    </p>
                    {words ? <p className="mt-1 text-xs font-medium text-slate-500">{words}</p> : null}
                  </div>
                  <dl className="divide-y divide-slate-100 px-5">
                    <DetailRow
                      label="Transfer Mode"
                      value={
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                          {transfer.mode}
                        </span>
                      }
                    />
                    <DetailRow label="Total Debit" value={formatInr(transfer.amount)} strong />
                  </dl>
                </section>

                <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Transfers cannot be reversed once processed. Confirm the account number and IFSC
                    with your customer before paying.
                  </p>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <AnimatedMpinInput
                    label="MPIN"
                    hint="Enter your 4-digit MPIN to authorize this transfer."
                    value={mpin}
                    onChange={setMpin}
                    length={MPIN_LENGTH}
                    autoFocus
                    disabled={loading}
                    allowPaste={false}
                  />
                  <button
                    type="button"
                    disabled={loading || mpin.length !== MPIN_LENGTH}
                    onClick={() => void onConfirm()}
                    className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-700 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.8)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        <LockKeyhole className="h-4 w-4" />
                        Pay {formatInr(transfer.amount)}
                      </>
                    )}
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secured with MPIN authorization
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </RequireVerifiedRetailer>
    );
  }

  const amountError = form.formState.errors.amount?.message;
  const words = amountInWords(watchedAmount);

  return (
    <RequireVerifiedRetailer>
      <div className="space-y-5">
        <Dmt2FlowHeader activeStep={4} />

        <form
          onSubmit={form.handleSubmit(onContinue)}
          className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_-20px_rgba(15,23,42,0.35)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#0b1f3a]">Transfer Money</h2>
              <p className="mt-0.5 text-sm text-slate-500">Money will be credited to the account below.</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/rt/retailer/dmt2/beneficiaries")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Change
            </button>
          </div>

          <div className="space-y-7 p-5 sm:p-7">
            <Dmt2BeneficiaryCard beneficiary={beneficiary} />

            <div>
              <SectionLabel>Amount</SectionLabel>
              <div
                className={cn(
                  "mt-2 flex items-center rounded-xl border-2 bg-white px-4 transition focus-within:border-indigo-500 focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.12)]",
                  amountError ? "border-rose-400" : "border-slate-200"
                )}
              >
                <span className="text-2xl font-bold text-slate-400">₹</span>
                <input
                  id="dmt2-amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Enter amount"
                  aria-label="Amount"
                  className="h-14 w-full bg-transparent pl-2 text-2xl font-extrabold tabular-nums text-[#0b1f3a] outline-none placeholder:text-base placeholder:font-medium placeholder:text-slate-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  {...form.register("amount")}
                />
              </div>
              {amountError ? (
                <p className="mt-1.5 text-sm font-medium text-rose-600">{amountError}</p>
              ) : (
                <p className="mt-1.5 min-h-4 text-xs font-medium text-indigo-600">{words}</p>
              )}

              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
                  {QUICK_AMOUNTS.map((value) => {
                    const active = watchedAmount === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => form.setValue("amount", value, { shouldValidate: true })}
                        className={cn(
                          "rounded-lg border px-1 py-2 text-[12px] font-bold tabular-nums transition",
                          active
                            ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        )}
                      >
                        {value >= 100000 ? "₹1 Lakh" : formatInr(value)}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <SectionLabel>Transfer Mode</SectionLabel>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {MODE_OPTIONS.map(({ mode, title, subtitle, tag, icon: Icon }) => {
                  const active = watchedMode === mode;
                  return (
                    <label
                      key={mode}
                      className={cn(
                        "group flex cursor-pointer items-center gap-3 rounded-xl border-2 px-3.5 py-3 transition",
                        active
                          ? "border-indigo-600 bg-indigo-50/70 shadow-[0_6px_16px_-10px_rgba(79,70,229,0.7)]"
                          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                      )}
                    >
                      <input type="radio" value={mode} className="sr-only" {...form.register("mode")} />
                      <span
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition",
                          active
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:text-indigo-600"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[15px] font-extrabold text-[#0b1f3a]">{title}</span>
                          {mode === "IMPS" ? (
                            <span className="rounded bg-emerald-100 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                              {tag}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                          {subtitle}
                        </span>
                      </span>
                      {active ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600" />
                      ) : (
                        <span className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 text-[15px] font-bold text-white shadow-[0_10px_24px_-10px_rgba(79,70,229,0.8)] transition hover:brightness-110 active:scale-[0.99]"
              >
                Transfer
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                You will confirm details and enter MPIN on the next step
              </p>
            </div>
          </div>
        </form>
      </div>
    </RequireVerifiedRetailer>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">{children}</p>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  strong = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="shrink-0 text-[13px] text-slate-500">{label}</dt>
      <dd
        className={cn(
          "min-w-0 text-right text-sm text-[#0b1f3a]",
          strong ? "font-bold" : "font-semibold",
          mono && "font-mono tracking-wide"
        )}
      >
        {value}
      </dd>
    </div>
  );
}
