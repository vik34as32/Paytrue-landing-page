"use client";

import { useState } from "react";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import AepsReceiptModal from "@/src/components/aeps/AepsReceiptModal";
import AepsWalletBalanceChip from "@/src/components/aeps/AepsWalletBalanceChip";
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
        description="Successful deposit deducts from your AEPS wallet instantly"
        actions={<AepsWalletBalanceChip />}
      />

      <AepsTransactionForm
        title="Cash Deposit"
        description="Enter customer Aadhaar, mobile, bank and amount — fingerprint captured on submit"
        submitLabel="Deposit"
        showAmount
        amountRequired
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
