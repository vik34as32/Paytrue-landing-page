"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Fingerprint, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedMpinInput, MPIN_LENGTH } from "@/features/mpin";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import FormStatusAlert, { isFormErrorVariant } from "@/src/components/common/FormStatusAlert";
import { useFormStatus } from "@/src/hooks/useFormStatus";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import { performNsdlTransaction } from "../lib/nsdl-aeps-api";
import { useNsdlBanks } from "../lib/nsdl-aeps-hooks";
import { createIdempotencyKey, maskAadhaarInput } from "../lib/nsdl-aeps-normalizers";
import type { NsdlServiceType, NsdlTransaction } from "../types";
import NsdlBankSelect from "./NsdlBankSelect";

interface FormValues {
  aadhaarNumber: string;
  mobile: string;
  bankIIN: string;
  amount: string;
}

interface NsdlTransactionFormProps {
  serviceType: NsdlServiceType;
  title: string;
  description: string;
  showAmount?: boolean;
  submitLabel?: string;
  /** Called for SUCCESS and PENDING outcomes; FAILED is shown inline as an error. */
  onResult?: (txn: NsdlTransaction) => void;
  renderInlineSuccess?: (txn: NsdlTransaction) => ReactNode;
}

export default function NsdlTransactionForm({
  serviceType,
  title,
  description,
  showAmount = false,
  submitLabel = "Proceed",
  onResult,
  renderInlineSuccess,
}: NsdlTransactionFormProps) {
  const { rdStatus, refreshRdService, isCapturing, isFetchingLocation, captureWithLocation } =
    useFingerprint();
  const { data: banks = [] } = useNsdlBanks();
  const { status, clearStatus, showError, showSuccess, showInfo } = useFormStatus();
  const [mpin, setMpin] = useState("");
  const [mpinError, setMpinError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<NsdlTransaction | null>(null);
  const inlineRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { aadhaarNumber: "", mobile: "", bankIIN: "", amount: "" },
  });

  const busy = isCapturing || isFetchingLocation || submitting;

  useEffect(() => {
    if (lastResult) inlineRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lastResult]);

  const onSubmit = handleSubmit(async (values) => {
    clearStatus();
    setLastResult(null);
    if (mpin.length !== MPIN_LENGTH) {
      setMpinError("Enter your 4-digit MPIN");
      return;
    }
    if (!rdStatus.isRunning) {
      showError(
        "RD Service is not running for the selected device. Start the RD Service application and click Refresh on the device panel.",
        "Biometric device not ready"
      );
      return;
    }

    setSubmitting(true);
    try {
      const capture = await captureWithLocation();
      const aadhaarNumber = values.aadhaarNumber.replace(/\D/g, "");
      const mobile = values.mobile.replace(/\D/g, "");
      const result = await performNsdlTransaction({
        serviceType,
        aadhaarNumber,
        mobile,
        bankIIN: values.bankIIN,
        amount: showAmount ? Number(values.amount) : undefined,
        pidBlock: capture.pidData,
        latitude: String(capture.latitude),
        longitude: String(capture.longitude),
        mpin,
        idempotencyKey: createIdempotencyKey(),
      });

      const txn: NsdlTransaction = {
        ...result,
        serviceType: result.serviceType || serviceType,
        bankName: banks.find((bank) => bank.iin === values.bankIIN)?.name,
        mobile,
        aadhaarMasked: result.aadhaarMasked || maskAadhaarInput(aadhaarNumber),
      };

      if (txn.status === "FAILED") {
        showError(txn.message || "Transaction failed.", "Transaction failed");
        return;
      }

      if (txn.status === "PENDING") {
        showInfo(
          txn.message ||
            "Transaction is pending with the bank. Check Transaction Status before retrying.",
          "Transaction pending"
        );
      } else if (renderInlineSuccess) {
        setLastResult(txn);
      } else {
        showSuccess(txn.message || "Transaction completed successfully.", "Transaction successful");
      }
      onResult?.(txn);
    } catch (error) {
      showError(error instanceof Error ? error.message : "Transaction failed.", "Transaction failed");
    } finally {
      setMpin("");
      setSubmitting(false);
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <DeviceSelector disabled={busy} />

          <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="nsdl-aadhaar">Aadhaar Number</Label>
              <Input
                id="nsdl-aadhaar"
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit Aadhaar"
                disabled={busy}
                {...register("aadhaarNumber", {
                  required: "Aadhaar number is required",
                  pattern: { value: /^[2-9]\d{11}$/, message: "Enter a valid 12-digit Aadhaar number" },
                })}
              />
              {errors.aadhaarNumber ? (
                <p className="text-xs text-rose-600">{errors.aadhaarNumber.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nsdl-mobile">Mobile Number</Label>
              <Input
                id="nsdl-mobile"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                disabled={busy}
                {...register("mobile", {
                  required: "Mobile number is required",
                  pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" },
                })}
              />
              {errors.mobile ? <p className="text-xs text-rose-600">{errors.mobile.message}</p> : null}
            </div>

            <Controller
              name="bankIIN"
              control={control}
              rules={{ required: "Select a bank" }}
              render={({ field }) => (
                <NsdlBankSelect
                  value={field.value}
                  onChange={field.onChange}
                  disabled={busy}
                  error={errors.bankIIN?.message}
                />
              )}
            />

            {showAmount ? (
              <div className="space-y-2">
                <Label htmlFor="nsdl-amount">Amount (₹)</Label>
                <Input
                  id="nsdl-amount"
                  inputMode="decimal"
                  placeholder="Enter amount"
                  disabled={busy}
                  {...register("amount", {
                    required: "Amount is required",
                    validate: (value) => Number(value) > 0 || "Amount must be greater than zero",
                  })}
                />
                {errors.amount ? <p className="text-xs text-rose-600">{errors.amount.message}</p> : null}
              </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <AnimatedMpinInput
                label="MPIN"
                hint="Enter your 4-digit MPIN to authorize this transaction."
                value={mpin}
                onChange={(value) => {
                  setMpin(value);
                  setMpinError("");
                }}
                length={MPIN_LENGTH}
                disabled={busy}
                allowPaste={false}
                error={mpinError || undefined}
              />
            </div>

            <div className="rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-xs text-violet-800">
              <Fingerprint className="mr-1 inline h-3.5 w-3.5" />
              Fingerprint will be captured from the selected device when you submit.
            </div>

            {status && isFormErrorVariant(status.variant) ? (
              <FormStatusAlert
                variant={status.variant}
                title={status.title}
                message={status.message}
                onDismiss={clearStatus}
              />
            ) : null}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCapturing
                    ? "Capturing fingerprint..."
                    : isFetchingLocation
                      ? "Fetching location..."
                      : "Processing..."}
                </>
              ) : (
                submitLabel
              )}
            </Button>

            {lastResult && renderInlineSuccess ? (
              <div ref={inlineRef}>{renderInlineSuccess(lastResult)}</div>
            ) : status && !isFormErrorVariant(status.variant) ? (
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

      <DeviceStatusCard status={rdStatus} isChecking={isCapturing} onRefresh={refreshRdService} />
    </div>
  );
}
