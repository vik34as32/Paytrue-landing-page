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
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { RequireVerifiedRetailer } from "../components/Dmt2Guards";
import { useDmt2Store } from "../lib/dmt2-store";
import { addBeneficiaryApi } from "../lib/dmt2-service";
import { IFSC_RE, INDIAN_MOBILE_RE } from "../lib/dmt2-mock";

const schema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    accountNumber: z.string().trim().min(6, "Account number is required"),
    confirmAccountNumber: z.string().trim().min(6, "Confirm account number"),
    ifsc: z
      .string()
      .trim()
      .toUpperCase()
      .regex(IFSC_RE, "Enter a valid IFSC"),
    mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit mobile number"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers must match",
    path: ["confirmAccountNumber"],
  });

type FormValues = z.infer<typeof schema>;

export default function Dmt2AddBeneficiaryPage() {
  const router = useRouter();
  const retailer = useDmt2Store((s) => s.retailer);
  const upsertBeneficiary = useDmt2Store((s) => s.upsertBeneficiary);
  const setStep = useDmt2Store((s) => s.setStep);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
      mobile: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      const created = await addBeneficiaryApi({
        remitterMobile: retailer.mobile,
        remitterId: retailer.remitterId,
        name: values.name.trim(),
        accountNumber: values.accountNumber.trim(),
        ifsc: values.ifsc.toUpperCase(),
        mobile: values.mobile,
      });
      upsertBeneficiary(created);
      setStep("beneficiary");
      toast.success("Beneficiary added");
      router.push("/rt/retailer/dmt2/beneficiaries");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add beneficiary");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireVerifiedRetailer>
      <div className="space-y-5">
        <Dmt2FlowHeader activeStep={3} />
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">
            Customer / Beneficiary Details
          </h2>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input placeholder="Rahul Kumar" {...form.register("name")} />
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
            <Field label="IFSC" error={form.formState.errors.ifsc?.message}>
              <Input
                placeholder="HDFC0001234"
                className="uppercase"
                {...form.register("ifsc")}
              />
            </Field>
            <Field
              label="Mobile Number"
              error={form.formState.errors.mobile?.message}
            >
              <Input
                maxLength={10}
                inputMode="numeric"
                placeholder="9876543210"
                {...form.register("mobile")}
              />
            </Field>
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-700"
            >
              {saving ? "Saving…" : "Add Beneficiary"}
            </Button>
          </form>
        </div>
      </div>
    </RequireVerifiedRetailer>
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
