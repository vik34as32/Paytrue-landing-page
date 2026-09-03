"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Dmt3FlowHeader from "../components/Dmt3FlowHeader";
import Dmt3OtpInput from "../components/Dmt3OtpInput";
import { useDmt3Store } from "../lib/dmt3-store";
import { resendRemitterOtp, verifyRemitterOtp } from "../lib/dmt3-service";
import { maskMobile } from "../utils/dmt3.utils";

export default function Dmt3VerifyPage() {
  const router = useRouter();
  const remitter = useDmt3Store((s) => s.remitter);
  const markOtpVerified = useDmt3Store((s) => s.markOtpVerified);
  const setStep = useDmt3Store((s) => s.setStep);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!remitter.mobile || !remitter.registered) {
      router.replace("/rt/retailer/dmt3");
    }
  }, [remitter.mobile, remitter.registered, router]);

  const onVerify = async () => {
    setLoading(true);
    try {
      const result = await verifyRemitterOtp({
        mobile: remitter.mobile,
        otp,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      markOtpVerified(result.remitter);
      setStep("beneficiary");
      toast.success(result.message);
      router.push("/rt/retailer/dmt3/beneficiaries");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      const result = await resendRemitterOtp(remitter.mobile);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-5">
      <Dmt3FlowHeader activeStep={2} />
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-8">
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">Verify Mobile Number</h2>
        <p className="mt-2 text-sm text-slate-500">
          OTP sent to {maskMobile(remitter.mobile)}
        </p>
        <div className="mt-6">
          <Dmt3OtpInput value={otp} onChange={setOtp} disabled={loading} />
        </div>
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={resending || loading}
          className="mt-4 text-sm font-semibold text-indigo-600 hover:underline disabled:opacity-60"
        >
          {resending ? "Resending…" : "Resend OTP"}
        </button>
        <Button
          className="mt-5 w-full bg-gradient-to-r from-indigo-500 to-violet-700"
          disabled={loading || otp.length < 4}
          onClick={() => void onVerify()}
        >
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </div>
    </div>
  );
}
