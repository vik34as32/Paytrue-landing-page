"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import OtpInput from "@/src/components/dmt/OtpInput";

export default function OtpVerificationModal({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  target,
  otp,
  onOtpChange,
  onVerify,
  onResend,
  verifying = false,
  resending = false,
  timer = 0,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden p-0">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#f8fbff] to-white px-6 py-5">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              {Icon ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A84FF] to-[#0057D9] text-white shadow-md">
                  <Icon className="h-5 w-5" />
                </div>
              ) : null}
              <div>
                <DialogTitle className="text-lg text-[#0b1f3a]">{title}</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-500">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-5 shadow-inner">
            <p className="text-center text-sm text-slate-600">
              Enter the 6-digit OTP sent to
            </p>
            <p className="mt-1 text-center text-sm font-bold text-[#0b1f3a]">
              {target}
            </p>

            <div className="mt-5">
              <OtpInput value={otp} onChange={onOtpChange} disabled={verifying} />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                className="w-full bg-[#1565d8] hover:bg-[#1256b8] sm:w-auto"
                disabled={verifying || otp.length < 6}
                onClick={() => void onVerify()}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-slate-500 sm:w-auto"
                disabled={timer > 0 || resending}
                onClick={() => void onResend()}
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : timer > 0 ? (
                  `Resend in ${timer}s`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
