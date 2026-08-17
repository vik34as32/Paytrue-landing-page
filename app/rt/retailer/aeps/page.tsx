"use client";

import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";

import {
  ArrowRight,
  Fingerprint,
  IndianRupee,
  Landmark,
  List,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { WalletCards} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import { useRDService } from "@/src/hooks/useRDService";
import { BIOMETRIC_DEVICE_OPTIONS } from "@/src/types/biometric";
import { useAepsHealth } from "@/src/hooks/useAeps";
import { useAepsWalletBalance } from "@/src/hooks/useAepsWalletBalance";
import { selectAepsDailyLoginDone } from "@/src/redux/slices/aepsSlice";
import PageLoader from "@/src/components/common/PageLoader";
import { useState } from "react";
import { topupAepsToMainWallet } from "@/src/services/aepsService";

const TRANSACTION_LINKS = [
  { label: "Cash Withdrawal", href: "/rt/retailer/aeps/cash-withdrawal", icon: Wallet },
  { label: "Balance Enquiry", href: "/rt/retailer/aeps/balance-enquiry", icon: Landmark },
  { label: "Mini Statement", href: "/rt/retailer/aeps/mini-statement", icon: List },
  { label: "Cash Deposit", href: "/rt/retailer/aeps/cash-deposit", icon: IndianRupee },
  { label: "Aadhaar Pay", href: "/rt/retailer/aeps/aadhaar-pay", icon: Fingerprint },
];

export default function AepsDashboardPage() {
  const aeps = useSelector((state: {
    aeps: {
      lastLoginDate: string | null;
      agentName: string;
      loginMessage: string;
    }
  }) => state.aeps);
  const loginDone = useSelector(selectAepsDailyLoginDone);
  const { status, refresh, isChecking, selectedDevice } = useRDService();
  const { isLoading: healthLoading } = useAepsHealth();
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { balance, loading: balanceLoading } = useAepsWalletBalance();
  const numericAmount = Number(amount);
const availableBalance = Number(balance ?? 0);




const handleSubmit = async () => {
  setError(null);

 if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
   setError("Enter a valid amount greater than 0.");
   return;
 }

 if (numericAmount > availableBalance) {
   setError("Amount cannot exceed available Aeps balance.");
   return;
 }

  try {
    await topupAepsToMainWallet({
      amount: numericAmount,
     });

    toast.success(
      "Commission transferred to main wallet successfully."
    );

    setOpen(false);
  } catch (err) {
    const message =
      (err as { message?: string })?.message ||
      (err as { data?: { message?: string } })?.data?.message ||
      "Failed to top-up main wallet.";

    setError(message);
    toast.error(message);
  }
};

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
        <Card className="cursor-pointer transition hover:shadow-md"
          onClick={() => setOpen(true)}>
          <CardHeader className="pb-2">
            <CardDescription>AEPS Wallet Balance</CardDescription>
            <CardTitle className="text-base">
              {balanceLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : (
                formatCurrency(balance ?? 0)
              )}
            </CardTitle>
          </CardHeader>
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

      <Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[580px] rounded-2xl">

    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-2xl">
        <WalletCards className="h-6 w-6 text-blue-600" />
        Top-up Main Wallet
      </DialogTitle>

      <DialogDescription>
        Transfer AEPS  balance into your main wallet.
      </DialogDescription>
    </DialogHeader>

    {/* Balance */}
    <div className="rounded-xl bg-slate-50 p-5">
      <p className="text-sm font-semibold text-slate-400">
        AVAILABLE COMMISSION
      </p>

      <p className="mt-1 text-2xl font-bold">
        {formatCurrency(balance ?? 0)}
      </p>
    </div>

    {/* Amount */}
    <div>
      <label className="text-sm font-semibold">
        Amount (₹)
      </label>

      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="mt-2 h-14 rounded-xl"
      />
    </div>

    {/* Quick Amount */}
    <div className="flex gap-2">
      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setAmount("100")}
      >
        ₹100
      </Button>

      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setAmount("500")}
      >
        ₹500
      </Button>

      <Button
        variant="outline"
        className="rounded-full"
        onClick={() => setAmount("1000")}
      >
        ₹1000
      </Button>

      <Button
        variant="outline"
        className="rounded-full border-green-300 text-green-600"
        onClick={() => setAmount(String(balance ?? 0))}
      >
        Full balance
      </Button>
    </div>

         {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

    {/* Footer */}
    <div className="flex justify-end gap-4">
      <Button
        variant="outline"
        onClick={() => setOpen(false)}
      >
        Cancel
      </Button>

      <Button
        className="bg-blue-600 hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Transfer to Main Wallet
      </Button>
    </div>

  </DialogContent>
</Dialog>

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
