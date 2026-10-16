import { mapAepsToStatement } from "@/src/lib/statementMappers";
import type { AepsTransactionResult } from "@/src/types/aeps";
import type { StatementTransaction } from "@/types/statementReceipt";
import type { NsdlTransaction } from "../types";
import { nsdlServiceLabel } from "./nsdl-aeps-normalizers";

const RECEIPT_TYPE: Record<string, string> = {
  CASH_WITHDRAWAL: "CASH_WITHDRAWAL",
  CASH_DEPOSIT: "CASH_DEPOSIT",
  AADHAAR_PE: "AADHAAR_PAY",
  BALANCE_ENQUIRY: "BALANCE_ENQUIRY",
  MINI_STATEMENT: "MINI_STATEMENT",
};

export function mapNsdlToStatement(txn: NsdlTransaction | null): StatementTransaction | null {
  if (!txn) return null;
  const transactionType = RECEIPT_TYPE[String(txn.serviceType)] ?? "CASH_WITHDRAWAL";
  const mapped = mapAepsToStatement({
    id: txn.id || txn.transactionId,
    referenceId: txn.transactionId,
    txnId: txn.providerTransactionId || txn.transactionId,
    transactionType,
    status: txn.status,
    amount: txn.amount,
    withdrawalAmount: transactionType === "CASH_DEPOSIT" ? undefined : txn.amount,
    transferAmount: transactionType === "CASH_DEPOSIT" ? txn.amount : undefined,
    charges: txn.charges,
    commission: txn.commission,
    openingBalance: txn.openingBalance,
    closingBalance: txn.closingBalance,
    bankName: txn.bankName,
    customerMobile: txn.mobile,
    aadhaarMasked: txn.aadhaarMasked,
    rrn: txn.bankReference,
    message: txn.message,
    createdAt: txn.completedAt || txn.createdAt,
  });
  return {
    ...mapped,
    service: "NSDL AEPS",
    description: `NSDL AEPS · ${nsdlServiceLabel(String(txn.serviceType))}${
      txn.bankName ? ` · ${txn.bankName}` : ""
    }`,
  };
}

/** Shape expected by the shared AEPS balance / mini-statement display cards. */
export function toAepsDisplayResult(txn: NsdlTransaction): AepsTransactionResult {
  return {
    referenceId: txn.transactionId,
    transactionId: txn.providerTransactionId || txn.transactionId,
    status: txn.status.toLowerCase(),
    message: txn.message,
    amount: txn.amount,
    balance: txn.bankAccountBalance,
    bankAccountBalance: txn.bankAccountBalance,
    bankName: txn.bankName,
    aadhaarNumber: txn.aadhaarMasked,
    mobileNumber: txn.mobile,
    rrn: txn.bankReference || undefined,
    miniStatement: txn.miniStatement,
  };
}
