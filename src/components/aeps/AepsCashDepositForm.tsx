"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CheckCircle2, Fingerprint, Loader2, SearchCheck } from "lucide-react";
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
import { useAepsCashDepositAccountVerify } from "@/src/hooks/useAeps";
import { AEPS_OTP_AMOUNT_THRESHOLD } from "@/src/constants/aepsApi";
import type {
  AepsAccountVerifyResult,
  AepsTransactionPayload,
  AepsTransactionResult,
} from "@/src/types/aeps";

interface CashDepositFormValues {
  bankIIN: string;
  accountNumber: string;
  aadhaarNumber: string;
  mobileNumber: string;
  amount: string;
}

interface AepsCashDepositFormProps {
  onSubmit: (payload: AepsTransactionPayload) => Promise<AepsTransactionResult>;
  onSuccess?: (result: AepsTransactionResult) => void;
}

export default function AepsCashDepositForm({
  onSubmit,
  onSuccess,
}: AepsCashDepositFormProps) {
  const {
    rdStatus,
    refreshRdService,
    isCapturing,
    isFetchingLocation,
    fetchLocation,
    captureWithLocation,
  } = useFingerprint();
  const verifyAccount = useAepsCashDepositAccountVerify();

  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [pendingPayload, setPendingPayload] = useState<AepsTransactionPayload | null>(
    null
  );
  const [pendingReferenceId, setPendingReferenceId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedAccount, setVerifiedAccount] = useState<AepsAccountVerifyResult | null>(
    null
  );
  const { status, clearStatus, showError, showSuccess, showInfo } = useFormStatus();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CashDepositFormValues>({
    defaultValues: {
      bankIIN: "",
      accountNumber: "",
      aadhaarNumber: "",
      mobileNumber: "",
      amount: "",
    },
  });

  const bankIIN = watch("bankIIN");
  const accountNumber = watch("accountNumber");

  const resetVerification = () => {
    if (verifiedAccount) setVerifiedAccount(null);
  };

  const handleVerifyAccount = async () => {
    clearStatus();
    const account = accountNumber.replace(/\D/g, "");
    if (!bankIIN) {
      showError("Select the customer's bank before verifying the account.", "Bank required");
      return;
    }
    if (!/^\d{9,18}$/.test(account)) {
      showError("Enter a valid account number between 9 and 18 digits.", "Invalid account");
      return;
    }

    try {
      const coords = await fetchLocation();
      const result = await verifyAccount.mutateAsync({
        accountNumber: account,
        bankIIN,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (!result.verified || !result.accountHolderName) {
        showError(result.message || "Could not verify this account.", "Verification failed");
        setVerifiedAccount(null);
        return;
      }

      setVerifiedAccount(result);
      showSuccess("Account verified. You can now complete the deposit details.", "Account verified");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Account verification failed.";
      showError(message, "Verification failed");
      setVerifiedAccount(null);
    }
  };

  const buildPayload = async (
    values: CashDepositFormValues
  ): Promise<AepsTransactionPayload> => {
    if (!verifiedAccount) {
      throw new Error("Verify account before deposit.");
    }

    const capture = await captureWithLocation();
    return {
      aadhaarNumber: values.aadhaarNumber.replace(/\D/g, ""),
      mobileNumber: values.mobileNumber.replace(/\D/g, ""),
      bankIIN: values.bankIIN,
      accountNumber: values.accountNumber.replace(/\D/g, ""),
      ifscCode: verifiedAccount.ifscCode,
      accountHolderName: verifiedAccount.accountHolderName,
      amount: Number(values.amount),
      pidData: capture.pidData,
      latitude: capture.latitude,
      longitude: capture.longitude,
    };
  };

  const executeSubmit = async (payload: AepsTransactionPayload) => {
    setIsSubmitting(true);
    clearStatus();
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
          "Enter the OTP sent to the customer's registered mobile number to complete this deposit.",
          "OTP required"
        );
        return;
      }

      showSuccess(result.message || "Deposit completed successfully.", "Deposit successful");
      onSuccess?.(result);
      setStep("form");
      setOtp("");
      setPendingPayload(null);
      setVerifiedAccount(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Deposit failed.";
      showError(message, "Deposit failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = handleSubmit(async (values) => {
    clearStatus();

    if (!verifiedAccount) {
      showError("Verify the account number before submitting the deposit.", "Account not verified");
      return;
    }
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

  const busy =
    isCapturing ||
    isFetchingLocation ||
    isSubmitting ||
    verifyAccount.isPending;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Cash Deposit</CardTitle>
          <CardDescription>
            Verify customer account, then enter deposit details and capture fingerprint
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <DeviceSelector disabled={busy} />

          {step === "otp" ? (
            <div className="space-y-5">
              <p className="text-sm text-slate-600">
                Amount exceeds ₹{AEPS_OTP_AMOUNT_THRESHOLD.toLocaleString("en-IN")}. Enter
                customer OTP to complete the deposit.
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
              <Controller
                name="bankIIN"
                control={control}
                rules={{ required: "Select a bank" }}
                render={({ field }) => (
                  <AepsBankSelect
                    id="aeps-deposit-bank-iin"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      resetVerification();
                    }}
                    disabled={busy}
                    error={errors.bankIIN?.message}
                  />
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="accountNumber"
                    inputMode="numeric"
                    maxLength={18}
                    placeholder="Customer bank account number"
                    className="min-w-0 flex-1"
                    {...register("accountNumber", {
                      required: "Account number is required",
                      pattern: {
                        value: /^\d{9,18}$/,
                        message: "Enter a valid account number (9-18 digits)",
                      },
                      onChange: () => resetVerification(),
                    })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={busy}
                    onClick={() => void handleVerifyAccount()}
                  >
                    {verifyAccount.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <SearchCheck className="mr-2 h-4 w-4" />
                    )}
                    Verify
                  </Button>
                </div>
                {errors.accountNumber ? (
                  <p className="text-xs text-rose-600">{errors.accountNumber.message}</p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Enter account number and click Verify to fetch holder name & IFSC.
                  </p>
                )}
              </div>

              {verifiedAccount ? (
                <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Account Verified
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">Account Holder</p>
                      <p className="font-medium text-slate-900">
                        {verifiedAccount.accountHolderName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">IFSC Code</p>
                      <p className="font-mono font-medium text-slate-900">
                        {verifiedAccount.ifscCode || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Bank</p>
                      <p className="font-medium text-slate-900">
                        {verifiedAccount.bankName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Account Number</p>
                      <p className="font-mono font-medium text-slate-900">
                        {verifiedAccount.accountNumber || accountNumber}
                      </p>
                    </div>
                    {verifiedAccount.accountType ? (
                      <div>
                        <p className="text-xs text-slate-500">Account Type</p>
                        <p className="font-medium text-slate-900">
                          {verifiedAccount.accountType}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <fieldset
                className="space-y-4"
                disabled={!verifiedAccount || busy}
              >
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
                    <p className="text-xs text-rose-600">
                      {errors.aadhaarNumber.message}
                    </p>
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
                    <p className="text-xs text-rose-600">
                      {errors.mobileNumber.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    inputMode="decimal"
                    placeholder="Enter deposit amount"
                    {...register("amount", {
                      required: "Amount is required",
                      min: { value: 1, message: "Amount must be greater than zero" },
                    })}
                  />
                  {errors.amount ? (
                    <p className="text-xs text-rose-600">{errors.amount.message}</p>
                  ) : null}
                </div>
              </fieldset>

              {!verifiedAccount ? (
                <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Verify the account number first to unlock Aadhaar, mobile and amount fields.
                </p>
              ) : (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  <Fingerprint className="mr-1 inline h-3.5 w-3.5" />
                  Fingerprint will be captured from the selected device when you submit.
                </div>
              )}

              {status && isFormErrorVariant(status.variant) ? (
                <FormStatusAlert
                  variant={status.variant}
                  title={status.title}
                  message={status.message}
                  onDismiss={clearStatus}
                />
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={busy || !verifiedAccount}
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCapturing
                      ? "Capturing fingerprint..."
                      : isFetchingLocation
                        ? "Fetching location..."
                        : verifyAccount.isPending
                          ? "Verifying account..."
                          : "Processing..."}
                  </>
                ) : (
                  "Deposit"
                )}
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
