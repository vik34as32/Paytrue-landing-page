"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpInput from "@/src/components/dmt/OtpInput";
import { sendEmailOtp, verifyEmailOtp } from "@/src/services/authOtpService";

const RESEND_SECONDS = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailVerificationField({
  methods,
  isEdit = false,
  originalEmail = "",
}) {
  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = methods;

  const email = watch("email") || "";
  const emailVerified = watch("emailVerified") === true;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOriginal = String(originalEmail || "").trim().toLowerCase();
  const emailUnchanged =
    isEdit && normalizedOriginal && normalizedEmail === normalizedOriginal;

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const lastVerifiedEmailRef = useRef("");

  useEffect(() => {
    if (emailUnchanged) {
      setValue("emailVerified", true, { shouldValidate: true });
      lastVerifiedEmailRef.current = normalizedEmail;
      return;
    }

    if (
      lastVerifiedEmailRef.current &&
      normalizedEmail !== lastVerifiedEmailRef.current
    ) {
      setValue("emailVerified", false, { shouldValidate: true });
      setOtpSent(false);
      setOtp("");
      setTimer(0);
      lastVerifiedEmailRef.current = "";
    }
  }, [emailUnchanged, normalizedEmail, setValue]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const validateEmailFormat = async () => {
    const valid = await trigger("email");
    if (!valid || !EMAIL_REGEX.test(email.trim())) {
      toast.error("Enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!(await validateEmailFormat())) return;

    setSendingOtp(true);
    try {
      await sendEmailOtp(email.trim());
      setOtpSent(true);
      setOtp("");
      setTimer(RESEND_SECONDS);
      setValue("emailVerified", false, { shouldValidate: true });
      toast.success("Verification email sent successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await verifyEmailOtp({ email: email.trim(), otp });
      if (result?.verified === false) {
        toast.error(result?.message || "Invalid OTP");
        return;
      }
      setValue("emailVerified", true, { shouldValidate: true });
      lastVerifiedEmailRef.current = normalizedEmail;
      toast.success("Email verified successfully");
    } catch (error) {
      toast.error(error?.message || "Invalid OTP");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const registration = register("email");

  return (
    <div className="space-y-3 lg:col-span-2" data-field="email">
      <Label>Email</Label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="email"
            placeholder="Enter email"
            className="pl-9"
            disabled={emailVerified && !emailUnchanged}
            {...registration}
            onChange={(event) => {
              registration.onChange(event);
              if (emailVerified) {
                setValue("emailVerified", false, { shouldValidate: true });
              }
            }}
          />
        </div>
        {!emailVerified && (
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={sendingOtp || !email.trim()}
            onClick={() => void handleSendOtp()}
          >
            {sendingOtp ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : otpSent ? (
              "Resend OTP"
            ) : (
              "Send OTP"
            )}
          </Button>
        )}
      </div>

      {errors.email && (
        <p className="text-xs text-red-500">{errors.email.message}</p>
      )}

      {emailVerified && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          {emailUnchanged ? "Email confirmed" : "Email verified successfully"}
        </p>
      )}

      {otpSent && !emailVerified && (
        <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Enter the 6-digit OTP sent to <strong>{email.trim()}</strong>
          </p>
          <OtpInput value={otp} onChange={setOtp} disabled={verifyingOtp} />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="bg-[#1565d8] hover:bg-[#1256b8]"
              disabled={verifyingOtp || otp.length < 6}
              onClick={() => void handleVerifyOtp()}
            >
              {verifyingOtp ? (
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
              disabled={timer > 0 || sendingOtp}
              onClick={() => void handleSendOtp()}
            >
              {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
            </Button>
          </div>
        </div>
      )}

      {errors.emailVerified && (
        <p className="text-xs text-red-500">{errors.emailVerified.message}</p>
      )}
    </div>
  );
}
