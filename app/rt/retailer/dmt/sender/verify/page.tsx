"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import {
  useCheckRemitter,
  useResendSenderOtp,
  useSearchSender,
  useSendRemitterOtp,
  useVerifyRemitterOtp,
  useVerifySenderOtp,
} from "@/src/hooks/useDmt";
import { setActiveSenderMobile, clearSenderReferenceKey, clearSenderPidOptionWadh } from "@/src/lib/dmtSession";
import type { DmtApiError } from "@/src/types/dmt";

const RESEND_SECONDS = 30;

function VerifySenderOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const mobile = params?.get("mobile") ?? "";
  const referenceKey = params?.get("referenceKey") ?? "";
  const isRemitterFlow = (params?.get("flow") ?? "") === "remitter";

  const verifySenderMutation = useVerifySenderOtp();
  const verifyRemitterMutation = useVerifyRemitterOtp();
  const searchMutation = useSearchSender();
  const checkRemitterMutation = useCheckRemitter();
  const resendSenderMutation = useResendSenderOtp();
  const resendRemitterMutation = useSendRemitterOtp();

  const verifyMutation = isRemitterFlow
    ? verifyRemitterMutation
    : verifySenderMutation;
  const refetchMutation = isRemitterFlow ? checkRemitterMutation : searchMutation;
  const resendMutation = isRemitterFlow
    ? resendRemitterMutation
    : resendSenderMutation;

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [error, setError] = useState<DmtApiError | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const id = window.setInterval(() => setTimer((t) => t - 1), 1000);
    return () => window.clearInterval(id);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setError(null);
    try {
      await verifyMutation.mutateAsync({
        mobile,
        otp,
        referenceKey: referenceKey || undefined,
      });
      // InstantPay invalidates the pre-OTP referenceKey — never reuse it
      clearSenderReferenceKey();
      clearSenderPidOptionWadh();
      setActiveSenderMobile(mobile);
      // Re-check remitter / profile for a fresh referenceKey
      await refetchMutation.mutateAsync(mobile);
      toast.success(
        isRemitterFlow ? "Remitter verified successfully" : "Sender verified successfully"
      );
      router.push(
        `/rt/retailer/dmt/sender/profile?mobile=${encodeURIComponent(mobile)}`
      );
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  const handleResend = async () => {
    try {
      await resendMutation.mutateAsync(mobile);
      setTimer(RESEND_SECONDS);
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <DmtPageHeader
        title="Verify OTP"
        description={`Enter OTP sent to ${mobile || "sender mobile"}`}
        backHref="/rt/retailer/dmt/sender/register"
      />

      <Card>
        <CardHeader>
          <CardTitle>Sender OTP Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} disabled={verifyMutation.isPending} />
          <Button
            className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
            disabled={verifyMutation.isPending || refetchMutation.isPending}
            onClick={handleVerify}
          >
            {(verifyMutation.isPending || refetchMutation.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Verify OTP
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={timer > 0 || resendMutation.isPending}
            onClick={handleResend}
          >
            {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      )}
    </div>
  );
}

export default function VerifySenderPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <VerifySenderOtpForm />
    </Suspense>
  );
}
