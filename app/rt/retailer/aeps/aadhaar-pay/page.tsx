"use client";

import { useState } from "react";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import AepsReceiptModal from "@/src/components/aeps/AepsReceiptModal";
import {
  useAepsAadhaarPay,
  useAepsTransactionOtp,
} from "@/src/hooks/useAeps";
import type { AepsTransactionPayload, AepsTransactionResult } from "@/src/types/aeps";

export default function AepsAadhaarPayPage() {
  const aadhaarPay = useAepsAadhaarPay();
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
    return aadhaarPay.mutateAsync(payload);
  };

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Aadhaar Pay"
        description="Accept payments using customer Aadhaar authentication"
      />

      <AepsTransactionForm
        title="Aadhaar Pay"
        description="OTP required for amounts above ₹5,000"
        showAmount
        amountRequired
        submitLabel="Collect Payment"
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
        serviceLabel="Aadhaar Pay"
      />
    </div>
  );
}
