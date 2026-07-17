"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpVerificationModal from "@/src/components/common/OtpVerificationModal";
import { sendEmailOtp, verifyEmailOtp } from "@/src/services/authOtpService";
import { formatApiErrorMessage } from "@/src/lib/axios";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 60;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailVerificationField({
  methods,
  isEdit = false,
  originalEmail = "",
  locked = false,
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

  const [modalOpen, setModalOpen] = useState(false);
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
      setOtp("");
      setTimer(0);
      setModalOpen(false);
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
    if (!(await validateEmailFormat())) return false;

    setSendingOtp(true);
    try {
      await sendEmailOtp(email.trim());
      setOtp("");
      setTimer(RESEND_SECONDS);
      setValue("emailVerified", false, { shouldValidate: true });
      toast.success("Verification OTP sent to your email");
      return true;
    } catch (error) {
      toast.error(formatApiErrorMessage(error, "Failed to send OTP"));
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOpenVerify = async () => {
    if (emailVerified) return;
    const sent = await handleSendOtp();
    if (sent) setModalOpen(true);
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
      setModalOpen(false);
      setOtp("");
      toast.success("Email verified successfully");
    } catch (error) {
      toast.error(formatApiErrorMessage(error, "Invalid OTP"));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    const sent = await handleSendOtp();
    if (sent) setModalOpen(true);
  };

  const registration = register("email");

  return (
    <>
      <div className="space-y-2 lg:col-span-2" data-field="email">
        <Label>Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="email"
            placeholder="Enter email"
            className={cn("pl-9 pr-24", emailVerified && "border-emerald-300 bg-emerald-50/40")}
            disabled={locked || (emailVerified && !emailUnchanged)}
            {...registration}
            onChange={(event) => {
              if (locked) return;
              registration.onChange(event);
              if (emailVerified) {
                setValue("emailVerified", false, { shouldValidate: true });
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {locked || emailVerified ? (
              <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {locked ? "Locked" : "Verified"}
              </span>
            ) : (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-semibold text-[#1565d8] transition hover:bg-[#1565d8]/10 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={sendingOtp || !email.trim()}
                onClick={() => void handleOpenVerify()}
              >
                {sendingOtp ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Verify"
                )}
              </button>
            )}
          </div>
        </div>

        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
        {errors.emailVerified && (
          <p className="text-xs text-red-500">{errors.emailVerified.message}</p>
        )}
      </div>

      <OtpVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Verify Email"
        description="We sent a one-time password to your email address"
        icon={Mail}
        target={email.trim()}
        otp={otp}
        onOtpChange={setOtp}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        verifying={verifyingOtp}
        resending={sendingOtp}
        timer={timer}
      />
    </>
  );
}
