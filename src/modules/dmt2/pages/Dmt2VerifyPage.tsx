"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Dmt2FlowHeader from "../components/Dmt2FlowHeader";
import Dmt2OtpInput from "../components/Dmt2OtpInput";
import { useDmt2Store } from "../lib/dmt2-store";
import { sendRetailerOtp, verifyRetailerOtp } from "../lib/dmt2-service";
import { maskMobile } from "../lib/dmt2-mock";

export default function Dmt2VerifyPage() {
  const router = useRouter();
  const retailer = useDmt2Store((s) => s.retailer);
  const markOtpVerified = useDmt2Store((s) => s.markOtpVerified);
  const setStep = useDmt2Store((s) => s.setStep);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!retailer.mobile || !retailer.registered) {
      router.replace("/rt/retailer/dmt2");
    }
  }, [retailer.mobile, retailer.registered, router]);

  const onVerify = async () => {
    setLoading(true);
    try {
      const result = await verifyRetailerOtp({
        mobile: retailer.mobile,
        otp,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      markOtpVerified(result.retailer);
      setStep("beneficiary");
      toast.success(result.message);
      router.push("/rt/retailer/dmt2/beneficiaries");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      const result = await sendRetailerOtp({
        mobile: retailer.mobile,
        name: retailer.fullName,
      });
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
      <Dmt2FlowHeader activeStep={2} />
      <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-center sm:p-8">
        <h2 className="text-xl font-extrabold text-[#0b1f3a]">Verify Mobile Number</h2>
        <p className="mt-2 text-sm text-slate-500">
          OTP sent to {maskMobile(retailer.mobile)}
        </p>
        <div className="mt-6">
          <Dmt2OtpInput value={otp} onChange={setOtp} disabled={loading} />
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
