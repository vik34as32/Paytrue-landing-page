"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDmt3Store } from "../lib/dmt3-store";

export function RequireVerifiedRemitter({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const remitter = useDmt3Store((s) => s.remitter);

  useEffect(() => {
    if (!remitter.mobile || !remitter.otpVerified) {
      router.replace("/rt/retailer/dmt3");
    }
  }, [remitter.mobile, remitter.otpVerified, router]);

  if (!remitter.mobile || !remitter.otpVerified) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Redirecting to search retailer…
      </div>
    );
  }

  return <>{children}</>;
}

/** @deprecated use RequireVerifiedRemitter */
export const RequireDmt3Session = RequireVerifiedRemitter;

export function RequireSelectedBeneficiary({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const beneficiary = useDmt3Store((s) => s.getSelectedBeneficiary());

  useEffect(() => {
    if (!beneficiary) {
      router.replace("/rt/retailer/dmt3/beneficiaries");
    }
  }, [beneficiary, router]);

  if (!beneficiary) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Redirecting to beneficiaries…
      </div>
    );
  }

  return <>{children}</>;
}

export function RequireCommissionPreview({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const commission = useDmt3Store((s) => s.commission);

  useEffect(() => {
    if (!commission) {
      router.replace("/rt/retailer/dmt3/transfer");
    }
  }, [commission, router]);

  if (!commission) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Redirecting to transfer…
      </div>
    );
  }

  return <>{children}</>;
}
