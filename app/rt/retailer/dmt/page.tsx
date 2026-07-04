"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  IndianRupee,
  Send,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DmtPageHeader from "@/src/components/dmt/DmtPageHeader";
import DmtErrorState from "@/src/components/dmt/DmtErrorState";
import { useDmtDashboard } from "@/src/hooks/useDmt";
import { selectRtWallet } from "@/src/redux/slices/walletSlice";
import { formatCurrency } from "@/lib/utils";

const STAT_CARDS: Array<{
  key: keyof import("@/src/types/dmt").DmtDashboardStats;
  label: string;
  icon: typeof Send;
  currency?: boolean;
}> = [
  { key: "todayTransfers", label: "Today's Transfers", icon: Send },
  { key: "successfulTransfers", label: "Successful", icon: Store },
  { key: "pendingTransfers", label: "Pending", icon: Users },
  { key: "failedTransfers", label: "Failed", icon: Users },
  { key: "walletBalance", label: "Wallet Balance", icon: Wallet, currency: true },
  { key: "totalBeneficiaries", label: "Beneficiaries", icon: Users },
  { key: "totalSenders", label: "Senders", icon: Users },
  {
    key: "totalTransferAmount",
    label: "Total Transfer Amount",
    icon: IndianRupee,
    currency: true,
  },
];

export default function DmtDashboardPage() {
  const wallet = useSelector(selectRtWallet);
  const balance =
    wallet.lastUpdated != null
      ? wallet.availableBalance ?? wallet.balance
      : 0;

  const { stats, isLoading, isError, refetch, isFetching } =
    useDmtDashboard(balance);

  return (
    <div className="space-y-6">
      <DmtPageHeader
        title="DMT Dashboard"
        description="Domestic Money Transfer overview and quick actions"
        actions={
          <Button asChild className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9]">
            <Link href="/rt/retailer/dmt/sender">
              Send Money
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {isError && (
        <DmtErrorState
          code="SERVER_ERROR"
          message="Unable to load DMT dashboard data."
          onRetry={() => refetch()}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, currency }) => (
          <Card key={key} className="border-slate-200/80 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{label}</CardDescription>
                <div className="rounded-lg bg-blue-50 p-2 text-[#1565d8]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                {isLoading || isFetching ? (
                  <span className="inline-block h-7 w-20 animate-pulse rounded bg-slate-200" />
                ) : currency ? (
                  formatCurrency(Number(stats?.[key] ?? 0))
                ) : (
                  stats?.[key] ?? 0
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Start a transfer or manage beneficiaries</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="h-auto justify-start py-4">
              <Link href="/rt/retailer/dmt/sender">Check Sender</Link>
            </Button>
            <Button asChild variant="outline" className="h-auto justify-start py-4">
              <Link href="/rt/retailer/dmt/beneficiaries/add">Add Beneficiary</Link>
            </Button>
            <Button asChild variant="outline" className="h-auto justify-start py-4">
              <Link href="/rt/retailer/dmt/transactions">Transaction History</Link>
            </Button>
            <Button asChild variant="outline" className="h-auto justify-start py-4">
              <Link href="/rt/retailer/dmt/beneficiaries">Manage Beneficiaries</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#001F5B] via-[#0057D9] to-[#1565d8] text-white">
          <CardContent className="p-6">
            <p className="text-sm text-blue-100">Available Wallet Balance</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(balance)}</p>
            <p className="mt-4 text-sm text-blue-100/90">
              Verify sender, add beneficiary, and transfer securely using IMPS or NEFT.
            </p>
            <Button asChild variant="secondary" className="mt-5">
              <Link href="/rt/retailer/dmt/sender">Start Transfer</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
