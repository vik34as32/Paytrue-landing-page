"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import {
  useBeneficiaries,
  useInitiateTransfer,
  useSenderByMobile,
} from "@/src/hooks/useDmt";
import { refreshRetailerWalletData } from "@/features/retailer/utils/walletValidation";
import { validateRetailerWalletBalance } from "@/features/retailer/utils/walletValidation";
import type { DmtApiError, DmtTransaction } from "@/src/types/dmt";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  beneficiaryId: z.string().min(1, "Select beneficiary"),
  amount: z.number().min(1).max(50000),
  transferMode: z.enum(["IMPS", "NEFT"]),
  remark: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

function TransferPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params.get("mobile") ?? "";
  const preselectedBeneficiary = params.get("beneficiaryId") ?? "";

  const { data: beneficiaries = [] } = useBeneficiaries(mobile || undefined);
  const { data: sender } = useSenderByMobile(mobile, Boolean(mobile));
  const transferMutation = useInitiateTransfer();

  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
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

  const submitTransfer = async (values: FormValues, otpValue?: string) => {
    if (!validateRetailerWalletBalance(values.amount)) return;

    setError(null);
    try {
      const result = await transferMutation.mutateAsync({
        beneficiaryId: values.beneficiaryId,
        amount: values.amount,
        transferMode: values.transferMode,
        remark: values.remark,
        otp: otpValue,
      });

      if (result.requiresOtp && !otpValue) {
        setPendingPayload(values);
        setOtpStep(true);
        toast.message("Enter transaction OTP to complete transfer");
        return;
      }

      refreshRetailerWalletData();
      setSuccessTxn(result.transaction ?? null);
      toast.success("Transfer completed successfully");
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  const onSubmit = (values: FormValues) => submitTransfer(values);

  const confirmOtp = () => {
    if (!pendingPayload) return;
    submitTransfer(pendingPayload, otp);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <DmtPageHeader
        title="Money Transfer"
        description="Transfer funds securely via IMPS or NEFT"
        backHref="/rt/retailer/dmt/beneficiaries"
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
          <CardDescription>Generate OTP and complete transfer</CardDescription>
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
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {otpStep ? "Resubmit Transfer" : "Generate Transaction OTP"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {otpStep && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction OTP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <OtpInput value={otp} onChange={setOtp} disabled={transferMutation.isPending} />
            <Button
              className="w-full"
              disabled={transferMutation.isPending}
              onClick={confirmOtp}
            >
              Verify OTP & Transfer
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      )}

      <Dialog open={Boolean(successTxn)} onOpenChange={() => setSuccessTxn(null)}>
        <DialogContent className="text-center">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle>Transfer Successful</DialogTitle>
          </DialogHeader>
          {successTxn && (
            <div className="space-y-2 text-sm">
              <p>
                Amount:{" "}
                <span className="font-bold text-emerald-600">
                  {formatCurrency(successTxn.amount)}
                </span>
              </p>
              <p className="font-mono text-xs">{successTxn.transactionId}</p>
              <Button asChild className="mt-3 w-full">
                <Link href={`/rt/retailer/dmt/transactions/${successTxn.id}`}>
                  View Receipt
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
