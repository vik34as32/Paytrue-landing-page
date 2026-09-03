"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { RequireVerifiedRetailer } from "../components/Dmt2Guards";
import { useDmt2Store } from "../lib/dmt2-store";
import { submitTransfer } from "../lib/dmt2-service";
import { formatInr, maskAccount } from "../lib/dmt2-mock";

const schema = z.object({
  amount: z.coerce.number().positive("Enter a valid amount"),
  mode: z.enum(["IMPS", "NEFT", "RTGS"]),
  purpose: z.string().trim().min(1, "Remarks are required").max(10, "Max 10 characters"),
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
  const showOtp = searchParams?.get("otp") === "1";
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
      purpose: transfer.purpose || "",
    },
  });

  if (!beneficiary) return null;

  const onContinue = (values: FormValues) => {
    setTransfer({
      amount: values.amount,
      mode: values.mode,
      purpose: values.purpose,
    });
    setStep("txnOtp");
    router.push("/rt/retailer/dmt2/transfer?otp=1");
  };

  const onConfirm = async () => {
    setLoading(true);
    try {
      const txn = await submitTransfer({
        retailer,
        beneficiary,
        transfer: useDmt2Store.getState().transfer,
        mpin,
      });
      setLastTransaction(txn);
      setStep("success");
      toast.success(txn.status === "SUCCESS" ? "Transfer successful" : `Transfer ${txn.status.toLowerCase()}`);
      router.push(`/rt/retailer/dmt2/receipt/${encodeURIComponent(txn.id)}?success=1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return (
      <RequireVerifiedRetailer>
        <div className="space-y-5">
          <Dmt2FlowHeader activeStep={5} />
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center">
            <h2 className="text-xl font-extrabold text-[#0b1f3a]">Confirm Transaction</h2>
            <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
              <Row label="Amount" value={formatInr(transfer.amount)} />
              <Row label="Beneficiary" value={beneficiary.name} />
              <Row label="Mode" value={transfer.mode} />
            </div>
            <div className="mt-5 text-left">
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
            </div>
            <Button
              className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-violet-700"
              disabled={loading || mpin.length !== MPIN_LENGTH}
              onClick={() => void onConfirm()}
            >
              {loading ? "Confirming…" : "Confirm Transfer"}
            </Button>
          </div>
        </div>
      </RequireVerifiedRetailer>
    );
  }

  return (
    <RequireVerifiedRetailer>
      <div className="space-y-5">
        <Dmt2FlowHeader activeStep={4} />
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">Transfer Money</h2>
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Beneficiary
            </p>
            <p className="mt-1 font-extrabold text-[#0b1f3a]">{beneficiary.name}</p>
            <p className="text-sm text-slate-500">{maskAccount(beneficiary.accountNumber)}</p>
          </div>
          <form onSubmit={form.handleSubmit(onContinue)} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input type="number" min={1} placeholder="10000" {...form.register("amount")} />
              {form.formState.errors.amount ? (
                <p className="text-sm text-rose-600">{form.formState.errors.amount.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label>Transfer Mode</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {(["IMPS", "NEFT", "RTGS"] as const).map((mode) => (
                  <label
                    key={mode}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                  >
                    <input
                      type="radio"
                      value={mode}
                      {...form.register("mode")}
                      className="mt-1 accent-indigo-600"
                    />
                    <span>
                      <span className="block font-bold text-[#0b1f3a]">{mode}</span>
                      <span className="text-xs text-slate-500">
                        {mode === "IMPS"
                          ? "Instant"
                          : mode === "NEFT"
                            ? "Same / next working day"
                            : "High value"}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Remarks</Label>
              <Input maxLength={10} placeholder="Refund" {...form.register("purpose")} />
              {form.formState.errors.purpose ? (
                <p className="text-sm text-rose-600">{form.formState.errors.purpose.message}</p>
              ) : (
                <p className="text-xs text-slate-400">Max 10 characters</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-violet-700">
              Continue
            </Button>
          </form>
        </div>
      </div>
    </RequireVerifiedRetailer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold text-[#0b1f3a]">{value}</span>
    </div>
  );
}
