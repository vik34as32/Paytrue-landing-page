"use client";

import { Loader2 } from "lucide-react";
import { AnimatedMpinInput } from "./AnimatedMpinInput";
import { MPIN_OTP_LENGTH } from "../schemas";

interface VerifyForgotMpinOtpStepProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  sending?: boolean;
  mobileMasked?: string | null;
  onResend: () => Promise<void> | void;
  resendSecondsLeft: number;
}

export function VerifyForgotMpinOtpStep({
  value,
  onChange,
  error,
  disabled,
  sending,
  mobileMasked,
  onResend,
  resendSecondsLeft,
}: VerifyForgotMpinOtpStepProps) {
  const coolingDown = resendSecondsLeft > 0;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[15px] font-bold text-[#001F5B]">Verify OTP</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Enter the 6-digit OTP sent to{" "}
          <span className="font-semibold text-slate-700">
            {mobileMasked || "your registered mobile number"}
          </span>
          . OTP expires in 5 minutes. Current MPIN is not required.
        </p>
      </div>

      {sending ? (
        <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-800">
          <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
          Sending OTP…
        </div>
      ) : null}

      <AnimatedMpinInput
        label="OTP"
        value={value}
        onChange={onChange}
        length={MPIN_OTP_LENGTH}
        autoFocus
        disabled={disabled || sending}
        error={error}
        hint="Type or paste the 6-digit OTP"
      />

      <div className="text-center">
        {coolingDown ? (
          <p className="text-xs text-slate-500">
            Resend available in{" "}
            <span className="font-bold tabular-nums text-[#1565d8]">
              {resendSecondsLeft}
            </span>
            s
          </p>
        ) : (
          <button
            type="button"
            onClick={() => void onResend()}
            disabled={disabled || sending}
            className="text-xs font-semibold text-[#1565d8] hover:underline disabled:opacity-50"
          >
            Resend OTP
          </button>
        )}
      </div>
    </div>
  );
}
