"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import CustomerReceiptModal from "@/src/components/receipt/CustomerReceiptModal";
import { mapDmtTransactionToStatement } from "@/src/lib/serviceReceiptMappers";
import { useBeneficiaries, useGenerateTransactionOtp, useSenderByMobile, useTransferImps, useTransferNeft, useVerifyTransactionOtp } from "@/src/hooks/useDmt";
import { getCurrentLocation } from "@/src/lib/rdService";
import { resolveSenderMobile, setActiveSenderMobile, setTransactionReferenceKey } from "@/src/lib/dmtSession";
import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import { validateRetailerWalletBalance } from "@/features/retailer/utils/walletValidation";
import type { DmtApiError, DmtTransaction } from "@/src/types/dmt";

const schema = z.object({
  beneficiaryId: z.string().min(1, "Select beneficiary"),
  amount: z.number().min(1).max(50000),
  transferMode: z.enum(["IMPS", "NEFT"]),
  remark: z.string().max(255).optional(),
});

type FormValues = z.infer<typeof schema>;

function TransferPageContent() {
  const params = useSearchParams();
  const mobile = resolveSenderMobile(params?.get("mobile") ?? "");
  const preselectedBeneficiary = params?.get("beneficiaryId") ?? "";

  const { data: beneficiaries = [] } = useBeneficiaries(mobile || undefined);
  const { data: sender } = useSenderByMobile(mobile, Boolean(mobile));
  const generateOtpMutation = useGenerateTransactionOtp();
  const verifyOtpMutation = useVerifyTransactionOtp();
  const transferImpsMutation = useTransferImps();
  const transferNeftMutation = useTransferNeft();

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [referenceKey, setReferenceKey] = useState("");
  const [pendingPayload, setPendingPayload] = useState<FormValues | null>(null);
  const [successTxn, setSuccessTxn] = useState<DmtTransaction | null>(null);
  const [error, setError] = useState<DmtApiError | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      beneficiaryId: preselectedBeneficiary,
      amount: 0,
      transferMode: "IMPS",
      remark: "",
    },
  });

  const selectedBeneficiary = useMemo(
    () => beneficiaries.find((b) => b.id === form.watch("beneficiaryId")),
    [beneficiaries, form]
  );

  const receiptTransaction = useMemo(
    () => mapDmtTransactionToStatement(successTxn, selectedBeneficiary ?? null),
    [successTxn, selectedBeneficiary]
  );

  const isBusy =
    generateOtpMutation.isPending ||
    verifyOtpMutation.isPending ||
    transferImpsMutation.isPending ||
    transferNeftMutation.isPending;

  const generateOtp = async (values: FormValues) => {
    if (!mobile) {
      toast.error("Sender mobile is required. Search sender first.");
      return;
    }
    setActiveSenderMobile(mobile);
    if (!validateRetailerWalletBalance(values.amount)) return;

    setError(null);
    try {
      const result = await generateOtpMutation.mutateAsync({
        senderMobile: mobile,
        amount: values.amount,
      });
      setPendingPayload(values);
      const refKey = result.referenceKey || "";
      if (!refKey) {
        toast.error("Reference key missing from OTP response.");
        return;
      }
      setReferenceKey(refKey);
      setTransactionReferenceKey(refKey);
      setOtpStep(true);
      toast.success(result.message || "Transaction OTP sent.");
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  const completeTransfer = async (values: FormValues, otpValue: string) => {
    if (!mobile) return;
    if (!referenceKey) {
      toast.error("Generate transaction OTP first.");
      return;
    }
    if (!otpValue || otpValue.length < 4) {
      toast.error("Enter valid OTP");
      return;
    }

    setError(null);

    try {
      await verifyOtpMutation.mutateAsync({
        senderMobile: mobile,
        otp: otpValue,
        referenceKey,
        amount: values.amount,
      });

      const location = await getCurrentLocation();

      const transferPayload = {
        senderMobile: mobile,
        beneficiaryId: values.beneficiaryId,
        amount: values.amount,
        transferMode: values.transferMode,
        remarks: values.remark,
        referenceKey,
        otp: otpValue,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      const result =
        values.transferMode === "NEFT"
          ? await transferNeftMutation.mutateAsync(transferPayload)
          : await transferImpsMutation.mutateAsync(transferPayload);

      refreshRetailerWalletData();
      setSuccessTxn(result.transaction ?? null);
      setOtpStep(false);
      setOtp("");
      setPendingPayload(null);
      toast.success("Transfer completed successfully");
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  const onSubmit = (values: FormValues) => generateOtp(values);

  const confirmOtp = () => {
    if (!pendingPayload) return;
    if (otp.length < 4) {
      toast.error("Enter valid OTP");
      return;
    }
    completeTransfer(pendingPayload, otp);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DmtPageHeader
        title="Money Transfer"
        description="Generate OTP, verify, and transfer via IMPS or NEFT"
        backHref={
          mobile
            ? `/rt/retailer/dmt/sender/profile?mobile=${encodeURIComponent(mobile)}`
            : "/rt/retailer/dmt/beneficiaries"
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sender</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-semibold text-[#001F5B]">{sender?.name || "—"}</p>
            <p className="text-slate-500">{sender?.mobile || mobile || "Select sender first"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Beneficiary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="font-semibold text-[#001F5B]">
              {selectedBeneficiary?.name || "Select beneficiary"}
            </p>
            <p className="text-slate-500">
              {selectedBeneficiary
                ? `${selectedBeneficiary.bankName} • ${selectedBeneficiary.ifscCode}`
                : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
          <CardDescription>Step 1: Generate transaction OTP</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Beneficiary</Label>
              <Select
                value={form.watch("beneficiaryId")}
                onValueChange={(v) => form.setValue("beneficiaryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select beneficiary" />
                </SelectTrigger>
                <SelectContent>
                  {beneficiaries.map((ben) => (
                    <SelectItem key={ben.id} value={ben.id}>
                      {ben.name} — {ben.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  {...form.register("amount", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Transfer Mode</Label>
                <Select
                  value={form.watch("transferMode")}
                  onValueChange={(v) =>
                    form.setValue("transferMode", v as "IMPS" | "NEFT")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMPS">IMPS</SelectItem>
                    <SelectItem value="NEFT">NEFT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Remark</Label>
              <Input {...form.register("remark")} placeholder="Optional remark" />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
              disabled={isBusy}
            >
              {generateOtpMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Generate Transaction OTP
            </Button>
          </form>
        </CardContent>
      </Card>

      {otpStep && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction OTP</CardTitle>
            <CardDescription>Step 2: Verify OTP and complete transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <OtpInput value={otp} onChange={setOtp} disabled={isBusy} />
            <Button className="w-full" disabled={isBusy} onClick={confirmOtp}>
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Verify OTP & Transfer
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      )}

      <CustomerReceiptModal
        open={Boolean(successTxn)}
        onClose={() => setSuccessTxn(null)}
        transaction={receiptTransaction}
        title="Money Transfer Successful"
      />
    </div>
  );
}

export default function TransferPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <TransferPageContent />
    </Suspense>
  );
}
