"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";
import { useBankAccountVerification } from "@/src/hooks/useBankAccountVerification";
import { validateBankVerifyInputs } from "@/src/lib/dmtBankVerify";
import type { VerifyBankAccountResponse } from "@/src/types/dmt";

interface BankAccountVerifyInputProps {
  value: string;
  onChange: (value: string) => void;
  ifscCode: string;
  name?: string;
  verifyFn: (input: {
    accountNumber: string;
    ifscCode: string;
    name?: string;
  }) => Promise<VerifyBankAccountResponse>;
  onVerified?: (result: VerifyBankAccountResponse) => void;
  error?: string;
  disabled?: boolean;
  /** Run bank verify once account + IFSC become valid */
  autoVerify?: boolean;
}

export default function BankAccountVerifyInput({
  value,
  onChange,
  ifscCode,
  name,
  verifyFn,
  onVerified,
  error,
  disabled = false,
  autoVerify = false,
}: BankAccountVerifyInputProps) {
  const { verify, verifying, verified, holderName, nameMatchPercent } =
    useBankAccountVerification({
      accountNumber: value,
      ifscCode,
      name,
      verifyFn,
      onVerified,
    });

  const autoKeyRef = useRef("");

  useEffect(() => {
    if (!autoVerify || disabled || verifying || verified) return;
    const invalid = validateBankVerifyInputs({
      accountNumber: value,
      ifscCode,
    });
    if (invalid) return;
    const key = `${value.trim()}|${ifscCode.trim().toUpperCase()}`;
    if (autoKeyRef.current === key) return;
    autoKeyRef.current = key;
    const timer = window.setTimeout(() => {
      void verify();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [autoVerify, disabled, ifscCode, value, verified, verifying, verify]);

  const helperText = verified
    ? holderName
      ? `Verified: ${holderName}${
          nameMatchPercent != null ? ` (${nameMatchPercent}% match)` : ""
        }`
      : "Bank account verified"
    : !ifscCode.trim() && value.trim()
      ? "Enter IFSC code to verify bank account"
      : undefined;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          inputMode="numeric"
          value={value}
          disabled={disabled || verifying}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, "").slice(0, 18))
          }
          className={verified ? "pr-28 border-emerald-500" : "pr-28"}
        />
        <div className="absolute inset-y-0 right-1 flex items-center">
          {verified ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-md border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-500 hover:bg-slate-200"
              disabled={disabled || verifying || !value.trim() || !ifscCode.trim()}
              onClick={() => void verify()}
            >
              {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Verify"}
            </Button>
          )}
        </div>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {!error && helperText ? (
        <p className={`text-xs ${verified ? "text-emerald-600" : "text-slate-500"}`}>
          {helperText}
        </p>
      ) : null}
      <ProcessLoadingOverlay
        open={verifying}
        message="Please wait..."
        detail="Connecting to bank server — verifying account"
      />
    </div>
  );
}
