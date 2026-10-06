import { mapAepsToStatement, mapDmtToStatement } from "@/src/lib/statementMappers";
import type { AepsTransactionResult } from "@/src/types/aeps";
import type { StatementTransaction } from "@/types/statementReceipt";
import type { Dmt3Beneficiary, Dmt3Transaction } from "@/src/modules/dmt3/types/dmt3.types";
import type { Dmt1Beneficiary, Dmt1Transaction } from "@/src/modules/dmt1/types/dmt1.types";
import type { Dmt2Beneficiary, Dmt2Transaction } from "@/src/modules/dmt2/types";
import { resolveDmt2BankName } from "@/src/modules/dmt2/lib/dmt2-bank";

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

export function mapDmt1TransactionToStatement(
  txn: Dmt1Transaction | null | undefined,
  beneficiary?: Dmt1Beneficiary | null,
  sender?: { name?: string; mobile?: string }
): StatementTransaction | null {
  const mapped = mapDmt3TransactionToStatement(
    txn as unknown as Dmt3Transaction,
    beneficiary as unknown as Dmt3Beneficiary,
    sender
  );
  if (!mapped) return null;
  return {
    ...mapped,
    service: "DMT1",
    description: mapped.description.replace(/^DMT3/, "DMT1").replace(/^DMT ·/, "DMT1 ·"),
    source: "dmt1",
  };
}

const MASKED_ACCOUNT_RE = /[xX*•]/;

/** Xpress DMT (DMT2) → shared receipt shape; prefers the beneficiary's full account number. */
export function mapDmt2TransactionToStatement(
  txn: Dmt2Transaction | null | undefined,
  beneficiary?: Dmt2Beneficiary | null,
  sender?: { name?: string; mobile?: string }
): StatementTransaction | null {
  if (!txn) return null;

  const accountCandidates = [
    txn.accountNumber,
    beneficiary?.accountNumber,
    beneficiary?.accountMasked,
  ].filter((value): value is string => Boolean(value && value.trim()));
  const accountNumber =
    accountCandidates.find((value) => !MASKED_ACCOUNT_RE.test(value)) ||
    accountCandidates[0] ||
    "";
  const ifscCode = (txn.ifsc || beneficiary?.ifsc || "").toUpperCase();
  const bankName = resolveDmt2BankName({
    ifsc: ifscCode,
    bankName: beneficiary?.bankName,
  });
  const payeeName = txn.customerName || beneficiary?.name || "Beneficiary";
  const senderName = sender?.name || "";
  const senderMobile = sender?.mobile || "";
  const amount = Number(txn.amount) || 0;
  const charges =
    txn.totalDebit != null && txn.totalDebit > amount
      ? Number((txn.totalDebit - amount).toFixed(2))
      : (txn.charges ?? 0) + (txn.gst ?? 0);

  const mapped = mapDmtToStatement({
    id: txn.id,
    reference: txn.id,
    amount,
    status: txn.status,
    transferMode: txn.mode || "IMPS",
    bankRef: txn.bankRef || txn.externalRef || txn.apiTxnId || "",
    transactionId: txn.apiTxnId || txn.id,
    remarks: txn.purpose || "",
    createdAt: txn.updatedAt || txn.createdAt,
    bankName,
    beneficiaryAccount: accountNumber,
    ifsc: ifscCode,
    ifscCode,
    charges,
    charge: charges,
    senderMobile,
    dmtSender: { firstName: senderName, mobile: senderMobile },
    metadata: {
      walletSummary: {
        transferAmount: amount,
        amount,
        charge: charges,
        charges,
        deductionAmount: charges,
      },
    },
    beneficiary: {
      name: payeeName,
      bankName,
      accountNumber,
      ifscCode,
      ifsc: ifscCode,
      mobile: txn.customerMobile || beneficiary?.mobile || "",
    },
  });

  return {
    ...mapped,
    service: "Xpress DMT",
    description: `Xpress DMT · ${payeeName} · ${mapped.transferMode || "IMPS"}`,
  };
}
