"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import {
  RequireDmt3Session,
  RequireSelectedBeneficiary,
} from "../components/Dmt3Guards";
import { useDmt3Store } from "../lib/dmt3-store";
import { previewCommissionApi } from "../lib/dmt3-service";
import { maskAccountNumber } from "../utils/dmt3.utils";

const schema = z.object({
  amount: z.number({ error: "Enter a valid amount" }).positive("Enter a valid amount"),
  transferMode: z.enum(["IMPS", "NEFT", "RTGS"]),
  remarks: z.string().trim().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function Dmt3TransferPage() {
  const router = useRouter();
  const beneficiary = useDmt3Store((s) => s.getSelectedBeneficiary());
  const transfer = useDmt3Store((s) => s.transfer);
  const setTransfer = useDmt3Store((s) => s.setTransfer);
  const setCommission = useDmt3Store((s) => s.setCommission);
  const setStep = useDmt3Store((s) => s.setStep);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: transfer.amount || undefined,
      transferMode: transfer.transferMode || "IMPS",
      remarks: transfer.remarks || "",
    },
  });

  useEffect(() => {
    if (!beneficiary) {
      toast.error("Select a beneficiary first");
      router.replace("/rt/retailer/dmt3/beneficiaries");
    }
  }, [beneficiary, router]);

  if (!beneficiary) return null;

  const onContinue = async (values: FormValues) => {
    setTransfer({
      amount: values.amount,
      transferMode: values.transferMode,
      remarks: values.remarks ?? "",
      beneficiaryId: beneficiary.id,
    });
    setLoading(true);
    try {
      const preview = await previewCommissionApi({
        amount: values.amount,
        transferMode: values.transferMode,
      });
      setCommission(preview);
      setStep("commission");
      router.push("/rt/retailer/dmt3/commission");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Commission preview failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireDmt3Session>
      <RequireSelectedBeneficiary>
        <div className="space-y-5">
          <Dmt3FlowHeader activeStep={2} />
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-[#0b1f3a]">Transfer Money</h2>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Beneficiary
              </p>
              <p className="mt-1 font-extrabold text-[#0b1f3a]">{beneficiary.name}</p>
              <p className="text-sm text-slate-500">
                {maskAccountNumber(beneficiary.accountNumber)} • {beneficiary.ifsc}
              </p>
            </div>
            <form onSubmit={form.handleSubmit(onContinue)} className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  min={1}
                  step="0.01"
                  placeholder="10000"
                  {...form.register("amount", { valueAsNumber: true })}
                />
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
                        {...form.register("transferMode")}
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
                <Input placeholder="Optional remark" {...form.register("remarks")} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/rt/retailer/dmt3/beneficiaries")}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-violet-700"
                >
                  {loading ? "Loading…" : "Preview Commission"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </RequireSelectedBeneficiary>
    </RequireDmt3Session>
  );
}
