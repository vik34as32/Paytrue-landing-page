"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import OtpInput from "@/src/components/dmt/OtpInput";
import { useVerifyBeneficiary } from "@/src/hooks/useDmt";
import {
  getBeneficiaryReferenceKey,
  resolveSenderMobile,
} from "@/src/lib/dmtSession";
import type { DmtApiError } from "@/src/types/dmt";

function VerifyBeneficiaryForm() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyMutation = useVerifyBeneficiary();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<DmtApiError | null>(null);

  const beneficiaryId = params?.id ?? "";
  const referenceKey =
    searchParams?.get("referenceKey") ||
    getBeneficiaryReferenceKey(beneficiaryId) ||
    "";
  const senderMobile = resolveSenderMobile(searchParams?.get("mobile") ?? "");

  const handleVerify = async () => {
    if (!beneficiaryId) {
      toast.error("Beneficiary ID missing.");
      return;
    }
    if (otp.length < 4) {
      toast.error("Enter valid OTP");
      return;
    }
    if (!referenceKey) {
      toast.error("Reference key missing. Please add beneficiary again.");
      return;
    }

    setError(null);
    try {
      await verifyMutation.mutateAsync({
        beneficiaryId,
        payload: { otp, referenceKey },
      });
      toast.success("Beneficiary verified successfully");
      router.push(
        senderMobile
          ? `/rt/retailer/dmt/beneficiaries?mobile=${encodeURIComponent(senderMobile)}`
          : "/rt/retailer/dmt/beneficiaries"
      );
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
        description="Enter OTP sent after adding beneficiary"
        backHref="/rt/retailer/dmt/beneficiaries"
      />

      <Card>
        <CardHeader>
          <CardTitle>Beneficiary OTP Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!referenceKey ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Reference key not found. Go back and add the beneficiary again to receive a new OTP.
            </p>
          ) : null}

          <OtpInput value={otp} onChange={setOtp} disabled={verifyMutation.isPending} />
          <Button
            className="w-full bg-gradient-to-r from-[#0A84FF] to-[#0057D9]"
            disabled={verifyMutation.isPending || !referenceKey}
            onClick={handleVerify}
          >
            {verifyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Beneficiary
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <DmtErrorState code={error.code} message={error.message} onRetry={() => setError(null)} />
      ) : null}
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
