"use client";

import { useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  History,
  IndianRupee,
  Landmark,
  List,
  Loader2,
  LogIn,
  ScanLine,
  Wallet,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import DeviceStatusCard from "@/src/components/aeps/DeviceStatusCard";
import DeviceSelector from "@/src/components/aeps/DeviceSelector";
import { useRDService } from "@/src/hooks/useRDService";
import { BIOMETRIC_DEVICE_OPTIONS } from "@/src/types/biometric";
import { useAepsHealth } from "@/src/hooks/useAeps";
import { useAepsWalletBalance } from "@/src/hooks/useAepsWalletBalance";
import { selectAepsDailyLoginDone } from "@/src/redux/slices/aepsSlice";
import PageLoader from "@/src/components/common/PageLoader";
import { AEPS_SETTLEMENTS_PATH } from "@/src/modules/aeps-settlement/api";
import AepsWalletTransferModal, {
  type AepsTransferTarget,
} from "@/src/modules/aeps-settlement/components/AepsWalletTransferModal";

const TRANSACTION_LINKS = [
  { label: "Cash Withdrawal", href: "/rt/retailer/aeps/cash-withdrawal", icon: Wallet },
  { label: "Balance Enquiry", href: "/rt/retailer/aeps/balance-enquiry", icon: Landmark },
  { label: "Mini Statement", href: "/rt/retailer/aeps/mini-statement", icon: List },
  { label: "Cash Deposit", href: "/rt/retailer/aeps/cash-deposit", icon: IndianRupee },
  { label: "Aadhaar Pay", href: "/rt/retailer/aeps/aadhaar-pay", icon: Fingerprint },
];

type StatusTone = "ok" | "warn" | "bad" | "neutral" | "info";

function formatLastLogin(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LiveDot({ tone, live = false }: { tone: StatusTone; live?: boolean }) {
  const color =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "bad"
          ? "bg-rose-500"
          : tone === "info"
            ? "bg-[#1565d8]"
            : "bg-slate-300";
  const ping =
    tone === "ok"
      ? "bg-emerald-400"
      : tone === "warn"
        ? "bg-amber-400"
        : tone === "bad"
          ? "bg-rose-400"
          : "";

  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
      {live && ping ? (
        <span
          className={cn(
            "absolute inset-0 animate-ping rounded-full opacity-70 motion-reduce:animate-none",
            ping
          )}
        />
      ) : null}
      <span className={cn("relative h-2 w-2 rounded-full", color)} />
    </span>
  );
}

function StatusTile({
  label,
  value,
  meta,
  icon: Icon,
  tone,
  emphasis = false,
  delay = 0,
  footer,
  headerAside,
  live = false,
  className,
}: {
  label: string;
  value: ReactNode;
  meta?: string;
  icon: LucideIcon;
  tone: StatusTone;
  emphasis?: boolean;
  delay?: number;
  footer?: ReactNode;
  headerAside?: ReactNode;
  live?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const valueColor =
    tone === "ok"
      ? "text-emerald-600"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-rose-600"
          : "text-[#0b1f3a]";

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]",
        className
      )}
    >
      <div className="flex h-5 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={2} />
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
            {label}
          </p>
        </div>
        {headerAside ?? <LiveDot tone={tone} live={live} />}
      </div>

      <div className="mt-2.5 flex h-8 items-end">
        <div
          className={cn(
            "min-w-0 truncate font-semibold leading-none tracking-tight",
            emphasis ? "text-[1.65rem] tabular-nums" : "text-lg",
            valueColor
          )}
          title={typeof value === "string" ? value : undefined}
        >
          {value}
        </div>
      </div>

      <div className="mt-3 flex h-9 w-full items-center">
        {footer ?? (
          <p className="truncate text-xs text-slate-500" title={meta}>
            {meta || "—"}
          </p>
        )}
      </div>
    </motion.article>
  );
}

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
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<AepsTransferTarget>("main");
  const { balance, loading: balanceLoading } = useAepsWalletBalance();
  const availableBalance = Number(balance ?? 0);

  const openTransfer = (target: AepsTransferTarget) => {
    setTransferTarget(target);
    setTransferOpen(true);
  };

  const reduceMotion = useReducedMotion();
  const deviceLabel =
    BIOMETRIC_DEVICE_OPTIONS.find((d) => d.value === selectedDevice)?.label ||
    "Mantra L1";
  const lastLoginLabel = aeps.lastLoginDate
    ? `Last login · ${formatLastLogin(aeps.lastLoginDate)}`
    : "Login required before transactions";

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

      <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-12">
        <StatusTile
          className="sm:col-span-2 xl:col-span-4"
          label="AEPS Wallet"
          emphasis
          icon={Wallet}
          tone="neutral"
          delay={0}
          headerAside={
            <Link
              href={AEPS_SETTLEMENTS_PATH}
              className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#1565d8] transition-colors hover:text-[#0f56c2]"
            >
              <History className="h-3 w-3" />
              Settlements
            </Link>
          }
          value={
            balanceLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            ) : (
              formatCurrency(availableBalance)
            )
          }
          footer={
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 min-w-0 rounded-lg px-2 text-xs shadow-none transition-colors active:translate-y-px"
                onClick={() => openTransfer("main")}
              >
                <WalletCards className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />
                <span className="truncate">Main Wallet</span>
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 min-w-0 rounded-lg bg-[#1565d8] px-2 text-xs text-white shadow-none transition-colors hover:bg-[#0f56c2] hover:opacity-100 hover:shadow-none active:translate-y-px"
                onClick={() => openTransfer("bank")}
              >
                <Landmark className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">To Bank</span>
              </Button>
            </div>
          }
        />
        <StatusTile
          className="xl:col-span-2"
          label="Selected Device"
          icon={ScanLine}
          tone="info"
          delay={0.05}
          value={deviceLabel}
          meta="Biometric scanner"
        />
        <StatusTile
          className="xl:col-span-2"
          label="RD Service"
          icon={Activity}
          tone={status.isRunning ? "ok" : "bad"}
          live={status.isRunning}
          delay={0.1}
          value={status.isRunning ? "Running" : "Not Running"}
          meta={status.isRunning ? "Service responding" : "Start the RD application"}
        />
        <StatusTile
          className="xl:col-span-2"
          label="Device Ready"
          icon={CheckCircle2}
          tone={status.deviceReady ? "ok" : "warn"}
          delay={0.15}
          value={status.deviceReady ? "Ready" : "Not Ready"}
          meta={status.deviceReady ? "Capture available" : "Waiting for scanner"}
        />
        <StatusTile
          className="xl:col-span-2"
          label="Daily Login"
          icon={LogIn}
          tone={loginDone ? "ok" : "warn"}
          delay={0.2}
          value={loginDone ? "Completed" : "Pending"}
          meta={lastLoginLabel}
        />
      </div>

      <AepsWalletTransferModal
        open={transferOpen}
        onOpenChange={setTransferOpen}
        target={transferTarget}
        onTargetChange={setTransferTarget}
        balance={availableBalance}
      />

      <DeviceSelector disabled={isChecking} />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
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
                  className="h-11 justify-start bg-gradient-to-r from-[#0A84FF] to-[#0057D9] px-4 sm:col-span-2"
                >
                  <Link href="/rt/retailer/aeps/login">
                    <LogIn className="h-4 w-4" />
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
                    className="h-11 justify-start px-4 shadow-none transition-colors hover:border-[#1565d8]/30 hover:bg-blue-50/70"
                  >
                    <Link href={href}>
                      <Icon className="h-4 w-4 text-[#1565d8]" />
                      {label}
                    </Link>
                  </Button>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="h-11 justify-start px-4 shadow-none transition-colors hover:border-[#1565d8]/30 hover:bg-blue-50/70"
                >
                  <Link href="/rt/retailer/aeps/transaction-status">
                    <History className="h-4 w-4 text-[#1565d8]" />
                    Transaction Status
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
      </motion.div>

      {aeps.loginMessage ? (
        <p className="text-sm text-slate-500">{aeps.loginMessage}</p>
      ) : null}
    </div>
  );
}
