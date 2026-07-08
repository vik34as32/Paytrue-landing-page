"use client";

import OtpDialog from "./OtpDialog";

interface DeleteBeneficiaryDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (otp: string) => void;
}

export default function DeleteBeneficiaryDialog({
  open,
  loading = false,
  onClose,
  onSubmit,
}: DeleteBeneficiaryDialogProps) {
  return (
    <OtpDialog
      open={open}
      title="Confirm Beneficiary Deletion"
      description="Enter OTP sent to confirm beneficiary deletion."
      submitting={loading}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}
