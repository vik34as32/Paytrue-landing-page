"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Dmt3Beneficiary, Dmt3TransferMode } from "../types/dmt3.types";
import { maskAccountNumber } from "../utils/dmt3.utils";

const schema = z.object({
  amount: z.number({ error: "Enter a valid amount" }).positive("Enter a valid amount"),
  transferMode: z.enum(["IMPS", "NEFT", "RTGS"]),
  remarks: z.string().trim().max(100).optional(),
});

export type Dmt3TransferFormValues = z.infer<typeof schema>;

interface Dmt3TransferFormProps {
  beneficiary: Dmt3Beneficiary;
  loading?: boolean;
  defaultValues?: Partial<Dmt3TransferFormValues>;
  onSubmit: (values: Dmt3TransferFormValues) => void;
  onBack: () => void;
}

export default function Dmt3TransferForm({
  beneficiary,
  loading,
  defaultValues,
  onSubmit,
  onBack,
}: Dmt3TransferFormProps) {
  const form = useForm<Dmt3TransferFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: defaultValues?.amount,
      transferMode: defaultValues?.transferMode ?? "IMPS",
      remarks: defaultValues?.remarks ?? "",
    },
  });

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-[#0b1f3a]">Transfer Amount</h3>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Selected Beneficiary
        </p>
        <p className="mt-1 font-bold text-[#0b1f3a]">{beneficiary.name}</p>
        <p className="text-sm text-slate-600">{beneficiary.bankName}</p>
        <p className="font-mono text-xs text-slate-500">
          {beneficiary.accountMasked || maskAccountNumber(beneficiary.accountNumber)}
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-5 grid w-full gap-4 lg:grid-cols-3"
      >
        <div className="space-y-2">
          <Label>Amount (₹)</Label>
          <Input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            {...form.register("amount", { valueAsNumber: true })}
          />
          {form.formState.errors.amount && (
            <p className="text-xs text-red-500">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Transfer Mode</Label>
          <Select
            value={form.watch("transferMode")}
            onValueChange={(v) =>
              form.setValue("transferMode", v as Dmt3TransferMode)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IMPS">IMPS</SelectItem>
              <SelectItem value="NEFT">NEFT</SelectItem>
              <SelectItem value="RTGS">RTGS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-1">
          <Label>Remarks</Label>
          <Input placeholder="Optional remark" {...form.register("remarks")} />
        </div>

        <div className="flex flex-wrap gap-2 lg:col-span-3">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Preview Commission"}
          </Button>
        </div>
      </form>
    </div>
  );
}
