"use client";

import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsMiniStatementInlineResult from "@/src/components/aeps/AepsMiniStatementInlineResult";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import { useAepsMiniStatement } from "@/src/hooks/useAeps";

export default function AepsMiniStatementPage() {
  const miniStatement = useAepsMiniStatement();

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
        onSubmit={(payload) => miniStatement.mutateAsync(payload)}
        renderInlineSuccess={(result) => (
          <AepsMiniStatementInlineResult result={result} />
        )}
      />
    </div>
  );
}
