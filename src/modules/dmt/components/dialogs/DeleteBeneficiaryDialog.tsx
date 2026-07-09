"use client";

import OtpDialog from "./OtpDialog";

interface DeleteBeneficiaryDialogProps {
  open: boolean;
  loading?: boolean;
  beneficiaryName?: string;
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

export default function DeleteBeneficiaryDialog({
  open,
  loading = false,
  beneficiaryName,
  onClose,
  onSubmit,
}: DeleteBeneficiaryDialogProps) {
  return (
    <OtpDialog
      open={open}
      title="Confirm Beneficiary Deletion"
      description={`Enter OTP sent to delete ${beneficiaryName || "this beneficiary"}.`}
      submitting={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
