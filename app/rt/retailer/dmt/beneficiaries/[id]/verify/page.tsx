"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import { useVerifyBeneficiary } from "@/src/hooks/useDmt";
import type { DmtApiError } from "@/src/types/dmt";

function VerifyBeneficiaryForm() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const verifyMutation = useVerifyBeneficiary();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<DmtApiError | null>(null);

  const handleVerify = async () => {
    if (otp.length < 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    setError(null);
    try {
      await verifyMutation.mutateAsync({
        beneficiaryId: params.id,
        payload: { otp },
      });
      toast.success("Beneficiary verified successfully");
      router.push("/rt/retailer/dmt/beneficiaries");
    } catch (err) {
      const mapped = err as DmtApiError;
      setError(mapped);
      toast.error(mapped.message);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <DmtPageHeader
        title="Verify Beneficiary"
        description="Enter OTP to verify beneficiary account"
        backHref="/rt/retailer/dmt/beneficiaries"
      />

      <Card>
        <CardHeader>
          <CardTitle>Beneficiary OTP Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} disabled={verifyMutation.isPending} />
          <Button
            className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
            disabled={verifyMutation.isPending}
            onClick={handleVerify}
          >
            {verifyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Beneficiary
          </Button>
        </CardContent>
      </Card>

      {error && (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      )}
    </div>
  );
}

export default function VerifyBeneficiaryPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <VerifyBeneficiaryForm />
    </Suspense>
  );
}
