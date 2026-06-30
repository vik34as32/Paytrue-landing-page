"use client";

import ConfirmationModal from "@/src/components/common/ConfirmationModal";

export default function RejectModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  title = "Reject Fund Request",
  message = "Are you sure you want to reject this fund request?",
}) {
  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      message={message}
      confirmLabel="Reject"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      loading={loading}
      variant="destructive"
    />
  );
}
