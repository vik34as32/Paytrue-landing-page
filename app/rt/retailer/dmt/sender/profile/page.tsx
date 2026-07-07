"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtStatusBadge from "@/src/components/dmt/DmtStatusBadge";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useSenderByMobile } from "@/src/hooks/useDmt";
import { formatCurrency } from "@/lib/utils";

function SenderProfileContent() {
  const params = useSearchParams();
  const mobile = params?.get("mobile") ?? "";
  const { data, isLoading, isError, error, refetch } = useSenderByMobile(
    mobile,
    Boolean(mobile)
  );

  if (!mobile) {
    return (
      <DmtErrorState
        code="INVALID_SENDER"
        message="Mobile number is required to view sender profile."
      />
    );
  }

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (isError) {
    return (
      <DmtErrorState
        code={(error as { code?: string })?.code as never}
        message={(error as Error)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DmtPageHeader
        title="Sender Profile"
        description="Remitter details and transfer limits"
        backHref="/rt/retailer/dmt/sender"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/rt/retailer/dmt/sender/ekyc?mobile=${encodeURIComponent(mobile)}`}>
                Complete eKYC
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/rt/retailer/dmt/beneficiaries?mobile=${encodeURIComponent(mobile)}`}>
                View Beneficiaries
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{data?.name}</CardTitle>
          <DmtStatusBadge status={data?.verificationStatus ?? "pending"} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Mobile" value={data?.mobile} />
          <Info label="Beneficiary Count" value={String(data?.beneficiaryCount ?? 0)} />
          <Info label="Daily Limit" value={formatCurrency(data?.dailyLimit ?? 0)} />
          <Info label="Monthly Limit" value={formatCurrency(data?.monthlyLimit ?? 0)} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#001F5B]">{value || "—"}</p>
    </div>
  );
}

export default function SenderProfilePage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-sm text-slate-500">Loading...</div>}>
      <SenderProfileContent />
    </Suspense>
  );
}
