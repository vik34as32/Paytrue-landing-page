"use client";

import { useCallback } from "react";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsMiniStatementInlineResult from "@/src/components/aeps/AepsMiniStatementInlineResult";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import { useAepsBanks, useAepsMiniStatement } from "@/src/hooks/useAeps";
import type { AepsTransactionPayload, AepsTransactionResult } from "@/src/types/aeps";

export default function AepsMiniStatementPage() {
  const miniStatement = useAepsMiniStatement();
  const { data: banks = [] } = useAepsBanks();

  const handleSubmit = useCallback(
    async (payload: AepsTransactionPayload): Promise<AepsTransactionResult> => {
      const result = await miniStatement.mutateAsync(payload);
      const selectedBank = banks.find((bank) => bank.iin === payload.bankIIN);

      return {
        ...result,
        bankName: result.bankName || selectedBank?.name,
        mobileNumber: result.mobileNumber || payload.mobileNumber,
      };
    },
    [banks, miniStatement]
  );

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Mini Statement"
        description="View recent transactions using Aadhaar authentication"
      />

      <AepsTransactionForm
        title="Mini Statement"
        description="Capture fingerprint to fetch mini statement"
        submitLabel="Get Statement"
        onSubmit={handleSubmit}
        renderInlineSuccess={(result) => (
          <AepsMiniStatementInlineResult result={result} />
        )}
      />
    </div>
  );
}
