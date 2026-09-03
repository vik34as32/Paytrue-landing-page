"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import { RequireDmt3Session } from "../components/Dmt3Guards";
import { IFSC_RE, INDIAN_MOBILE_RE } from "../lib/dmt3-constants";
import { addBeneficiaryApi } from "../lib/dmt3-service";
import { useDmt3Store } from "../lib/dmt3-store";

const schema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit mobile number"),
    bankName: z.string().trim().min(2, "Bank name is required"),
    accountNumber: z.string().trim().min(6, "Account number is required"),
    confirmAccountNumber: z.string().trim().min(6, "Confirm account number"),
    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(IFSC_RE, "Enter a valid IFSC"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers must match",
    path: ["confirmAccountNumber"],
  });

type FormValues = z.infer<typeof schema>;

export default function Dmt3AddBeneficiaryPage() {
  const router = useRouter();
  const upsertBeneficiary = useDmt3Store((s) => s.upsertBeneficiary);
  const setStep = useDmt3Store((s) => s.setStep);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      mobile: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const created = await addBeneficiaryApi({
        name: values.name.trim(),
        mobile: values.mobile,
        bankName: values.bankName.trim(),
        accountNumber: values.accountNumber.trim(),
        ifscCode: values.ifscCode.toUpperCase(),
      });
      upsertBeneficiary(created);
      setStep("beneficiary");
      toast.success("Beneficiary added");
      router.push("/rt/retailer/dmt3/beneficiaries");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add beneficiary");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireDmt3Session>
      <div className="space-y-5">
        <Dmt3FlowHeader activeStep={1} />
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">
            Customer / Beneficiary Details
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input placeholder="Rahul Kumar" {...form.register("name")} />
            </Field>
            <Field label="Mobile Number" error={form.formState.errors.mobile?.message}>
              <Input
                maxLength={10}
                inputMode="numeric"
                placeholder="9876543210"
                {...form.register("mobile")}
              />
            </Field>
            <Field label="Bank Name" error={form.formState.errors.bankName?.message}>
              <Input placeholder="State Bank of India" {...form.register("bankName")} />
            </Field>
            <Field
              label="Account Number"
              error={form.formState.errors.accountNumber?.message}
            >
              <Input
                inputMode="numeric"
                placeholder="123456789012"
                {...form.register("accountNumber")}
              />
            </Field>
            <Field
              label="Confirm Account Number"
              error={form.formState.errors.confirmAccountNumber?.message}
            >
              <Input
                inputMode="numeric"
                placeholder="123456789012"
                {...form.register("confirmAccountNumber")}
              />
            </Field>
            <Field label="IFSC" error={form.formState.errors.ifscCode?.message}>
              <Input
                placeholder="HDFC0001234"
                className="uppercase"
                {...form.register("ifscCode")}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/rt/retailer/dmt3/beneficiaries")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-500 to-violet-700"
              >
                {saving ? "Saving…" : "Add Beneficiary"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </RequireDmt3Session>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
