"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import {
  ArrowRight,
  Fingerprint,
  IndianRupee,
  Landmark,
  List,
  LogIn,
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
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import { useRDService } from "@/src/hooks/useRDService";
import { BIOMETRIC_DEVICE_OPTIONS } from "@/src/types/biometric";
import { useAepsHealth } from "@/src/hooks/useAeps";
import { selectAepsDailyLoginDone } from "@/src/redux/slices/aepsSlice";
import PageLoader from "@/src/components/common/PageLoader";

const TRANSACTION_LINKS = [
  { label: "Cash Withdrawal", href: "/rt/retailer/aeps/cash-withdrawal", icon: Wallet },
  { label: "Balance Enquiry", href: "/rt/retailer/aeps/balance-enquiry", icon: Landmark },
  { label: "Mini Statement", href: "/rt/retailer/aeps/mini-statement", icon: List },
  { label: "Cash Deposit", href: "/rt/retailer/aeps/cash-deposit", icon: IndianRupee },
  { label: "Aadhaar Pay", href: "/rt/retailer/aeps/aadhaar-pay", icon: Fingerprint },
];

export default function AepsDashboardPage() {
  const aeps = useSelector((state: { aeps: {
    lastLoginDate: string | null;
    agentName: string;
    loginMessage: string;
  } }) => state.aeps);
  const loginDone = useSelector(selectAepsDailyLoginDone);
  const { status, refresh, isChecking, selectedDevice } = useRDService();
  const { data: health, isLoading: healthLoading } = useAepsHealth();

  const deviceLabel =
    BIOMETRIC_DEVICE_OPTIONS.find((d) => d.value === selectedDevice)?.label ||
    "Mantra L1";

  if (healthLoading) {
    return <PageLoader message="Loading AEPS dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="AEPS Dashboard"
        description="Aadhaar Enabled Payment System — Mantra L1 & Morpho MSO 1300 E3"
        actions={
          <Button asChild className="bg-gradient-to-r from-[#0A84FF] to-[#0057D9]">
            <Link href="/rt/retailer/aeps/login">
              {loginDone ? "Re-login" : "Daily Login"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selected Device</CardDescription>
            <CardTitle className="text-base">{deviceLabel}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>RD Service</CardDescription>
            <CardTitle className={status.isRunning ? "text-emerald-600" : "text-rose-600"}>
              {status.isRunning ? "Running" : "Not Running"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Device Ready</CardDescription>
            <CardTitle className="text-base">
              {status.deviceReady ? "Ready" : "Not Ready"}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Daily Login</CardDescription>
            <CardTitle className={loginDone ? "text-emerald-600" : "text-amber-600"}>
              {loginDone ? "Completed" : "Pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            {aeps.lastLoginDate
              ? `Last login: ${new Date(aeps.lastLoginDate).toLocaleString("en-IN")}`
              : "Complete daily login before transactions."}
          </CardContent>
        </Card>
      </div>

      <DeviceSelector className="max-w-2xl" disabled={isChecking} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {loginDone
                ? "Start an AEPS service"
                : "Complete daily login to unlock AEPS services"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {!loginDone ? (
              <>
                <Button
                  asChild
                  className="h-auto justify-start bg-gradient-to-r from-[#0A84FF] to-[#0057D9] py-4 sm:col-span-2"
                >
                  <Link href="/rt/retailer/aeps/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Daily Login
                  </Link>
                </Button>
                <p className="text-sm text-slate-500 sm:col-span-2">
                  Cash Withdrawal, Balance Enquiry, Mini Statement, Cash Deposit,
                  Aadhaar Pay and Transaction Status will appear after successful
                  daily login.
                </p>
              </>
            ) : (
              <>
                {TRANSACTION_LINKS.map(({ label, href, icon: Icon }) => (
                  <Button
                    key={href}
                    asChild
                    variant="outline"
                    className="h-auto justify-start py-4"
                  >
                    <Link href={href}>
                      <Icon className="mr-2 h-4 w-4 text-[#1565d8]" />
                      {label}
                    </Link>
                  </Button>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="h-auto justify-start py-4 sm:col-span-2"
                >
                  <Link href="/rt/retailer/aeps/transaction-status">
                    Check Transaction Status
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <DeviceStatusCard
          status={status}
          isChecking={isChecking}
          onRefresh={refresh}
        />
      </div>

      {aeps.loginMessage ? (
        <p className="text-sm text-slate-500">{aeps.loginMessage}</p>
      ) : null}
    </div>
  );
}
