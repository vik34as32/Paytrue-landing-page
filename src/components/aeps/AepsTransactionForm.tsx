"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { Fingerprint, Loader2 } from "lucide-react";
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
import AepsBankSelect from "@/src/components/aeps/AepsBankSelect";
import OtpInput from "@/src/components/dmt/OtpInput";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import FormStatusAlert, {
  isFormErrorVariant,
} from "@/src/components/common/FormStatusAlert";
import { useFormStatus } from "@/src/hooks/useFormStatus";
import { useFingerprint } from "@/src/hooks/useFingerprint";
import { AEPS_OTP_AMOUNT_THRESHOLD } from "@/src/constants/aepsApi";
import type { AepsTransactionPayload, AepsTransactionResult } from "@/src/types/aeps";

export interface AepsFormValues {
  aadhaarNumber: string;
  mobileNumber: string;
  bankIIN: string;
  accountNumber: string;
  amount: string;
}

interface AepsTransactionFormProps {
  title: string;
  description: string;
  showAmount?: boolean;
  amountRequired?: boolean;
  showAccountNumber?: boolean;
  accountNumberRequired?: boolean;
  onSubmit: (payload: AepsTransactionPayload) => Promise<AepsTransactionResult>;
  onSuccess?: (result: AepsTransactionResult) => void;
  submitLabel?: string;
  /** Renders below submit button instead of generic success toast-style alert */
  renderInlineSuccess?: (result: AepsTransactionResult) => ReactNode;
}

