"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(3, "Enter beneficiary name").max(80),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile"),
  bankName: z.string().min(2, "Enter bank name"),
  accountNumber: z.string().regex(/^\d{9,18}$/, "Enter valid account number"),
  ifscCode: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
});

export type Dmt3AddBeneficiaryValues = z.infer<typeof schema>;

interface Dmt3AddBeneficiaryProps {
  loading?: boolean;
  onSubmit: (values: Dmt3AddBeneficiaryValues) => void;
  onCancel: () => void;
}

export default function Dmt3AddBeneficiary({
  loading,
  onSubmit,
  onCancel,
}: Dmt3AddBeneficiaryProps) {
  const form = useForm<Dmt3AddBeneficiaryValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      mobile: "",
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    },
  });

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <h3 className="text-base font-bold text-[#0b1f3a]">Add Beneficiary</h3>
      <p className="mt-1 text-xs text-slate-500">
        Beneficiary details are verified through DMT3 backend.
      </p>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-5 grid w-full gap-4 sm:grid-cols-2"
      >
        <div className="space-y-2">
          <Label>Beneficiary Name</Label>
          <Input placeholder="Full name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Mobile Number</Label>
          <Input
            placeholder="10-digit mobile"
            maxLength={10}
            {...form.register("mobile")}
          />
          {form.formState.errors.mobile && (
            <p className="text-xs text-red-500">
              {form.formState.errors.mobile.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Bank Name</Label>
          <Input placeholder="Bank name" {...form.register("bankName")} />
          {form.formState.errors.bankName && (
            <p className="text-xs text-red-500">
              {form.formState.errors.bankName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            placeholder="Account number"
            {...form.register("accountNumber")}
          />
          {form.formState.errors.accountNumber && (
            <p className="text-xs text-red-500">
              {form.formState.errors.accountNumber.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>IFSC Code</Label>
          <Input
            placeholder="SBIN0001234"
            className="uppercase"
            {...form.register("ifscCode", {
              onChange: (e) => {
                e.target.value = e.target.value.toUpperCase();
              },
            })}
          />
          {form.formState.errors.ifscCode && (
            <p className="text-xs text-red-500">
              {form.formState.errors.ifscCode.message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save Beneficiary"}
          </Button>
        </div>
      </form>
    </div>
  );
}
