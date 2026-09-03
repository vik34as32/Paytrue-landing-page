"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDmt2Store } from "../lib/dmt2-store";

export function RequireVerifiedRetailer({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const retailer = useDmt2Store((s) => s.retailer);

  useEffect(() => {
    if (!retailer.mobile || !retailer.otpVerified) {
      router.replace("/rt/retailer/dmt2");
    }
  }, [retailer.mobile, retailer.otpVerified, router]);

  if (!retailer.mobile || !retailer.otpVerified) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Redirecting to search retailer…
      </div>
    );
  }

  return <>{children}</>;
}
