"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useAddBeneficiary, useDmtBanks } from "@/src/hooks/useDmt";
import { resolveSenderMobile, setActiveSenderMobile, setBeneficiaryReferenceKey } from "@/src/lib/dmtSession";
import type { DmtApiError } from "@/src/types/dmt";

const schema = z
  .object({
    senderMobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit remitter mobile"),
    name: z.string().min(3, "Name must be at least 3 characters"),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter valid beneficiary mobile")
      .optional(),
    accountNumber: z.string().regex(/^\d{9,18}$/, "Account number must be 9-18 digits"),
    confirmAccountNumber: z.string(),
    ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
    bankId: z.string().min(1, "Select bank"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
  });

type FormValues = z.infer<typeof schema>;

function AddBeneficiaryForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mobileFromUrl = params?.get("mobile") ?? "";
  const addMutation = useAddBeneficiary();
  const { data: banks = [], isLoading: banksLoading } = useDmtBanks();
  const [error, setError] = useState<DmtApiError | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      senderMobile: "",
      name: "",
      mobile: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankId: "",
    },
  });

  useEffect(() => {
    const resolved = resolveSenderMobile(mobileFromUrl);
    if (resolved) {
      form.setValue("senderMobile", resolved, { shouldValidate: true });
    }
  }, [mobileFromUrl, form]);

  const onSubmit = async (values: FormValues) => {
    const senderMobile = values.senderMobile.replace(/\D/g, "");
    setActiveSenderMobile(senderMobile);
    setError(null);

    try {
      const created = await addMutation.mutateAsync({
        name: values.name,
        beneficiaryMobileNumber: values.mobile?.replace(/\D/g, "") || undefined,
        accountNumber: values.accountNumber,
        ifscCode: values.ifscCode.toUpperCase(),
        senderMobile,
        instantPayBankId: values.bankId,
      });
      if (created.referenceKey) {
        setBeneficiaryReferenceKey(created.id, created.referenceKey);
      }
      toast.success("Beneficiary added successfully");
      if (!created.isVerified) {
        const query = new URLSearchParams({ mobile: senderMobile });
        if (created.referenceKey) query.set("referenceKey", created.referenceKey);
        router.push(
          `/rt/retailer/dmt/beneficiaries/${created.id}/verify?${query.toString()}`
        );
        return;
      }
      router.push(
        `/rt/retailer/dmt/beneficiaries?mobile=${encodeURIComponent(senderMobile)}`
      );
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  const senderMobile = form.watch("senderMobile");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <DmtPageHeader
        title="Add Beneficiary"
        description="Enter remitter mobile and beneficiary bank details"
        backHref={
          senderMobile
            ? `/rt/retailer/dmt/beneficiaries?mobile=${encodeURIComponent(senderMobile)}`
            : "/rt/retailer/dmt/beneficiaries"
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Beneficiary Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Remitter Mobile (Sender)"
                error={form.formState.errors.senderMobile?.message}
              >
                <Input
                  maxLength={10}
                  inputMode="numeric"
                  placeholder="10-digit sender mobile"
                  {...form.register("senderMobile")}
                />
              </Field>
              {!senderMobile ? (
                <p className="mt-1 text-xs text-slate-500">
                  Not sure?{" "}
                  <Link href="/rt/retailer/dmt/sender" className="font-semibold text-[#0057D9]">
                    Search remitter first
                  </Link>
                </p>
              ) : null}
            </div>

            <Field label="Beneficiary Name" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="Beneficiary name" />
            </Field>
            <Field
              label="Beneficiary Mobile"
              error={form.formState.errors.mobile?.message}
            >
              <Input maxLength={10} inputMode="numeric" {...form.register("mobile")} />
            </Field>
            <Field label="Account Number" error={form.formState.errors.accountNumber?.message}>
              <Input inputMode="numeric" {...form.register("accountNumber")} />
            </Field>
            <Field
              label="Confirm Account Number"
              error={form.formState.errors.confirmAccountNumber?.message}
            >
              <Input inputMode="numeric" {...form.register("confirmAccountNumber")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Bank" error={form.formState.errors.bankId?.message}>
                <Select
                  value={form.watch("bankId")}
                  onValueChange={(value) =>
                    form.setValue("bankId", value, { shouldValidate: true })
                  }
                  disabled={banksLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={banksLoading ? "Loading banks..." : "Select bank"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {banks.map((bank) => (
                      <SelectItem key={bank.id} value={bank.id}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
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

      {error ? (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      ) : null}
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
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
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
