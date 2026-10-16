"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  ClipboardCheck,
  Fingerprint,
  IndianRupee,
  Landmark,
  List,
  LogIn,
  Search,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import PageLoader from "@/src/components/common/PageLoader";
import { useRDService } from "@/src/hooks/useRDService";
import { BIOMETRIC_DEVICE_OPTIONS } from "@/src/types/biometric";
import {
  NSDL_AEPS_BASE_PATH,
  NSDL_AEPS_LEDGER_PATH,
  NSDL_AEPS_LOGIN_PATH,
  NSDL_AEPS_ONBOARDING_PATH,
  NSDL_AEPS_STATUS_PATH,
} from "../lib/nsdl-aeps-endpoints";
import { useNsdlMerchant } from "../lib/nsdl-aeps-hooks";

const TRANSACTION_LINKS = [
  { label: "Cash Withdrawal", href: `${NSDL_AEPS_BASE_PATH}/cash-withdrawal`, icon: Wallet },
  { label: "Balance Enquiry", href: `${NSDL_AEPS_BASE_PATH}/balance-enquiry`, icon: Landmark },
  { label: "Mini Statement", href: `${NSDL_AEPS_BASE_PATH}/mini-statement`, icon: List },
  { label: "Cash Deposit", href: `${NSDL_AEPS_BASE_PATH}/cash-deposit`, icon: IndianRupee },
  { label: "Aadhaar Pay", href: `${NSDL_AEPS_BASE_PATH}/aadhaar-pay`, icon: Fingerprint },
];

function formatStatus(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function NsdlDashboardPage() {
  const { merchant, isLoading, activated, loginDone } = useNsdlMerchant();
  const { status, refresh, isChecking, selectedDevice } = useRDService();

  if (isLoading) {
    return <PageLoader message="Loading NSDL AEPS dashboard..." />;
  }

  const deviceLabel =
    BIOMETRIC_DEVICE_OPTIONS.find((d) => d.value === selectedDevice)?.label || "Mantra L1";

  const headerAction = !activated
    ? { href: NSDL_AEPS_ONBOARDING_PATH, label: "Complete Onboarding" }
    : { href: NSDL_AEPS_LOGIN_PATH, label: loginDone ? "Re-login" : "Daily Login" };

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="NSDL AEPS Dashboard"
        description="Aadhaar Enabled Payment System via NSDL — Mantra L1 & Morpho MSO 1300 E3"
        actions={
          <Button asChild className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5]">
            <Link href={headerAction.href}>
              {headerAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Merchant Status</CardDescription>
            <CardTitle className={activated ? "text-emerald-600" : "text-amber-600"}>
              {activated ? "Active" : formatStatus(merchant?.status || "NOT_STARTED")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            {merchant?.merchantId ? `MID: ${merchant.merchantId}` : "Onboarding not completed"}
          </CardContent>
        </Card>

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
          <CardContent className="text-xs text-slate-500">
            {status.deviceReady ? "Device ready" : "Device not ready"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Daily Login</CardDescription>
            <CardTitle className={loginDone ? "text-emerald-600" : "text-amber-600"}>
              {loginDone ? "Completed" : "Pending"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-500">
            {merchant?.lastDailyLoginAt
              ? `Last login: ${new Date(merchant.lastDailyLoginAt).toLocaleString("en-IN")}`
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
              {!activated
                ? "Complete NSDL AEPS onboarding to activate the service"
                : loginDone
                  ? "Start an NSDL AEPS service"
                  : "Complete daily login to unlock NSDL AEPS services"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {!activated ? (
              <Button
                asChild
                className="h-auto justify-start bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] py-4 sm:col-span-2"
              >
                <Link href={NSDL_AEPS_ONBOARDING_PATH}>
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Complete Onboarding
                </Link>
              </Button>
            ) : !loginDone ? (
              <>
                <Button
                  asChild
                  className="h-auto justify-start bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] py-4 sm:col-span-2"
                >
                  <Link href={NSDL_AEPS_LOGIN_PATH}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Daily Login
                  </Link>
                </Button>
                <p className="text-sm text-slate-500 sm:col-span-2">
                  Cash Withdrawal, Balance Enquiry, Mini Statement, Cash Deposit and Aadhaar Pay
                  will appear after successful daily login.
                </p>
              </>
            ) : (
              TRANSACTION_LINKS.map(({ label, href, icon: Icon }) => (
                <Button key={href} asChild variant="outline" className="h-auto justify-start py-4">
                  <Link href={href}>
                    <Icon className="mr-2 h-4 w-4 text-[#6D28D9]" />
                    {label}
                  </Link>
                </Button>
              ))
            )}
            <Button asChild variant="outline" className="h-auto justify-start py-4">
              <Link href={NSDL_AEPS_STATUS_PATH}>
                <Search className="mr-2 h-4 w-4 text-[#6D28D9]" />
                Check Transaction Status
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto justify-start py-4">
              <Link href={NSDL_AEPS_LEDGER_PATH}>
                <BookOpenText className="mr-2 h-4 w-4 text-[#6D28D9]" />
                NSDL AEPS Ledger
              </Link>
            </Button>
          </CardContent>
        </Card>

        <DeviceStatusCard status={status} isChecking={isChecking} onRefresh={refresh} />
      </div>
    </div>
  );
}
