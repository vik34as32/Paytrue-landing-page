"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_MODES, type PaymentMode } from "@/src/types/fundRequest";
import WalletBalanceCard from "./WalletBalanceCard";

const fundRequestSchema = z
  .object({
    amount: z
      .number({ error: "Enter a valid amount" })
      .min(100, "Minimum request is ₹100")
      .max(500000, "Maximum request is ₹5,00,000"),
    paymentMode: z.string().min(1, "Select payment mode"),
    utrNumber: z.string().optional(),
    paymentDate: z.string().min(1, "Select payment date"),
    remark: z
      .string()
      .max(200, "Remark cannot exceed 200 characters")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.paymentMode !== "Cash Deposit" &&
      data.utrNumber &&
      data.utrNumber.trim().length > 0 &&
      data.utrNumber.trim().length < 6
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid UTR number",
        path: ["utrNumber"],
      });
    }
  });

export type FundRequestFormValues = z.infer<typeof fundRequestSchema>;

interface FundRequestFormProps {
  balance: number;
  balanceLoading?: boolean;
  submitting?: boolean;
  resetSignal?: number;
  onSubmit: (values: FundRequestFormValues) => void;
  onCancel?: () => void;
}

const defaultValues: FundRequestFormValues = {
  amount: undefined as unknown as number,
  paymentMode: "",
  utrNumber: "",
  paymentDate: new Date().toISOString().slice(0, 10),
  remark: "",
};

export default function FundRequestForm({
  balance,
  balanceLoading = false,
  submitting = false,
  resetSignal = 0,
  onSubmit,
  onCancel,
}: FundRequestFormProps) {
  const form = useForm<FundRequestFormValues>({
    resolver: zodResolver(fundRequestSchema),
    defaultValues,
    mode: "onChange",
  });

  const paymentMode = form.watch("paymentMode");
  const remark = form.watch("remark") ?? "";
  const showUtr = paymentMode !== "Cash Deposit";

  useEffect(() => {
    if (paymentMode === "Cash Deposit") {
      form.setValue("utrNumber", "");
    }
  }, [paymentMode, form]);

  useEffect(() => {
    if (resetSignal > 0) {
      form.reset({
        ...defaultValues,
        paymentDate: new Date().toISOString().slice(0, 10),
      });
    }
  }, [resetSignal, form]);

  const handleCancel = () => {
    form.reset({
      ...defaultValues,
      paymentDate: new Date().toISOString().slice(0, 10),
    });
    onCancel?.();
  };

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit({
      ...values,
      paymentMode: values.paymentMode as PaymentMode,
    });
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <WalletBalanceCard balance={balance} loading={balanceLoading} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="amount">
            Amount <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
              ₹
            </span>
            <Input
              id="amount"
              type="number"
              min={100}
              max={500000}
              step={1}
              placeholder="Enter amount"
              className="pl-9"
              {...form.register("amount", { valueAsNumber: true })}
            />
          </div>
          {form.formState.errors.amount && (
            <p className="text-xs text-red-500">
              {form.formState.errors.amount.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-1">
          <Label>
            Payment Mode <span className="text-red-500">*</span>
          </Label>
          <Select
            value={paymentMode}
            onValueChange={(value) =>
              form.setValue("paymentMode", value, { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.paymentMode && (
            <p className="text-xs text-red-500">
              {form.formState.errors.paymentMode.message}
            </p>
          )}
        </div>

        {showUtr && (
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="utrNumber">UTR Number</Label>
            <Input
              id="utrNumber"
              placeholder="Enter UTR / reference number"
              {...form.register("utrNumber")}
            />
            {form.formState.errors.utrNumber && (
              <p className="text-xs text-red-500">
                {form.formState.errors.utrNumber.message}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 md:col-span-1">
          <Label htmlFor="paymentDate">Payment Date</Label>
          <Input
            id="paymentDate"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            {...form.register("paymentDate")}
          />
          {form.formState.errors.paymentDate && (
            <p className="text-xs text-red-500">
              {form.formState.errors.paymentDate.message}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="remark">Remark</Label>
            <span className="text-xs text-slate-400">
              {remark.length}/200
            </span>
          </div>
          <Textarea
            id="remark"
            placeholder="Add payment details or notes for admin review"
            maxLength={200}
            {...form.register("remark")}
          />
          {form.formState.errors.remark && (
            <p className="text-xs text-red-500">
              {form.formState.errors.remark.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={submitting}
          className="sm:min-w-[120px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={submitting}
          className="gap-2 sm:min-w-[160px]"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting..." : "Request Funds"}
        </Button>
      </div>
    </form>
  );
}

export function resetFundRequestFormDefaults(): FundRequestFormValues {
  return {
    ...defaultValues,
    paymentDate: new Date().toISOString().slice(0, 10),
  };
}
