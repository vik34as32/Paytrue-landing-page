"use client";

import { useMemo } from "react";
import CustomerReceiptModal from "@/src/components/receipt/CustomerReceiptModal";
import { nsdlServiceLabel } from "../lib/nsdl-aeps-normalizers";
import { mapNsdlToStatement } from "../lib/nsdl-aeps-receipt";
import type { NsdlTransaction } from "../types";

interface NsdlReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: NsdlTransaction | null;
}

export default function NsdlReceiptModal({ open, onOpenChange, transaction }: NsdlReceiptModalProps) {
  const statement = useMemo(() => mapNsdlToStatement(transaction), [transaction]);
  const label = transaction ? nsdlServiceLabel(String(transaction.serviceType)) : "Transaction";
  const suffix =
    transaction?.status === "SUCCESS"
      ? "Successful"
      : transaction?.status === "PENDING"
        ? "Pending"
        : "Receipt";

  return (
    <CustomerReceiptModal
      open={open}
      onClose={() => onOpenChange(false)}
      transaction={statement}
      title={`NSDL AEPS ${label} ${suffix}`}
    />
  );
}
