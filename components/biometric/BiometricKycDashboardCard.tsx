"use client";

import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Fingerprint, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import BiometricVerificationDialog from "@/components/biometric/BiometricVerificationDialog";
import type { AppDispatch } from "@/src/redux/types";
import {
  closeBiometricModal,
  openBiometricModal,
  selectMerchantBiometricStatus,
  selectMerchantIsVerified,
  selectMerchantModalOpen,
  selectMerchantStatusChecked,
  selectMerchantStatusLoading,
} from "@/src/redux/slices/merchantSlice";

export default function BiometricKycDashboardCard() {
  const dispatch = useDispatch<AppDispatch>();
  const isVerified = useSelector(selectMerchantIsVerified);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const statusLoading = useSelector(selectMerchantStatusLoading);
  const biometricStatus = useSelector(selectMerchantBiometricStatus);
  const dialogOpen = useSelector(selectMerchantModalOpen);

  if (statusLoading && !statusChecked) return null;
  if (isVerified) return null;

  const openDialog = () => dispatch(openBiometricModal());
  const closeDialog = () => dispatch(closeBiometricModal());

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
            <Fingerprint className="h-7 w-7 text-white" />
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

          <ChevronRight className="h-6 w-6 shrink-0 text-white/80 transition group-hover:translate-x-0.5" />
        </div>
      </motion.button>

      <BiometricVerificationDialog open={dialogOpen} onClose={closeDialog} />
    </>
  );
}
