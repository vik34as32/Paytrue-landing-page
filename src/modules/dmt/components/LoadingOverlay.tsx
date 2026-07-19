"use client";

import ProcessLoadingOverlay from "@/src/components/common/ProcessLoadingOverlay";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  detail?: string;
}

export default function LoadingOverlay({
  open,
  message = "Please wait...",
  detail = "Processing on server — do not refresh",
}: LoadingOverlayProps) {
  return (
    <ProcessLoadingOverlay open={open} message={message} detail={detail} />
  );
}
