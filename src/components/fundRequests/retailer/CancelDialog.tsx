"use client";

import ConfirmationModal from "@/src/components/common/ConfirmationModal";
import type { FundRequest } from "@/src/types/fundRequest";
import { formatCurrency } from "@/lib/utils";

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: FundRequest | null;
  onConfirm: () => void;
  loading?: boolean;
}

export default function CancelDialog({
  open,
  onOpenChange,
  request,
  onConfirm,
  loading = false,
}: CancelDialogProps) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Fund Request"
      message={
        request
          ? `Are you sure you want to cancel request ${request.requestId} for ${formatCurrency(request.amount)}? This action cannot be undone.`
          : "Are you sure you want to cancel this fund request?"
      }
      confirmLabel="Cancel Request"
      cancelLabel="Keep Request"
      onConfirm={onConfirm}
      loading={loading}
      variant="destructive"
    />
  );
}
