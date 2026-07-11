"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OtpVerificationModal from "@/src/components/common/OtpVerificationModal";
import {
  sendMobileOtp,
  verifyMobileOtp,
  resendMobileOtp,
} from "@/src/services/authOtpService";
import { formatApiErrorMessage } from "@/src/lib/axios";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 60;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export default function MobileVerificationField({
  methods,
  isEdit = false,
  originalMobile = "",
}) {
  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = methods;

  const mobile = watch("mobile") || "";
  const mobileVerified = watch("mobileVerified") === true;
  const normalizedMobile = mobile.trim();
  const normalizedOriginal = String(originalMobile || "").trim();
  const mobileUnchanged =
    isEdit && normalizedOriginal && normalizedMobile === normalizedOriginal;

  const [modalOpen, setModalOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const lastVerifiedMobileRef = useRef("");

  useEffect(() => {
    if (mobileUnchanged) {
      setValue("mobileVerified", true, { shouldValidate: true });
      lastVerifiedMobileRef.current = normalizedMobile;
      return;
    }

    if (
      lastVerifiedMobileRef.current &&
      normalizedMobile !== lastVerifiedMobileRef.current
    ) {
      setValue("mobileVerified", false, { shouldValidate: true });
      setOtp("");
      setTimer(0);
      setModalOpen(false);
      lastVerifiedMobileRef.current = "";
    }
  }, [mobileUnchanged, normalizedMobile, setValue]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = window.setInterval(() => setTimer((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const validateMobileFormat = async () => {
    const valid = await trigger("mobile");
    if (!valid || !MOBILE_REGEX.test(mobile.trim())) {
      toast.error("Enter valid 10-digit mobile number");
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!(await validateMobileFormat())) return false;

    setSendingOtp(true);
    try {
      await sendMobileOtp(mobile.trim());
      setOtp("");
      setTimer(RESEND_SECONDS);
      setValue("mobileVerified", false, { shouldValidate: true });
      toast.success("OTP sent to your mobile number");
      return true;
    } catch (error) {
      toast.error(formatApiErrorMessage(error, "Failed to send OTP"));
      return false;
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOpenVerify = async () => {
    if (mobileVerified) return;
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
      const result = await verifyMobileOtp({ mobile: mobile.trim(), otp });
      if (result?.mobileVerified === false) {
        toast.error(result?.message || "Invalid OTP");
        return;
      }
      setValue("mobileVerified", true, { shouldValidate: true });
      lastVerifiedMobileRef.current = normalizedMobile;
      setModalOpen(false);
      setOtp("");
      toast.success("Mobile verified successfully");
    } catch (error) {
      toast.error(formatApiErrorMessage(error, "Invalid OTP"));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!(await validateMobileFormat())) return;

    setSendingOtp(true);
    try {
      await resendMobileOtp(mobile.trim());
      setOtp("");
      setTimer(RESEND_SECONDS);
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error(formatApiErrorMessage(error, "Failed to resend OTP"));
    } finally {
      setSendingOtp(false);
    }
  };

  const registration = register("mobile");

  return (
    <>
      <div className="space-y-2" data-field="mobile">
        <Label>Mobile</Label>
        <div className="relative">
          <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="tel"
            placeholder="10-digit mobile"
            maxLength={10}
            inputMode="numeric"
            className={cn("pl-9 pr-24", mobileVerified && "border-emerald-300 bg-emerald-50/40")}
            disabled={mobileVerified && !mobileUnchanged}
            {...registration}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
              event.target.value = digits;
              registration.onChange(event);
              if (mobileVerified) {
                setValue("mobileVerified", false, { shouldValidate: true });
              }
            }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {mobileVerified ? (
              <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-semibold text-[#1565d8] transition hover:bg-[#1565d8]/10 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={sendingOtp || mobile.trim().length !== 10}
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

        {errors.mobile && (
          <p className="text-xs text-red-500">{errors.mobile.message}</p>
        )}
        {errors.mobileVerified && (
          <p className="text-xs text-red-500">{errors.mobileVerified.message}</p>
        )}
      </div>

      <OtpVerificationModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Verify Mobile"
        description="We sent a one-time password to your mobile number"
        icon={Smartphone}
        target={mobile.trim()}
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
