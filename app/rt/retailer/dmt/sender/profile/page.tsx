"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Plus, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtStatusBadge from "@/src/components/dmt/DmtStatusBadge";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useSenderByMobile } from "@/src/hooks/useDmt";
import { setActiveSenderMobile } from "@/src/lib/dmtSession";
import { formatCurrency } from "@/lib/utils";

function SenderProfileContent() {
  const params = useSearchParams();
  const mobile = params?.get("mobile") ?? "";
  const { data, isLoading, isError, error, refetch } = useSenderByMobile(
    mobile,
    Boolean(mobile)
  );

  useEffect(() => {
    if (mobile) setActiveSenderMobile(mobile);
  }, [mobile]);

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
        title="Sender Dashboard"
        description="Sender information and quick actions"
        backHref="/rt/retailer/dmt/sender"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>{data?.name || "Sender"}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{data?.mobile}</p>
          </div>
          <DmtStatusBadge status={data?.verificationStatus ?? "pending"} />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Mobile" value={data?.mobile} />
          <Info label="Beneficiary Count" value={String(data?.beneficiaryCount ?? 0)} />
          <Info label="Daily Limit" value={formatCurrency(data?.dailyLimit ?? 0)} />
          <Info label="Monthly Limit" value={formatCurrency(data?.monthlyLimit ?? 0)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button asChild className="h-auto justify-start py-4">
            <Link
              href={`/rt/retailer/dmt/beneficiaries/add?mobile=${encodeURIComponent(mobile)}`}
            >
              <Plus className="h-4 w-4" />
              Add Beneficiary
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-start py-4">
            <Link
              href={`/rt/retailer/dmt/beneficiaries?mobile=${encodeURIComponent(mobile)}`}
            >
              <Users className="h-4 w-4" />
              Beneficiary List
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-auto justify-start bg-gradient-to-r from-[#0A84FF] to-[#0057D9] py-4 text-white hover:text-white"
          >
            <Link href={`/rt/retailer/dmt/transfer?mobile=${encodeURIComponent(mobile)}`}>
              <Send className="h-4 w-4" />
              Transfer Money
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </Button>
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
