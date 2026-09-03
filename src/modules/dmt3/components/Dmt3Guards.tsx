"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDmt3RetailerContext } from "../hooks/useDmt3RetailerContext";
import { useDmt3Store } from "../lib/dmt3-store";

export function RequireDmt3Session({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const retailer = useDmt3RetailerContext();

  useEffect(() => {
    if (!retailer.senderMobile) {
      router.replace("/rt/retailer");
    }
  }, [retailer.senderMobile, router]);

  if (!retailer.senderMobile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading retailer session…
      </div>
    );
  }

  return <>{children}</>;
}

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
