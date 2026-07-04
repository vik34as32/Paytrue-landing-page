"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import BankAccountSelect from "./BankAccountSelect";
import SelectedDepositAccountCard from "./SelectedDepositAccountCard";
import ReceiptUpload from "./ReceiptUpload";
import {
  resolveDisplayBankAccounts,
} from "@/src/constants/demoCompanyBankAccounts";
import {
  PAYMENT_MODE_OPTIONS,
  type CompanyBankAccount,
  type PaymentMode,
} from "@/src/types/fundRequest";

export const fundRequestSchema = z
  .object({
    companyBankAccountId: z.string().min(1, "Please select a company bank account"),
    amount: z
      .number({ error: "Enter a valid amount" })
      .min(100, "Minimum amount is ₹100")
      .max(500000, "Maximum amount is ₹5,00,000"),
    paymentMode: z
      .string()
      .min(1, "Select payment mode")
      .refine(
        (value): value is PaymentMode =>
          PAYMENT_MODE_OPTIONS.some((option) => option.value === value),
        "Select payment mode"
      ),
    utrNumber: z.string().min(1, "Reference number is required"),
    paymentDate: z.string().min(1, "Select deposit date"),
    remark: z
      .string()
      .max(200, "Narration cannot exceed 200 characters")
      .optional(),
    receipt: z.custom<File | null>(),
  })
  .superRefine((data, ctx) => {
    if (data.utrNumber.trim().length > 0 && data.utrNumber.trim().length < 4) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid reference number",
        path: ["utrNumber"],
      });
    }

    if (!data.receipt) {
      ctx.addIssue({
        code: "custom",
        message: "Payment receipt is required",
        path: ["receipt"],
      });
    }
  });

export type FundRequestFormValues = z.infer<typeof fundRequestSchema>;

const defaultValues: FundRequestFormValues = {
  companyBankAccountId: "",
  amount: undefined as unknown as number,
  paymentMode: "",
  utrNumber: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  remark: "",
  receipt: null,
};

interface FundRequestFormProps {
  formId: string;
  bankAccounts: CompanyBankAccount[];
  selectedBankId: string;
  onSelectBank: (id: string) => void;
  banksLoading?: boolean;
  banksError?: boolean;
  submitting?: boolean;
  uploadProgress?: number;
  resetSignal?: number;
  onSubmit: (values: FundRequestFormValues) => void;
}

import { fundRequestFieldClass as fieldClassName } from "./fundRequestFieldStyles";

const labelClass = "text-xs font-semibold text-slate-700";

function FieldGroup({
  label,
  htmlFor,
  required,
  error,
  children,
  extra,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Label htmlFor={htmlFor} className={labelClass}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </Label>
        {extra}
      </div>
      {children}
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export default function FundRequestForm({
  formId,
  bankAccounts,
  selectedBankId,
  onSelectBank,
  banksLoading = false,
  banksError = false,
  submitting = false,
  uploadProgress = 0,
  resetSignal = 0,
  onSubmit,
}: FundRequestFormProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const displayAccounts = useMemo(
    () => resolveDisplayBankAccounts(bankAccounts, banksLoading),
    [bankAccounts, banksLoading]
  );

  const form = useForm<FundRequestFormValues>({
    resolver: zodResolver(fundRequestSchema),
    defaultValues,
    mode: "onChange",
  });

  const paymentMode = form.watch("paymentMode");
  const remark = form.watch("remark") ?? "";

  const selectedBank = useMemo(
    () => displayAccounts.find((a) => a.id === selectedBankId) ?? null,
    [displayAccounts, selectedBankId]
  );

  useEffect(() => {
    form.setValue("companyBankAccountId", selectedBankId, {
      shouldValidate: Boolean(selectedBankId),
    });
  }, [selectedBankId, form]);

  useEffect(() => {
    form.setValue("receipt", receiptFile, { shouldValidate: true });
  }, [receiptFile, form]);

  useEffect(() => {
    if (resetSignal > 0) {
      setReceiptFile(null);
      form.reset({
        ...defaultValues,
        paymentDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [resetSignal, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      paymentMode: values.paymentMode as PaymentMode,
      receipt: receiptFile,
    });
  });

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5">
      <section className="space-y-2.5">
        <BankAccountSelect
          accounts={displayAccounts}
          value={selectedBankId}
          onChange={onSelectBank}
          loading={banksLoading}
          error={banksError && displayAccounts.length === 0}
          disabled={submitting}
        />
        {form.formState.errors.companyBankAccountId && (
          <p className="text-[11px] text-red-500">
            {form.formState.errors.companyBankAccountId.message}
          </p>
        )}
        {selectedBank && <SelectedDepositAccountCard account={selectedBank} />}
      </section>

      <div className="h-px bg-slate-100" />

      <section className="grid gap-4 sm:grid-cols-2">
        <FieldGroup
          label="Payment Mode"
          htmlFor={`${formId}-payment-mode`}
          required
          error={form.formState.errors.paymentMode?.message}
        >
          <select
            id={`${formId}-payment-mode`}
            value={paymentMode}
            disabled={submitting}
            onChange={(event) =>
              form.setValue("paymentMode", event.target.value as PaymentMode, {
                shouldValidate: true,
              })
            }
            className={cn(fieldClassName, "w-full cursor-pointer px-3")}
          >
            <option value="" disabled>
              Select mode
            </option>
            {PAYMENT_MODE_OPTIONS.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup
          label="Amount"
          htmlFor={`${formId}-amount`}
          required
          error={form.formState.errors.amount?.message}
        >
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
              ₹
            </span>
            <Input
              id={`${formId}-amount`}
              type="number"
              min={100}
              max={500000}
              step={1}
              placeholder="0.00"
              className={`${fieldClassName} pl-7`}
              {...form.register("amount", { valueAsNumber: true })}
            />
          </div>
        </FieldGroup>

        <FieldGroup
          label="Reference Number"
          htmlFor={`${formId}-utr`}
          required
          error={form.formState.errors.utrNumber?.message}
        >
          <Input
            id={`${formId}-utr`}
            placeholder="UTR / transaction ref."
            className={fieldClassName}
            {...form.register("utrNumber")}
          />
        </FieldGroup>

        <FieldGroup
          label="Deposit Date"
          htmlFor={`${formId}-date`}
          required
          error={form.formState.errors.paymentDate?.message}
        >
          <Input
            id={`${formId}-date`}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            className={fieldClassName}
            {...form.register("paymentDate")}
          />
        </FieldGroup>

        <div className="sm:col-span-2">
          <FieldGroup
            label="Narration"
            htmlFor={`${formId}-remark`}
            extra={
              <span className="text-[10px] text-slate-400">{remark.length}/200</span>
            }
          >
            <Textarea
              id={`${formId}-remark`}
              placeholder="Optional note for admin"
              maxLength={200}
              rows={2}
              className="min-h-[64px] resize-none rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#1565d8] focus-visible:ring-2 focus-visible:ring-[#1565d8]/15"
              {...form.register("remark")}
            />
          </FieldGroup>
        </div>
      </section>

      <div className="h-px bg-slate-100" />

      <section>
        <FieldGroup
          label="Receipt Upload"
          required
          error={form.formState.errors.receipt?.message}
        >
          <ReceiptUpload
            compact
            file={receiptFile}
            onChange={setReceiptFile}
            uploading={submitting}
            uploadProgress={uploadProgress}
          />
        </FieldGroup>
      </section>
    </form>
  );
}
