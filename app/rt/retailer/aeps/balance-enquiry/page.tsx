"use client";

import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsBalanceInlineResult from "@/src/components/aeps/AepsBalanceInlineResult";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import { useAepsBalanceEnquiry } from "@/src/hooks/useAeps";

export default function AepsBalanceEnquiryPage() {
  const enquiry = useAepsBalanceEnquiry();

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Balance Enquiry"
        description="Check customer account balance using Aadhaar authentication"
      />

      <AepsTransactionForm
        title="Balance Enquiry"
        description="Capture fingerprint to fetch account balance"
        submitLabel="Check Balance"
        onSubmit={(payload) => enquiry.mutateAsync(payload)}
        renderInlineSuccess={(result) => <AepsBalanceInlineResult result={result} />}
      />
    </div>
  );
}
