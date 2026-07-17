"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Fingerprint, Loader2 } from "lucide-react";
import type { AppDispatch } from "@/src/redux/types";
import {
  closeBiometricModal,
  openBiometricModal,
  selectMerchantAction,
  selectMerchantBiometricStatus,
  selectMerchantIsVerified,
  selectMerchantModalOpen,
  selectMerchantStatusChecked,
  selectMerchantStatusLoading,
  selectMerchantUiPhase,
} from "@/src/redux/slices/merchantSlice";
import { loadMerchantBiometricStatus } from "@/src/redux/thunks/merchantThunk";
import BiometricRequiredCard from "@/components/biometric/BiometricRequiredCard";
import BiometricApprovalPending from "@/components/biometric/BiometricApprovalPending";
import BiometricVerificationDialog from "@/components/biometric/BiometricVerificationDialog";
import { Button } from "@/components/ui/button";

interface MerchantBiometricGateProps {
  children: React.ReactNode;
  /** Service label shown in the blocked state (e.g. AEPS, DMT) */
  serviceLabel?: string;
}

/**
 * Blocks AEPS/DMT (and related) routes until InstantPay merchant biometric
 * status is APPROVED. UI is driven only by biometric-status API via Redux.
 */
export default function MerchantBiometricGate({
  children,
  serviceLabel = "this service",
}: MerchantBiometricGateProps) {
  const dispatch = useDispatch<AppDispatch>();
  const isVerified = useSelector(selectMerchantIsVerified);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const statusLoading = useSelector(selectMerchantStatusLoading);
  const biometricStatus = useSelector(selectMerchantBiometricStatus);
  const action = useSelector(selectMerchantAction);
  const uiPhase = useSelector(selectMerchantUiPhase);
  const dialogOpen = useSelector(selectMerchantModalOpen);

  useEffect(() => {
    if (!statusChecked && !statusLoading) {
      void dispatch(loadMerchantBiometricStatus());
    }
  }, [dispatch, statusChecked, statusLoading]);

  if (!statusChecked || (statusLoading && !statusChecked)) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1565d8]" />
        <p className="text-sm font-medium text-slate-600">
          Checking biometric verification status…
        </p>
      </div>
    );
  }

  if (isVerified || uiPhase === "approved") {
    return <>{children}</>;
  }

  const refreshStatus = () => {
    void dispatch(loadMerchantBiometricStatus());
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 py-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-semibold">
          {serviceLabel} is locked until biometric KYC is approved.
        </p>
        <p className="mt-1 text-amber-800/90">
          Complete InstantPay merchant biometric eKYC, then wait for approval
          (usually 2–24 hours).
        </p>
      </div>

      {uiPhase === "approval_pending" ? (
        <BiometricApprovalPending
          biometricStatus={biometricStatus}
          refreshing={statusLoading}
          onRefresh={refreshStatus}
        />
      ) : (
        <>
          <BiometricRequiredCard
            biometricStatus={biometricStatus}
            action={action ?? undefined}
            refreshing={statusLoading}
            onCompleteEkyc={() => dispatch(openBiometricModal())}
            onRefresh={refreshStatus}
          />
          <BiometricVerificationDialog
            open={dialogOpen}
            onClose={() => dispatch(closeBiometricModal())}
          />
        </>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/rt/retailer/dashboard">Back to Dashboard</Link>
        </Button>
        {uiPhase !== "approval_pending" ? (
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-[#1565d8] hover:bg-[#0d47a1]"
            onClick={() => dispatch(openBiometricModal())}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            Complete eKYC
          </Button>
        ) : null}
      </div>
    </div>
  );
}
