"use client";

import { forwardRef, useMemo } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { buildReceiptViewModel } from "@/src/lib/statementReceiptUtils";
import BankDetailsCard from "@/src/components/statement/receipt/BankDetailsCard";
import ReceiptHeader from "@/src/components/statement/receipt/ReceiptHeader";
import SuccessCard from "@/src/components/statement/receipt/SuccessCard";
import CustomerCard from "@/src/components/statement/receipt/CustomerCard";
import TransactionCard from "@/src/components/statement/receipt/TransactionCard";
import SummaryCard from "@/src/components/statement/receipt/SummaryCard";
import QRCard from "@/src/components/statement/receipt/QRCard";
import ImportantNotice from "@/src/components/statement/receipt/ImportantNotice";
import ReceiptFooter from "@/src/components/statement/receipt/ReceiptFooter";
import type {
  ReceiptCustomerInfo,
  StatementTransaction,
} from "@/types/statementReceipt";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

interface TransactionReceiptProps {
  txn: StatementTransaction;
  customer: ReceiptCustomerInfo;
  className?: string;
}

const TransactionReceipt = forwardRef<HTMLDivElement, TransactionReceiptProps>(
  function TransactionReceipt({ txn, customer, className }, ref) {
    const receipt = useMemo(
      () => buildReceiptViewModel(txn, customer),
      [txn, customer]
    );

    return (
      <div
        ref={ref}
        className={cn(
          inter.className,
          "receipt-print-area w-full overflow-hidden bg-white",
          className
        )}
      >
        <ReceiptHeader receipt={receipt} />

        <div className="space-y-8 px-6 py-8 sm:px-8 lg:px-10">
          <SuccessCard receipt={receipt} />

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start">
            <div className="min-w-0 space-y-8">
              <CustomerCard receipt={receipt} />
              {receipt.showBankDetailsCard ? (
                <BankDetailsCard receipt={receipt} />
              ) : null}
              <TransactionCard receipt={receipt} />
              <SummaryCard receipt={receipt} />
              <ImportantNotice />
            </div>

            <div className="hidden min-w-0 lg:block">
              <QRCard payload={receipt.qrPayload} className="sticky top-4" />
            </div>
          </div>

          <div className="lg:hidden">
            <QRCard payload={receipt.qrPayload} />
          </div>
        </div>

        <ReceiptFooter />
      </div>
    );
  }
);

export default TransactionReceipt;
