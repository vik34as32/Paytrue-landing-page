"use client";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/src/redux/types";
import {
  closeBiometricModal,
  openBiometricModal,
  selectMerchantAction,
  selectMerchantBiometricStatus,
  selectMerchantIsPendingApproval,
  selectMerchantIsVerified,
  selectMerchantModalOpen,
  selectMerchantStatusChecked,
  selectMerchantStatusLoading,
  selectMerchantUiPhase,
} from "@/src/redux/slices/merchantSlice";
import { loadMerchantBiometricStatus } from "@/src/redux/thunks/merchantThunk";
import BiometricRequiredCard from "@/components/biometric/BiometricRequiredCard";
import BiometricApprovalPending from "@/components/biometric/BiometricApprovalPending";
import BiometricApproved from "@/components/biometric/BiometricApproved";
import BiometricVerificationDialog from "@/components/biometric/BiometricVerificationDialog";

/**
 * Dashboard biometric KYC surface — UI phase is derived only from
 * GET/POST /merchant/biometric-status (via Redux), never hardcoded.
 */
export default function BiometricKycDashboardCard() {
  const dispatch = useDispatch<AppDispatch>();
  const isVerified = useSelector(selectMerchantIsVerified);
  const isPendingApproval = useSelector(selectMerchantIsPendingApproval);
  const statusChecked = useSelector(selectMerchantStatusChecked);
  const statusLoading = useSelector(selectMerchantStatusLoading);
  const biometricStatus = useSelector(selectMerchantBiometricStatus);
  const action = useSelector(selectMerchantAction);
  const uiPhase = useSelector(selectMerchantUiPhase);
  const dialogOpen = useSelector(selectMerchantModalOpen);

  if (statusLoading && !statusChecked) return null;

  const openDialog = () => dispatch(openBiometricModal());
  const closeDialog = () => dispatch(closeBiometricModal());
  const refreshStatus = () => {
    void dispatch(loadMerchantBiometricStatus());
  };

  const phase =
    uiPhase === "loading"
      ? isVerified
        ? "approved"
        : isPendingApproval
          ? "approval_pending"
          : "action_required"
      : uiPhase;

  return (
    <>
      {phase === "approved" ? (
        <BiometricApproved
          biometricStatus={biometricStatus}
          refreshing={statusLoading}
          onRefresh={refreshStatus}
        />
      ) : phase === "approval_pending" ? (
        <BiometricApprovalPending
          biometricStatus={biometricStatus}
          refreshing={statusLoading}
          onRefresh={refreshStatus}
        />
      ) : (
        <BiometricRequiredCard
          biometricStatus={biometricStatus}
          action={action ?? undefined}
          refreshing={statusLoading}
          onCompleteEkyc={openDialog}
          onRefresh={refreshStatus}
        />
      )}
      {/* Always mounted so Quick Actions / ServiceCard can open eKYC */}
      <BiometricVerificationDialog open={dialogOpen} onClose={closeDialog} />
    </>
  );
}
