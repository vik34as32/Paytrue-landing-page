"use client";

import { useState } from "react";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import AepsReceiptModal from "@/src/components/aeps/AepsReceiptModal";
import {
  useAepsCashWithdrawal,
  useAepsTransactionOtp,
} from "@/src/hooks/useAeps";
import type { AepsTransactionPayload, AepsTransactionResult } from "@/src/types/aeps";

export default function AepsCashWithdrawalPage() {
  const withdraw = useAepsCashWithdrawal();
  const verifyOtp = useAepsTransactionOtp();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [result, setResult] = useState<AepsTransactionResult | null>(null);

  const handleSubmit = async (
    payload: AepsTransactionPayload
  ): Promise<AepsTransactionResult> => {
    if (payload.otp && payload.referenceId) {
      return verifyOtp.mutateAsync({
        referenceId: payload.referenceId,
        otp: payload.otp,
      });
    }
    return withdraw.mutateAsync(payload);
  };

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Cash Withdrawal"
        description="Withdraw cash using Aadhaar authentication via Mantra L1 device"
      />

      <AepsTransactionForm
        title="Withdraw Cash"
        description="OTP is required for amounts above ₹5,000"
        showAmount
        amountRequired
        submitLabel="Withdraw"
        onSubmit={handleSubmit}
        onSuccess={(txn) => {
          setResult(txn);
          setReceiptOpen(true);
        }}
      />

      <AepsReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        result={result}
        serviceLabel="Cash Withdrawal"
      />
    </div>
  );
}
