"use client";

import { useMemo } from "react";
import CustomerReceiptModal from "@/src/components/receipt/CustomerReceiptModal";
import { mapAepsResultToStatement } from "@/src/lib/serviceReceiptMappers";
import type { AepsTransactionResult } from "@/src/types/aeps";

interface AepsReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AepsTransactionResult | null;
  serviceLabel: string;
}

function resolveAepsTransactionType(
  serviceLabel: string
): "CASH_WITHDRAWAL" | "CASH_DEPOSIT" {
  return serviceLabel.toLowerCase().includes("deposit")
    ? "CASH_DEPOSIT"
    : "CASH_WITHDRAWAL";
}

export default function AepsReceiptModal({
  open,
  onOpenChange,
  result,
  serviceLabel,
}: AepsReceiptModalProps) {
  const transaction = useMemo(
    () => mapAepsResultToStatement(result, resolveAepsTransactionType(serviceLabel)),
    [result, serviceLabel]
  );

  const title =
    serviceLabel === "Cash Deposit"
      ? "Cash Deposit Successful"
      : "Cash Withdrawal Successful";

  return (
    <CustomerReceiptModal
      open={open}
      onClose={() => onOpenChange(false)}
      transaction={transaction}
      title={title}
    />
  );
}
