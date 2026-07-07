"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsTransactionForm from "@/src/components/aeps/AepsTransactionForm";
import AepsMiniStatementTable from "@/src/components/aeps/AepsMiniStatementTable";
import { useAepsMiniStatement } from "@/src/hooks/useAeps";
import type { AepsTransactionResult } from "@/src/types/aeps";

export default function AepsMiniStatementPage() {
  const miniStatement = useAepsMiniStatement();
  const [statement, setStatement] = useState<AepsTransactionResult | null>(null);

  return (
    <div className="space-y-6">
      <AepsPageHeader
        title="Mini Statement"
        description="View recent transactions using Aadhaar authentication"
      />

      {statement?.miniStatement?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <AepsMiniStatementTable rows={statement.miniStatement} />
          </CardContent>
        </Card>
      ) : null}

      <AepsTransactionForm
        title="Mini Statement"
        description="Capture fingerprint to fetch mini statement"
        submitLabel="Get Statement"
        onSubmit={(payload) => miniStatement.mutateAsync(payload)}
        onSuccess={setStatement}
      />
    </div>
  );
}
