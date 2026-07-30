"use client";

import Link from "next/link";
import { AnimatedMpinInput } from "./AnimatedMpinInput";

interface VerifyCurrentMpinStepProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function VerifyCurrentMpinStep({
  value,
  onChange,
  error,
  disabled,
}: VerifyCurrentMpinStepProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[15px] font-bold text-[#001F5B]">Verify current MPIN</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Enter your existing 4 digit MPIN to continue.
        </p>
      </div>

      <AnimatedMpinInput
        label="Current MPIN"
        value={value}
        onChange={onChange}
        autoFocus
        disabled={disabled}
        error={error}
        hint="Type or paste your 4 digit MPIN"
      />

      <div className="text-right">
        <Link
          href="/rt/retailer/help-support"
          className="text-xs font-semibold text-[#1565d8] hover:underline"
        >
          Forgot MPIN?
        </Link>
      </div>
    </div>
  );
}
