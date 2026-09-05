"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CreditCard, Hash, Landmark } from "lucide-react";
import { BankLogo } from "@/components/retailer/BankLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import {
  RequireDmt3Session,
  RequireSelectedBeneficiary,
} from "../components/Dmt3Guards";
import { useDmt3RetailerContext } from "../hooks/useDmt3RetailerContext";
import { DMT3_MIN_TRANSFER_AMOUNT } from "../lib/dmt3-constants";
import { useDmt3Store } from "../lib/dmt3-store";
import { submitTransfer } from "../lib/dmt3-service";
import type { Dmt3Beneficiary } from "../types/dmt3.types";
import {
  buildDmt3TransferRemarks,
  formatDmt3AmountChip,
  formatDmt3Inr,
} from "../utils/dmt3.utils";

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000, 100000] as const;

const MIN_AMOUNT_MESSAGE =
  "This transaction is valid for ₹1,000 and above. Please enter at least ₹1,000.";

const schema = z.object({
  amount: z.coerce
    .number()
    .positive("Enter a valid amount")
    .min(DMT3_MIN_TRANSFER_AMOUNT, MIN_AMOUNT_MESSAGE),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt3TransferPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Loading transfer…
        </div>
      }
    >
      <Dmt3TransferForm />
    </Suspense>
  );
}