export default function AepsTransactionForm({
  title,
  description,
  showAmount = false,
  amountRequired = false,
  showAccountNumber = false,
  accountNumberRequired = false,
  onSubmit,
  onSuccess,
  submitLabel = "Proceed",
  renderInlineSuccess,
}: AepsTransactionFormProps) {
  const {
    rdStatus,
    refreshRdService,
    isCapturing,
    isFetchingLocation,
    captureWithLocation,
  } = useFingerprint();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [pendingPayload, setPendingPayload] = useState<AepsTransactionPayload | null>(
    null
  );
  const [pendingReferenceId, setPendingReferenceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<AepsTransactionResult | null>(null);
  const inlineResultRef = useRef<HTMLDivElement>(null);
  const { status, clearStatus, showError, showSuccess, showInfo } = useFormStatus();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AepsFormValues>({
    defaultValues: {
      aadhaarNumber: "",
      mobileNumber: "",
      bankIIN: "",
      accountNumber: "",
      amount: "",
    },
  });

  const buildPayload = async (
    values: AepsFormValues
  ): Promise<AepsTransactionPayload> => {
    const capture = await captureWithLocation();
    const payload: AepsTransactionPayload = {
      aadhaarNumber: values.aadhaarNumber.replace(/\D/g, ""),
      mobileNumber: values.mobileNumber.replace(/\D/g, ""),
      bankIIN: values.bankIIN,
      pidData: capture.pidData,
      latitude: capture.latitude,
      longitude: capture.longitude,
    };
    if (showAmount && values.amount) {
      payload.amount = Number(values.amount);
    }
    if (showAccountNumber && values.accountNumber) {
      payload.accountNumber = values.accountNumber.replace(/\D/g, "");
    }
    return payload;
  };

  const executeSubmit = async (payload: AepsTransactionPayload) => {
    setIsSubmitting(true);
    clearStatus();
    setLastResult(null);
    try {
      const result = await onSubmit(payload);
      const needsOtp =
        !payload.otp &&
        payload.amount != null &&
        payload.amount > AEPS_OTP_AMOUNT_THRESHOLD &&
        Boolean(result.referenceId);

      if (needsOtp) {
        setPendingPayload(payload);
        setPendingReferenceId(result.referenceId);
        setStep("otp");
        showInfo(
          "Enter the OTP sent to the customer's registered mobile number to complete this transaction.",
          "OTP required"
        );
        return;
      }

      if (renderInlineSuccess) {
        setLastResult(result);
      } else {
        showSuccess(
          result.message || "Transaction completed successfully.",
          "Transaction successful"
        );
      }
      onSuccess?.(result);
      setStep("form");
      setOtp("");
      setPendingPayload(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed.";
      showError(message, "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = handleSubmit(async (values) => {
    clearStatus();
    setLastResult(null);

    if (!rdStatus.isRunning) {
      showError(
        "RD Service is not running for the selected device. Start the RD Service application and click Refresh on the device panel.",
        "Biometric device not ready"
      );
      return;
    }

    try {
      const payload = await buildPayload(values);
      await executeSubmit(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to capture fingerprint.";
      showError(message, "Fingerprint capture failed");
    }
  });

  const onOtpSubmit = async () => {
    if (!pendingPayload || otp.length < 4) {
      showError("Enter the 4–6 digit OTP sent to the customer.", "Invalid OTP");
      return;
    }
    await executeSubmit({
      ...pendingPayload,
      otp,
      referenceId: pendingReferenceId || pendingPayload.referenceId,
    });
  };

  const busy = isCapturing || isFetchingLocation || isSubmitting;

  useEffect(() => {
    if (!lastResult || !inlineResultRef.current) return;
    inlineResultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lastResult]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <DeviceSelector disabled={busy} />

          {step === "otp" ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-600">
                Amount exceeds ₹{AEPS_OTP_AMOUNT_THRESHOLD.toLocaleString("en-IN")}. Enter
                customer OTP to complete the transaction.
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={busy} />
              {status && isFormErrorVariant(status.variant) ? (
                <FormStatusAlert
                  variant={status.variant}
                  title={status.title}
                  message={status.message}
                  onDismiss={clearStatus}
                />
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("form");
                    setOtp("");
                  }}
                  disabled={busy}
                >
                  Back
                </Button>
                <Button type="button" onClick={onOtpSubmit} disabled={busy}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Verify OTP
                </Button>
              </div>
              {status && !isFormErrorVariant(status.variant) ? (
                <FormStatusAlert
                  variant={status.variant}
                  title={status.title}
                  message={status.message}
                  onDismiss={clearStatus}
                />
              ) : null}
            </div>
          ) : (
            <form onSubmit={onFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="12-digit Aadhaar"
                  {...register("aadhaarNumber", {
                    required: "Aadhaar number is required",
                    pattern: {
                      value: /^[2-9]\d{11}$/,
                      message: "Enter a valid 12-digit Aadhaar number",
                    },
                  })}
                />
                {errors.aadhaarNumber ? (
                  <p className="text-xs text-rose-600">{errors.aadhaarNumber.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input
                  id="mobileNumber"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile"
                  {...register("mobileNumber", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Enter a valid 10-digit mobile number",
                    },
                  })}
                />
                {errors.mobileNumber ? (
                  <p className="text-xs text-rose-600">{errors.mobileNumber.message}</p>
                ) : null}
              </div>

              <Controller
                name="bankIIN"
                control={control}
                rules={{ required: "Select a bank" }}
                render={({ field }) => (
                  <AepsBankSelect
                    id="aeps-bank-iin"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={busy}
                    error={errors.bankIIN?.message}
                  />
                )}
              />

              {showAccountNumber ? (
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    inputMode="numeric"
                    maxLength={18}
                    placeholder="Customer bank account number"
                    {...register("accountNumber", {
                      required: accountNumberRequired
                        ? "Account number is required"
                        : false,
                      pattern: {
                        value: /^\d{9,18}$/,
                        message: "Enter a valid account number (9-18 digits)",
                      },
                    })}
                  />
                  {errors.accountNumber ? (
                    <p className="text-xs text-rose-600">{errors.accountNumber.message}</p>
                  ) : null}
                </div>
              ) : null}

              {showAmount ? (
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    {...register("amount", {
                      required: amountRequired ? "Amount is required" : false,
                      min: amountRequired
                        ? { value: 1, message: "Amount must be greater than zero" }
                        : undefined,
                    })}
                  />
                  {errors.amount ? (
                    <p className="text-xs text-rose-600">{errors.amount.message}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
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
                <div ref={inlineResultRef}>{renderInlineSuccess(lastResult)}</div>
              ) : status && !isFormErrorVariant(status.variant) ? (
                <FormStatusAlert
                  variant={status.variant}
                  title={status.title}
                  message={status.message}
                  onDismiss={clearStatus}
                />
              ) : null}
            </form>
          )}
        </CardContent>
      </Card>

      <DeviceStatusCard
        status={rdStatus}
        isChecking={isCapturing}
        onRefresh={refreshRdService}
      />
    </div>
  );
}
