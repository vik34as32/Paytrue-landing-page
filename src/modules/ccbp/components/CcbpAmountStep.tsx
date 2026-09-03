"use client";

import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import CcbpField from "./CcbpField";
import type { CcbpFormValues } from "../lib/ccbp-form-schema";
import { formatInr } from "../lib/ccbp-normalizers";
import type { CcbpPaymentType } from "../types";

const QUICK = [500, 1000, 2000, 5000, 10000];

const MODES: { id: CcbpPaymentType; title: string; hint: string }[] = [
  { id: "IMPS", title: "IMPS", hint: "Instant, 24×7" },
  { id: "NEFT", title: "NEFT", hint: "Batch settlement" },
  { id: "RTGS", title: "RTGS", hint: "High-value" },
];

export default function CcbpAmountStep({
  form,
  paymentType,
}: {
  form: UseFormReturn<CcbpFormValues>;
  paymentType: CcbpPaymentType;
}) {
  const amount = Number(form.watch("amount") || 0);
  const remarks = form.watch("remarks") || "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-[#0b1f3a]">Bill amount</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Amount is debited from wallet on successful authorization.
        </p>
      </div>

      <CcbpField label="Payable amount" error={form.formState.errors.amount?.message}>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">
            ₹
          </span>
          <Input
            type="number"
            min={1}
            step="0.01"
            placeholder="0.00"
            className="h-16 pl-10 text-3xl font-extrabold tabular-nums tracking-tight"
            {...form.register("amount")}
          />
        </div>
      </CcbpField>

      <div className="flex flex-wrap gap-2">
        {QUICK.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => form.setValue("amount", value, { shouldValidate: true, shouldDirty: true })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              amount === value
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            )}
          >
            {formatInr(value)}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Settlement rail
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {MODES.map((mode) => {
            const active = paymentType === mode.id;
            return (
              <label
                key={mode.id}
                className={cn(
                  "cursor-pointer rounded-2xl border p-3 transition",
                  active
                    ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <input type="radio" value={mode.id} className="sr-only" {...form.register("paymentType")} />
                <span className="block text-sm font-bold text-[#0b1f3a]">{mode.title}</span>
                <span className="text-[11px] text-slate-500">{mode.hint}</span>
              </label>
            );
          })}
        </div>
      </div>

      <CcbpField
        label="Remarks"
        hint={`${remarks.length}/10`}
        error={form.formState.errors.remarks?.message}
      >
        <Input maxLength={10} placeholder="Optional note" className="h-11" {...form.register("remarks")} />
      </CcbpField>
    </div>
  );
}
