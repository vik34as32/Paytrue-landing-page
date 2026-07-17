"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Wallet,
  Send,
  FileText,
  Fingerprint,
  Smartphone,
  User,
  QrCode,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { QUICK_ACTIONS } from "@/features/retailer/dashboard";
import type { AppDispatch } from "@/src/redux/types";
import {
  openBiometricModal,
  selectMerchantIsPendingApproval,
  selectMerchantServicesEnabled,
  selectMerchantStatusChecked,
} from "@/src/redux/slices/merchantSlice";
import { isBiometricProtectedPath } from "@/src/lib/merchantUtils";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Wallet,
  Send,
  FileText,
  Fingerprint,
  Smartphone,
  User,
  QrCode,
};

export default function QuickActions() {
  const dispatch = useDispatch<AppDispatch>();
  const servicesEnabled = useSelector(selectMerchantServicesEnabled);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const isPendingApproval = useSelector(selectMerchantIsPendingApproval);

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1 rt-service-grid">
      {QUICK_ACTIONS.map((action, i) => {
        const Icon = iconMap[action.icon] || Wallet;
        const protectedPath = isBiometricProtectedPath(action.href);
        const locked = statusChecked && !servicesEnabled && protectedPath;
        // Approval pending: navigate to gated route (shows pending card).
        // Action required: open eKYC modal from dashboard.
        const useLink = !locked || isPendingApproval;

        const content = (
          <>
            <div
              className={cn(
                `relative flex h-10 w-10 items-center justify-center rounded-xl ${action.color} text-white shadow-md transition-transform duration-300`,
                useLink && !locked && "group-hover:scale-105",
                locked && "opacity-70"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {locked ? (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 ring-2 ring-white">
                  <Lock className="h-2.5 w-2.5" strokeWidth={2.5} />
                </span>
              ) : null}
            </div>
            <span
              className={cn(
                "text-center text-[10px] font-bold leading-tight text-slate-700 sm:text-[11px]",
                useLink && !locked && "group-hover:text-[#1565d8]"
              )}
            >
              {action.label}
            </span>
          </>
        );

        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="shrink-0"
          >
            {useLink ? (
              <Link
                href={action.href}
                className={cn(
                  "group flex w-[88px] flex-col items-center gap-2 rounded-xl px-3 py-3.5 transition-all duration-300 sm:w-[96px]",
                  locked
                    ? "border border-amber-200/80 bg-amber-50/60 hover:border-amber-300"
                    : "border border-slate-100 bg-white hover:border-[#1565d8]/25 hover:shadow-[0_6px_20px_rgba(21,101,216,0.12)]"
                )}
                style={
                  locked
                    ? undefined
                    : { boxShadow: "0 1px 6px rgba(11, 31, 58, 0.04)" }
                }
              >
                {content}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => dispatch(openBiometricModal())}
                className="group flex w-[88px] flex-col items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-3.5 transition-all duration-300 hover:border-amber-300 sm:w-[96px]"
                title="Complete biometric eKYC to unlock"
              >
                {content}
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
