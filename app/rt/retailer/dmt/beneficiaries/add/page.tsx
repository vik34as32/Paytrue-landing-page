"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useAddBeneficiary } from "@/src/hooks/useDmt";
import type { DmtApiError } from "@/src/types/dmt";
import { useState } from "react";

const schema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter valid mobile number"),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Account number must be 9-18 digits"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

type FormValues = z.infer<typeof schema>;

function AddBeneficiaryForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params.get("mobile") ?? "";
  const addMutation = useAddBeneficiary();
  const [error, setError] = useState<DmtApiError | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      mobile: mobile || "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const created = await addMutation.mutateAsync({
        name: values.name,
        mobile: values.mobile,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode.toUpperCase(),
      });
      toast.success("Beneficiary added successfully");
      if (!created.isVerified) {
        router.push(`/rt/retailer/dmt/beneficiaries/${created.id}/verify`);
        return;
      }
      router.push(
        `/rt/retailer/dmt/beneficiaries${mobile ? `?mobile=${encodeURIComponent(mobile)}` : ""}`
      );
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DmtPageHeader
        title="Add Beneficiary"
        description="Register a new beneficiary for DMT transfer"
        backHref="/rt/retailer/dmt/beneficiaries"
      />

      <Card>
        <CardHeader>
          <CardTitle>Beneficiary Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Beneficiary name" />
            </Field>
            <Field label="Mobile" error={form.formState.errors.mobile?.message}>
              <Input maxLength={10} {...form.register("mobile")} />
            </Field>
            <Field label="Account Number" error={form.formState.errors.accountNumber?.message}>
              <Input {...form.register("accountNumber")} />
            </Field>
            <Field
              label="Confirm Account Number"
              error={form.formState.errors.confirmAccountNumber?.message}
            >
              <Input {...form.register("confirmAccountNumber")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="IFSC Code" error={form.formState.errors.ifscCode?.message}>
                <Input
                  className="uppercase"
                  {...form.register("ifscCode", {
                    onChange: (e) => {
                      e.target.value = e.target.value.toUpperCase();
                    },
                  })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Add Beneficiary
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      )}
    </div>
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
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function AddBeneficiaryPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <AddBeneficiaryForm />
    </Suspense>
  );
}
