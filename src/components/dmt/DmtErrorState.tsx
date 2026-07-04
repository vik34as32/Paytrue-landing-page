"use client";

import {
  AlertTriangle,
  Ban,
  Clock3,
  RefreshCw,
  ServerCrash,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DmtErrorCode } from "@/src/types/dmt";

const CONFIG: Record<
  DmtErrorCode,
  { title: string; description: string; icon: typeof AlertTriangle }
> = {
  INVALID_SENDER: {
    title: "Invalid Sender",
    description: "The sender mobile number is not registered or could not be found.",
    icon: ShieldAlert,
  },
  BENEFICIARY_EXISTS: {
    title: "Beneficiary Already Exists",
    description: "This beneficiary is already registered for the selected sender.",
    icon: Ban,
  },
  OTP_EXPIRED: {
    title: "OTP Expired",
    description: "Your OTP has expired. Please request a new OTP and try again.",
    icon: Clock3,
  },
  INVALID_OTP: {
    title: "Invalid OTP",
    description: "The OTP you entered is incorrect. Please check and try again.",
    icon: ShieldAlert,
  },
  BANK_DOWN: {
    title: "Bank Unavailable",
    description: "The beneficiary bank is temporarily unavailable. Please try later.",
    icon: ServerCrash,
  },
  TIMEOUT: {
    title: "Request Timeout",
    description: "The request timed out. Please check your connection and retry.",
    icon: Clock3,
  },
  INSUFFICIENT_BALANCE: {
    title: "Insufficient Balance",
    description: "Your wallet balance is not enough to complete this transfer.",
    icon: Wallet,
  },
  TRANSACTION_FAILED: {
    title: "Transaction Failed",
    description: "The transfer could not be completed. Please try again.",
    icon: AlertTriangle,
  },
  SERVER_ERROR: {
    title: "Server Error",
    description: "Something went wrong on our servers. Please try again shortly.",
    icon: ServerCrash,
  },
  UNKNOWN: {
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
    icon: AlertTriangle,
  },
};

export default function DmtErrorState({
  code = "UNKNOWN",
  message,
  onRetry,
}: {
  code?: DmtErrorCode;
  message?: string;
  onRetry?: () => void;
}) {
  const config = CONFIG[code] ?? CONFIG.UNKNOWN;
  const Icon = config.icon;

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/60 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-[#001F5B]">{config.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        {message || config.description}
      </p>
      {onRetry && (
        <Button className="mt-5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
