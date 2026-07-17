"use client";

import { BadgeCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BiometricApprovedProps {
  biometricStatus?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

/** Shown when biometric-status = APPROVED — services are enabled */
export default function BiometricApproved({
  biometricStatus,
  refreshing = false,
  onRefresh,
  className,
}: BiometricApprovedProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50 to-white shadow-md shadow-emerald-100/40",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
            <BadgeCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-emerald-900 sm:text-lg">
              Biometric Approved
            </h2>
            <p className="text-sm text-emerald-800/80">
              AEPS, DMT and cash services are enabled for this outlet.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Status: {biometricStatus || "APPROVED"}
          </p>
          {onRefresh ? (
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
          ) : null}
        </div>
      </div>
    </motion.section>
  );
}
