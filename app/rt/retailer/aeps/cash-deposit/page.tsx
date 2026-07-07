"use client";

import { useState } from "react";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsCashDepositForm from "@/src/components/aeps/AepsCashDepositForm";
import AepsReceiptModal from "@/src/components/aeps/AepsReceiptModal";
import { useAepsCashDeposit } from "@/src/hooks/useAeps";
import type { AepsTransactionResult } from "@/src/types/aeps";

export default function AepsCashDepositPage() {
  const deposit = useAepsCashDeposit();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [result, setResult] = useState<AepsTransactionResult | null>(null);

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Cash Deposit"
        description="Verify customer account and deposit cash via AEPS"
      />

      <AepsCashDepositForm
        onSubmit={(payload) => deposit.mutateAsync(payload)}
        onSuccess={(txn) => {
          setResult(txn);
          setReceiptOpen(true);
        }}
      />

      <AepsReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        result={result}
        serviceLabel="Cash Deposit"
      />
    </div>
  );
}
