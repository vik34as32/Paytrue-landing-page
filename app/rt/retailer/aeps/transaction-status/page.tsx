"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Search } from "lucide-react";
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
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import FormStatusAlert, {
  isFormErrorVariant,
} from "@/src/components/common/FormStatusAlert";
import { useFormStatus } from "@/src/hooks/useFormStatus";
import { useAepsTransactionStatus } from "@/src/hooks/useAeps";
import { formatCurrency } from "@/lib/utils";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface StatusFormValues {
  referenceId: string;
}

export default function AepsTransactionStatusPage() {
  const statusMutation = useAepsTransactionStatus();
  const [result, setResult] = useState<AepsTransactionResult | null>(null);
  const { status, clearStatus, showError, showSuccess } = useFormStatus();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StatusFormValues>({ defaultValues: { referenceId: "" } });

  const onSubmit = handleSubmit(async ({ referenceId }) => {
    clearStatus();
    setResult(null);
    try {
      const response = await statusMutation.mutateAsync({ referenceId });
      setResult(response);
      showSuccess(
        response.message || "Transaction status fetched successfully.",
        "Status found"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to fetch transaction status.";
      showError(message, "Status lookup failed");
    }
  });

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Transaction Status"
        description="Check status of an AEPS transaction using reference ID"
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Lookup Transaction</CardTitle>
          <CardDescription>Enter the reference ID from your receipt</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="referenceId">Reference ID</Label>
              <Input
                id="referenceId"
                placeholder="Enter reference ID"
                {...register("referenceId", { required: "Reference ID is required" })}
              />
              {errors.referenceId ? (
                <p className="text-xs text-rose-600">{errors.referenceId.message}</p>
              ) : null}
            </div>

            {status && isFormErrorVariant(status.variant) ? (
              <FormStatusAlert
                variant={status.variant}
                title={status.title}
                message={status.message}
                onDismiss={clearStatus}
              />
            ) : null}

            <Button type="submit" disabled={statusMutation.isPending}>
              {statusMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Check Status
            </Button>

            {status && !isFormErrorVariant(status.variant) ? (
              <FormStatusAlert
                variant={status.variant}
                title={status.title}
                message={status.message}
                onDismiss={clearStatus}
              />
            ) : null}
          </form>
        </CardContent>
      </Card>

      {result ? (
        <Card>
          <CardHeader>
            <CardTitle className="capitalize">{result.status}</CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Info label="Reference ID" value={result.referenceId} />
            <Info label="Transaction ID" value={result.transactionId} />
            {result.amount != null ? (
              <Info label="Amount" value={formatCurrency(result.amount)} />
            ) : null}
            {result.rrn ? <Info label="RRN" value={result.rrn} /> : null}
            {result.stan ? <Info label="STAN" value={result.stan} /> : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-slate-500">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
