"use client";

import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { AppDispatch } from "@/src/redux/types";
import {
  selectMerchantBiometricStatus,
  selectMerchantIsPendingApproval,
  selectMerchantIsVerified,
  selectMerchantStatusChecked,
  selectMerchantStatusLoading,
} from "@/src/redux/slices/merchantSlice";
import { loadMerchantBiometricStatus } from "@/src/redux/thunks/merchantThunk";
import BiometricVerificationDialog from "@/components/biometric/BiometricVerificationDialog";
import {
  closeBiometricModal,
  openBiometricModal,
  selectMerchantModalOpen,
} from "@/src/redux/slices/merchantSlice";

export default function BiometricKycDashboardCard() {
  const dispatch = useDispatch<AppDispatch>();
  const isVerified = useSelector(selectMerchantIsVerified);
  const isPendingApproval = useSelector(selectMerchantIsPendingApproval);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const statusLoading = useSelector(selectMerchantStatusLoading);
  const biometricStatus = useSelector(selectMerchantBiometricStatus);
  const dialogOpen = useSelector(selectMerchantModalOpen);

  if (statusLoading && !statusChecked) return null;
  if (isVerified) return null;

  const openDialog = () => dispatch(openBiometricModal());
  const closeDialog = () => dispatch(closeBiometricModal());
  const refreshStatus = () => dispatch(loadMerchantBiometricStatus());

  if (isPendingApproval) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-lg shadow-amber-100/40"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 text-white sm:px-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold sm:text-xl">
                  Biometric verification completed successfully
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                  <Clock3 className="h-3 w-3" />
                  Pending
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-5 py-5 sm:px-6">
          <p className="text-sm leading-relaxed text-slate-600">
            Your verification request has been submitted to PayTrue for approval.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            Approval generally takes between 2 to 24 hours. You will be able to use
            biometric services once your approval is completed.
          </p>
          <p className="text-sm font-semibold text-[#0057D9]">
            Thank you for your patience.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Status: {biometricStatus || "APPROVAL_PENDING"}
            </p>
            <button
              type="button"
              onClick={() => void refreshStatus()}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0057D9] transition hover:bg-blue-50"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={openDialog}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="group w-full rounded-2xl border border-blue-200/80 bg-gradient-to-r from-[#001F5B] via-[#1565d8] to-[#0A84FF] p-5 text-left shadow-lg shadow-blue-900/15 transition hover:shadow-xl hover:brightness-105 sm:p-6"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white sm:text-xl">
                Complete Biometric Verification
              </h2>
              <span className="rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
                Required
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-100/90">
              Click here to select Mantra or Morpho scanner and complete merchant biometric KYC
              for AEPS services.
            </p>
            {statusChecked ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Status: {biometricStatus || "PENDING"}
              </p>
            ) : null}
          </div>

          <span className="text-white/80 transition group-hover:translate-x-0.5">→</span>
        </div>
      </motion.button>

      <BiometricVerificationDialog open={dialogOpen} onClose={closeDialog} />
    </>
  );
}
