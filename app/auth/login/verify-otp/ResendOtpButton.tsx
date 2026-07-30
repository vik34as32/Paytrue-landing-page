"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResendOtpButtonProps {
  onResend: () => Promise<void> | void;
  disabled?: boolean;
  cooldownSeconds?: number;
  className?: string;
}

export default function ResendOtpButton({
  onResend,
  disabled = false,
  cooldownSeconds = 60,
  className,
}: ResendOtpButtonProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || resending || disabled) return;
    setResending(true);
    try {
      await onResend();
      setSecondsLeft(cooldownSeconds);
    } finally {
      setResending(false);
    }
  };

  const coolingDown = secondsLeft > 0;

  return (
    <div className={cn("text-center", className)}>
      {coolingDown ? (
        <p className="text-sm text-slate-500">
          Resend available in{" "}
          <span className="font-bold tabular-nums text-[#1565d8]">
            {secondsLeft}
          </span>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void handleResend()}
          disabled={disabled || resending}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#1565d8] hover:underline disabled:opacity-60"
        >
          {resending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Resending…
            </>
          ) : (
            "Resend OTP"
          )}
        </button>
      )}
    </div>
  );
}
