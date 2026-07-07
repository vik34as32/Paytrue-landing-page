"use client";

import { useCallback, useState } from "react";
import type { FormStatusVariant } from "@/src/components/common/FormStatusAlert";

export interface FormStatus {
  variant: FormStatusVariant;
  message: string;
  title?: string;
}

export function useFormStatus() {
  const [status, setStatus] = useState<FormStatus | null>(null);

  const clearStatus = useCallback(() => setStatus(null), []);

  const showStatus = useCallback(
    (variant: FormStatusVariant, message: string, title?: string) => {
      setStatus({ variant, message, title });
    },
    []
  );

  const showError = useCallback(
    (message: string, title?: string) => showStatus("error", message, title),
    [showStatus]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => showStatus("success", message, title),
    [showStatus]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => showStatus("warning", message, title),
    [showStatus]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => showStatus("info", message, title),
    [showStatus]
  );

  return {
    status,
    clearStatus,
    showStatus,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  };
}
