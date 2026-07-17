"use client";

import { CheckCircle2, Clock3, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BiometricApprovalPendingProps {
  biometricStatus?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Compact body for dialog (no outer card chrome) */
  variant?: "card" | "dialog";
  className?: string;
}

/** Shown when biometric-status = APPROVAL_PENDING */
export default function BiometricApprovalPending({
  biometricStatus,
  refreshing = false,
  onRefresh,
  variant = "card",
  className,
}: BiometricApprovalPendingProps) {
  const body = (
    <div className={cn("space-y-3", variant === "dialog" && "text-center")}>
      {variant === "dialog" ? (
        <div className="flex flex-col items-center">
          <div className="relative mb-1">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="absolute -bottom-1 -right-1 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-950">
              <Clock3 className="h-3 w-3" />
              Pending
            </span>
          </div>
          <h2 className="text-xl font-bold text-emerald-800">
            Biometric Verification Completed
          </h2>
          <p className="mt-1 text-sm font-semibold text-amber-700">
            Approval Pending
          </p>
        </div>
      ) : (
        <p className="text-sm font-semibold text-amber-700">Approval Pending</p>
      )}

      <p className="text-sm leading-relaxed text-slate-600">
        Your verification request has been submitted for approval.
      </p>
      <p className="text-sm leading-relaxed text-slate-600">
        Approval generally takes 2–24 hours. Biometric services (AEPS, DMT, Mini
        Statement, Cash Deposit, Cash Withdrawal) will unlock once approved.
      </p>
      <p className="text-sm font-semibold text-[#0057D9]">
        Thank you for your patience.
      </p>

      {onRefresh ? (
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4",
            variant === "dialog" && "justify-center"
          )}
        >
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Status: {biometricStatus || "APPROVAL_PENDING"}
          </p>
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
        </div>
      ) : null}
    </div>
  );

  if (variant === "dialog") {
    return <div className={cn("px-1 py-2", className)}>{body}</div>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-lg shadow-amber-100/40",
        className
      )}
    >
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 text-white sm:px-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold sm:text-xl">
                Biometric Verification Completed
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                <Clock3 className="h-3 w-3" />
                Approval pending
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-5 py-5 sm:px-6">{body}</div>
    </motion.section>
  );
}
