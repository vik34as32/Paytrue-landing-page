"use client";

import { useState } from "react";
import AepsPageHeader from "@/src/components/aeps/AepsPageHeader";
import AepsBalanceInlineResult from "@/src/components/aeps/AepsBalanceInlineResult";
import AepsMiniStatementInlineResult from "@/src/components/aeps/AepsMiniStatementInlineResult";
import NsdlReceiptModal from "../components/NsdlReceiptModal";
import NsdlTransactionForm from "../components/NsdlTransactionForm";
import { toAepsDisplayResult } from "../lib/nsdl-aeps-receipt";
import type { NsdlServiceType, NsdlTransaction } from "../types";

interface ServiceConfig {
  title: string;
  description: string;
  formTitle: string;
  formDescription: string;
  submitLabel: string;
  showAmount: boolean;
  view: "receipt" | "balance" | "statement";
}

const SERVICE_CONFIG: Record<NsdlServiceType, ServiceConfig> = {
  CASH_WITHDRAWAL: {
    title: "Cash Withdrawal",
    description: "NSDL AEPS — successful withdrawal credits your wallet",
    formTitle: "Withdraw Cash",
    formDescription: "Customer Aadhaar, bank and fingerprint are required",
    submitLabel: "Withdraw",
    showAmount: true,
    view: "receipt",
  },
  BALANCE_ENQUIRY: {
    title: "Balance Enquiry",
    description: "NSDL AEPS — check customer account balance using Aadhaar authentication",
    formTitle: "Balance Enquiry",
    formDescription: "Capture fingerprint to fetch account balance",
    submitLabel: "Check Balance",
    showAmount: false,
    view: "balance",
  },
  MINI_STATEMENT: {
    title: "Mini Statement",
    description: "NSDL AEPS — view recent transactions using Aadhaar authentication",
    formTitle: "Mini Statement",
    formDescription: "Capture fingerprint to fetch mini statement",
    submitLabel: "Get Statement",
    showAmount: false,
    view: "statement",
  },
  CASH_DEPOSIT: {
    title: "Cash Deposit",
    description: "NSDL AEPS — deposit amount and charges are debited from your wallet",
    formTitle: "Deposit Cash",
    formDescription: "Customer Aadhaar, bank and fingerprint are required",
    submitLabel: "Deposit",
    showAmount: true,
    view: "receipt",
  },
  AADHAAR_PE: {
    title: "Aadhaar Pay",
    description: "NSDL AEPS — collect payment from customer's Aadhaar-linked account",
    formTitle: "Aadhaar Pay",
    formDescription: "Customer Aadhaar, bank and fingerprint are required",
    submitLabel: "Collect Payment",
    showAmount: true,
    view: "receipt",
  },
};

export default function NsdlServicePage({ serviceType }: { serviceType: NsdlServiceType }) {
  const config = SERVICE_CONFIG[serviceType];
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<NsdlTransaction | null>(null);

  const renderInline =
    config.view === "balance"
      ? (txn: NsdlTransaction) => <AepsBalanceInlineResult result={toAepsDisplayResult(txn)} />
      : config.view === "statement"
        ? (txn: NsdlTransaction) => (
            <AepsMiniStatementInlineResult result={toAepsDisplayResult(txn)} />
          )
        : undefined;

  return (
    <div className="space-y-6">
      <AepsPageHeader title={config.title} description={config.description} />

      <NsdlTransactionForm
        serviceType={serviceType}
        title={config.formTitle}
        description={config.formDescription}
        showAmount={config.showAmount}
        submitLabel={config.submitLabel}
        renderInlineSuccess={renderInline}
        onResult={(txn) => {
          if (config.view !== "receipt") return;
          setReceipt(txn);
          setReceiptOpen(true);
        }}
      />

      {config.view === "receipt" ? (
        <NsdlReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} transaction={receipt} />
      ) : null}
    </div>
  );
}
