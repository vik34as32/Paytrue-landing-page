"use client";

import { Fingerprint, RefreshCw, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SERVICES = [
  "AEPS",
  "DMT",
  "Mini Statement",
  "Cash Deposit",
  "Cash Withdrawal",
] as const;

export interface BiometricRequiredCardProps {
  biometricStatus?: string;
  action?: string;
  refreshing?: boolean;
  onCompleteEkyc: () => void;
  onRefresh: () => void;
  className?: string;
}

/** Shown when biometric-status = PENDING + action = ACTION-REQUIRED */
export default function BiometricRequiredCard({
  biometricStatus,
  action,
  refreshing = false,
  onCompleteEkyc,
  onRefresh,
  className,
}: BiometricRequiredCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-blue-200/80 bg-white shadow-lg shadow-blue-100/50",
        className
      )}
    >
      <div className="bg-gradient-to-r from-[#001F5B] via-[#1565d8] to-[#0A84FF] px-5 py-4 text-white sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold sm:text-xl">
                Biometric Authentication Required
              </h2>
              <span className="rounded-full bg-amber-400/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                Action required
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-100/90">
              Complete InstantPay merchant biometric eKYC to unlock cash services.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Complete your biometric eKYC to activate:
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {SERVICES.map((service) => (
              <li
                key={service}
                className="flex items-center gap-2 text-sm text-slate-600"
              >
                <Fingerprint className="h-3.5 w-3.5 shrink-0 text-[#1565d8]" />
                {service}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500">
            Status: {biometricStatus || "PENDING"}
            {action ? ` · ${action}` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={refreshing}
              onClick={onRefresh}
              className="gap-1.5"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", refreshing && "animate-spin")}
              />
              Refresh Status
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onCompleteEkyc}
              className="gap-1.5 bg-[#1565d8] hover:bg-[#0d47a1]"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              Complete eKYC
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
