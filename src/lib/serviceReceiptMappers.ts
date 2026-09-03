import { mapAepsToStatement, mapDmtToStatement } from "@/src/lib/statementMappers";
import type { AepsTransactionResult } from "@/src/types/aeps";
import type { StatementTransaction } from "@/types/statementReceipt";
import type { Dmt3Beneficiary, Dmt3Transaction } from "@/src/modules/dmt3/types/dmt3.types";

/** Loose DMT txn shape accepted by receipt mapper (both legacy and module types). */
export interface ReceiptDmtTransactionSource {
  id?: string;
  transactionId?: string;
  referenceNumber?: string;
  reference?: string;
  utr?: string;
  rrn?: string;
  amount: number;
  beneficiaryName?: string;
  bankName?: string;
  accountNumber?: string;
  transferMode?: string;
  status?: string;
  message?: string;
  reason?: string;
}

export type ReceiptDmtBeneficiarySource = {
  name?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  mobile?: string;
};

export function mapDmtTransactionToStatement(
  txn: ReceiptDmtTransactionSource | null | undefined,
  beneficiary?: ReceiptDmtBeneficiarySource | null
): StatementTransaction | null {
  if (!txn) return null;

  return mapDmtToStatement({
    id: txn.id ?? txn.transactionId ?? txn.referenceNumber ?? "",
    reference: txn.referenceNumber ?? txn.reference ?? txn.transactionId ?? "",
    amount: txn.amount,
    status: txn.status ?? "success",
    transferMode: txn.transferMode ?? "IMPS",
    bankRef: txn.utr ?? txn.rrn ?? txn.transactionId ?? "",
    transactionId: txn.transactionId,
    remarks: txn.message ?? txn.reason,
    createdAt: new Date().toISOString(),
    bankName: txn.bankName ?? beneficiary?.bankName,
    beneficiaryAccount: txn.accountNumber ?? beneficiary?.accountNumber,
    ifsc: beneficiary?.ifscCode,
    ifscCode: beneficiary?.ifscCode,
    beneficiary: {
      name: txn.beneficiaryName ?? beneficiary?.name,
      bankName: txn.bankName ?? beneficiary?.bankName,
      accountNumber: txn.accountNumber ?? beneficiary?.accountNumber,
      ifscCode: beneficiary?.ifscCode,
      mobile: beneficiary?.mobile,
    },
  });
}

export function mapAepsResultToStatement(
  result: AepsTransactionResult | null | undefined,
  transactionType: "CASH_WITHDRAWAL" | "CASH_DEPOSIT"
): StatementTransaction | null {
  if (!result) return null;

  const raw = (result.raw ?? {}) as Record<string, unknown>;

  return mapAepsToStatement({
    ...raw,
    transactionType,
    referenceId: result.referenceId,
    txnId: result.transactionId,
    id: result.transactionId || result.referenceId,
    status: result.status,
    message: result.message,
    amount: result.amount,
    bankName: result.bankName,
    accountNumber: result.accountNumber,
    customerName: result.customerName,
    customerMobile: result.mobileNumber,
    aadhaarMasked: result.aadhaarNumber,
    rrn: result.rrn,
    bankRRN: result.rrn,
    ifscCode: result.ifscCode,
    createdAt: new Date().toISOString(),
  });
}

export function mapDmt3TransactionToStatement(
  txn: Dmt3Transaction | null | undefined,
  beneficiary?: Dmt3Beneficiary | null,
  sender?: { name?: string; mobile?: string }
): StatementTransaction | null {
  if (!txn) return null;

  const payee = txn.beneficiary || beneficiary;
  const accountNumber =
    payee?.accountNumber || txn.accountNumber || "";
  const ifscCode = (payee?.ifsc || txn.ifscCode || "").toUpperCase();
  const bankName = payee?.bankName || txn.bankName || "";
  const payeeName =
    txn.payeeName || txn.beneficiaryName || payee?.name || "Beneficiary";
  const payerName = txn.payerName || txn.remitter?.name || sender?.name || "";
  const payerMobile =
    txn.remitter?.mobile || sender?.mobile || payee?.mobile || "";

  return mapDmtToStatement({
    id: txn.id,
    reference: txn.reference || txn.clientTxnId || txn.id,
    amount: txn.amount,
    status: txn.status,
    transferMode: txn.transferMode || "IMPS",
    bankRef: txn.utr || txn.bankRef || "",
    transactionId: txn.clientTxnId || txn.id,
    remarks: txn.remarks || "",
    createdAt: txn.createdAt,
    bankName,
    beneficiaryAccount: accountNumber,
    ifsc: ifscCode,
    ifscCode,
    openingBalance: txn.openingBalance ?? 0,
    closingBalance: txn.closingBalance ?? 0,
    charges: txn.charges ?? 0,
    charge: txn.charges ?? 0,
    commission: txn.commission ?? 0,
    commissionAmount: txn.commission ?? 0,
    senderMobile: payerMobile,
    dmtSender: {
      firstName: payerName,
      mobile: payerMobile,
    },
    metadata: {
      walletSummary: {
        transferAmount: txn.amount,
        amount: txn.amount,
        charge: txn.charges ?? 0,
        charges: txn.charges ?? 0,
        commission: txn.commission ?? 0,
        commissionAmount: txn.commission ?? 0,
        deductionAmount: txn.charges ?? 0,
      },
    },
    beneficiary: {
      name: payeeName,
      bankName,
      accountNumber,
      ifscCode,
      ifsc: ifscCode,
      mobile: payee?.mobile || payerMobile,
    },
  });
}
