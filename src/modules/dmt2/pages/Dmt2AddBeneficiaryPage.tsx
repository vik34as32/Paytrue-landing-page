"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import BankSelect from "@/components/retailer/BankSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import BankAccountVerifyInput from "@/src/components/dmt/BankAccountVerifyInput";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import { useFetchBanksQuery } from "@/src/modules/dmt/redux/dmtApi";
import { verifyBankAccount } from "@/src/services/dmtService";
import { ifscGlobalFromBank, mergeDmt3BankMaster } from "@/src/modules/dmt3/lib/dmt3-bank-master";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import { RequireVerifiedRetailer } from "../components/Dmt2Guards";
import { useDmt2Store } from "../lib/dmt2-store";
import { addBeneficiaryApi } from "../lib/dmt2-service";
import { IFSC_RE, INDIAN_MOBILE_RE } from "../lib/dmt2-mock";

const schema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    mobile: z.string().regex(INDIAN_MOBILE_RE, "Enter valid 10-digit mobile number"),
    bankName: z.string().trim().min(2, "Select bank"),
    accountNumber: z.string().trim().min(6, "Account number is required"),
    confirmAccountNumber: z.string().trim().min(6, "Confirm account number"),
    ifsc: z
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

export default function Dmt2AddBeneficiaryPage() {
  const router = useRouter();
  const retailer = useDmt2Store((s) => s.retailer);
  const upsertBeneficiary = useDmt2Store((s) => s.upsertBeneficiary);
  const setStep = useDmt2Store((s) => s.setStep);
  const [saving, setSaving] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState("");
  const { data: apiBanks = [], isLoading: banksLoading } = useFetchBanksQuery();
  const banks = useMemo(() => mergeDmt3BankMaster(apiBanks), [apiBanks]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      mobile: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifsc: "",
    },
  });

  const accountNumber = useWatch({ control: form.control, name: "accountNumber" });
  const ifsc = useWatch({ control: form.control, name: "ifsc" });
  const beneficiaryName = useWatch({ control: form.control, name: "name" });

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
      upsertBeneficiary({ ...created, bankName: created.bankName || values.bankName.trim() });
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
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-extrabold text-[#0b1f3a]">
            Customer / Beneficiary Details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select the bank, verify the account and the holder name is filled automatically.
          </p>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <Controller
              name="bankName"
              control={form.control}
              render={({ field, fieldState }) => (
                <BankSelect
                  banks={banks}
                  value={selectedBankId}
                  valueKey="id"
                  loading={banksLoading}
                  onChange={(id) => {
                    setSelectedBankId(id);
                    const apiBank = apiBanks.find(
                      (item) => String(item.instantPayBankId || item.id) === id
                    );
                    const option = banks.find((item) => item.id === id);
                    field.onChange(apiBank?.name?.trim() || option?.name || "");
                    form.setValue("ifsc", ifscGlobalFromBank(apiBank), {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  placeholder="Search and select bank"
                  label="Bank"
                  error={fieldState.error?.message}
                />
              )}
            />
            <Field label="IFSC" error={form.formState.errors.ifsc?.message}>
              <Input
                placeholder="HDFC0001234"
                className="uppercase"
                {...form.register("ifsc", {
                  onChange: (event) => {
                    event.target.value = String(event.target.value || "").toUpperCase();
                  },
                })}
              />
              <p className="text-xs text-slate-500">
                Selecting a bank fills IFSC from the bank list. You can edit it if the branch code is different.
              </p>
            </Field>
            <Field
              label="Account Number"
              error={form.formState.errors.accountNumber?.message}
            >
              <BankAccountVerifyInput
                value={accountNumber}
                onChange={(value) => {
                  form.setValue("accountNumber", value, { shouldValidate: true });
                  if (!form.getValues("confirmAccountNumber")) {
                    form.setValue("confirmAccountNumber", value, { shouldValidate: false });
                  }
                }}
                ifscCode={ifsc}
                name={beneficiaryName}
                verifyFn={(input) => verifyBankAccount(input)}
                onVerified={(result) => {
                  const payeeName = result.payee?.name?.trim();
                  if (payeeName) {
                    form.setValue("name", payeeName, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }
                  form.setValue("confirmAccountNumber", form.getValues("accountNumber"), {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                disabled={saving}
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
            <Field label="Account Holder Name" error={form.formState.errors.name?.message}>
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
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/rt/retailer/dmt2/beneficiaries")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-700"
              >
                {saving ? "Saving…" : "Add Beneficiary"}
              </Button>
            </div>
          </form>
        </div>
        <ProcessLoadingOverlay
          open={saving}
          message="Please wait..."
          detail="Saving beneficiary — do not refresh"
        />
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
