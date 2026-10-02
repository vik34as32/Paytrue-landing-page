"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDmt1Store } from "../lib/dmt1-store";

export function RequireVerifiedRemitter({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const remitter = useDmt1Store((s) => s.remitter);

  useEffect(() => {
    if (!remitter.mobile || !remitter.otpVerified) {
      router.replace("/rt/retailer/dmt1");
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
export const RequireDmt1Session = RequireVerifiedRemitter;

export function RequireSelectedBeneficiary({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const beneficiary = useDmt1Store((s) => s.getSelectedBeneficiary());

  useEffect(() => {
    if (!beneficiary) {
      router.replace("/rt/retailer/dmt1/beneficiaries");
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
  const commission = useDmt1Store((s) => s.commission);

  useEffect(() => {
    if (!commission) {
      router.replace("/rt/retailer/dmt1/transfer");
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