function Dmt3TransferForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showMpin = searchParams?.get("mpin") === "1";
  const beneficiary = useDmt3Store((s) => s.getSelectedBeneficiary());
  const transfer = useDmt3Store((s) => s.transfer);
  const remitter = useDmt3Store((s) => s.remitter);
  const retailer = useDmt3RetailerContext();
  const setTransfer = useDmt3Store((s) => s.setTransfer);
  const setStep = useDmt3Store((s) => s.setStep);
  const ensureClientTxnId = useDmt3Store((s) => s.ensureClientTxnId);
  const setLastTransaction = useDmt3Store((s) => s.setLastTransaction);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!beneficiary) {
      toast.error("Select a beneficiary first");
      router.replace("/rt/retailer/dmt3/beneficiaries");
    }
  }, [beneficiary, router]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    mode: "onChange",
    defaultValues: {
      amount: transfer.amount || undefined,
    },
  });

  const amountValue = Number(form.watch("amount")) || 0;

  if (!beneficiary) return null;

  const applyQuickAmount = (value: number) => {
    form.setValue("amount", value, { shouldValidate: true, shouldDirty: true });
  };

  const onContinue = (values: FormValues) => {
    if (values.amount < DMT3_MIN_TRANSFER_AMOUNT) {
      form.setError("amount", { type: "min", message: MIN_AMOUNT_MESSAGE });
      return;
    }
    setTransfer({
      amount: values.amount,
      transferMode: "IMPS",
      remarks: buildDmt3TransferRemarks(values.amount),
      beneficiaryId: beneficiary.id,
    });
    ensureClientTxnId();
    setStep("mpin");
    router.push("/rt/retailer/dmt3/transfer?mpin=1");
  };

  const onConfirm = async () => {
    if (mpin.length !== MPIN_LENGTH) {
      toast.error("Enter valid MPIN");
      return;
    }
    setLoading(true);
    try {
      const clientTxnId = ensureClientTxnId();
      const txn = await submitTransfer({
        beneficiaryId: beneficiary.id,
        transfer: {
          ...useDmt3Store.getState().transfer,
          transferMode: "IMPS",
          remarks: buildDmt3TransferRemarks(useDmt3Store.getState().transfer.amount),
        },
        mpin,
        clientTxnId,
        remitter,
        retailer,
      });
      setLastTransaction(txn);
      setStep("success");
      toast.success(
        txn.status === "SUCCESS" ? "Transfer successful" : `Transfer ${txn.status.toLowerCase()}`
      );
      router.push(`/rt/retailer/dmt3/receipt/${encodeURIComponent(txn.id)}?success=1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (showMpin) {
    return (
      <RequireDmt3Session>
        <RequireSelectedBeneficiary>
          <div className="space-y-5">
            <Dmt3FlowHeader activeStep={5} />
            <div className="mx-auto max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-[#0b1f3a] to-indigo-800 px-6 py-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
                  Confirm IMPS
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight">
                  {formatDmt3Inr(transfer.amount)}
                </p>
              </div>
              <div className="p-6">
                <BeneficiarySummary beneficiary={beneficiary} compact />
                <div className="mt-5">
                  <AnimatedMpinInput
                    label="MPIN"
                    hint="Enter your 4-digit MPIN to authorize this IMPS transfer."
                    value={mpin}
                    onChange={setMpin}
                    length={MPIN_LENGTH}
                    autoFocus
                    disabled={loading}
                    allowPaste={false}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={loading}
                    onClick={() => router.push("/rt/retailer/dmt3/transfer")}
                  >
                    Back
                  </Button>
                  <Button
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-700"
                    disabled={loading || mpin.length !== MPIN_LENGTH}
                    onClick={() => void onConfirm()}
                  >
                    {loading ? "Transferring…" : "Confirm Transfer"}
                  </Button>
                </div>
              </div>
            </div>
            <ProcessLoadingOverlay
              open={loading}
              message="Please wait..."
              detail="Payment is processing on server — do not refresh"
            />
          </div>
        </RequireSelectedBeneficiary>
      </RequireDmt3Session>
    );
  }

  return (
    <RequireDmt3Session>
      <RequireSelectedBeneficiary>
        <div className="space-y-5">
          <Dmt3FlowHeader activeStep={4} />
          <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-extrabold text-[#0b1f3a]">Transfer Money</h2>
              <p className="mt-0.5 text-sm text-slate-500">Instant IMPS to beneficiary account</p>
            </div>

            <div className="px-5 pt-5 sm:px-6">
              <BeneficiarySummary beneficiary={beneficiary} />
            </div>

            <form onSubmit={form.handleSubmit(onContinue)} className="space-y-5 p-5 sm:p-6">
              <div className="space-y-3">
                <div className="flex items-end justify-between gap-3">
                  <Label className="text-[#0b1f3a]">Amount</Label>
                  {amountValue > 0 ? (
                    <span className="text-sm font-bold text-indigo-700">
                      {formatDmt3Inr(amountValue)}
                    </span>
                  ) : null}
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <Input
                    type="number"
                    min={DMT3_MIN_TRANSFER_AMOUNT}
                    step="1"
                    placeholder="Minimum ₹1,000"
                    className="h-12 rounded-xl pl-8 text-lg font-semibold tracking-wide"
                    {...form.register("amount")}
                  />
                </div>
                {amountValue > 0 && amountValue < DMT3_MIN_TRANSFER_AMOUNT ? (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                    This transaction is valid for ₹1,000 and above.
                  </p>
                ) : form.formState.errors.amount ? (
                  <p className="text-sm text-rose-600">{form.formState.errors.amount.message}</p>
                ) : (
                  <p className="text-xs text-slate-500">Minimum transfer amount is ₹1,000.</p>
                )}
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {QUICK_AMOUNTS.map((value) => {
                    const selected = amountValue === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => applyQuickAmount(value)}
                        className={`rounded-xl border px-2 py-2.5 text-sm font-bold transition-all ${
                          selected
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                            : "border-slate-200 bg-white text-[#0b1f3a] hover:border-indigo-200 hover:bg-slate-50"
                        }`}
                      >
                        ₹{formatDmt3AmountChip(value)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-[120px]"
                  onClick={() => router.push("/rt/retailer/dmt3/beneficiaries")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={amountValue < DMT3_MIN_TRANSFER_AMOUNT}
                  className="min-w-[160px] flex-1 bg-gradient-to-r from-indigo-500 to-violet-700 sm:flex-none"
                >
                  Continue
                </Button>
              </div>
            </form>
          </div>
        </div>
      </RequireSelectedBeneficiary>
    </RequireDmt3Session>
  );
}

function BeneficiarySummary({
  beneficiary,
  compact = false,
}: {
  beneficiary: Dmt3Beneficiary;
  compact?: boolean;
}) {
  const account = String(beneficiary.accountNumber || "").trim();
  const ifsc = String(beneficiary.ifsc || "").trim().toUpperCase();

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white ${
        compact ? "p-3.5" : "p-4 sm:p-5"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white bg-white shadow-sm">
          <BankLogo
            bank={{
              name: beneficiary.bankName,
              ifscPrefix: ifsc.slice(0, 4),
              ifsc,
            }}
            size={40}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Beneficiary
          </p>
          <p className="mt-0.5 truncate text-lg font-extrabold text-[#0b1f3a]">
            {beneficiary.name || "—"}
          </p>
          <p className="truncate text-sm font-medium text-slate-600">
            {beneficiary.bankName || "Bank"}
          </p>
        </div>
      </div>

      <div className={`grid gap-2.5 ${compact ? "mt-3" : "mt-4"} sm:grid-cols-2`}>
        <DetailChip
          icon={<CreditCard className="h-3.5 w-3.5" />}
          label="Account number"
          value={account || "—"}
        />
        <DetailChip
          icon={<Hash className="h-3.5 w-3.5" />}
          label="IFSC"
          value={ifsc || "—"}
        />
        {!compact && beneficiary.mobile ? (
          <DetailChip
            icon={<Landmark className="h-3.5 w-3.5" />}
            label="Mobile"
            value={beneficiary.mobile}
            className="sm:col-span-2"
          />
        ) : null}
      </div>
    </div>
  );
}

function DetailChip({
  icon,
  label,
  value,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-100 bg-white px-3 py-2.5 ${className}`}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-all font-mono text-[13px] font-bold tracking-wide text-[#0b1f3a]">
        {value}
      </p>
    </div>
  );
}
