import { mapAepsToStatement, mapDmtToStatement } from "@/src/lib/statementMappers";
import type { AepsTransactionResult } from "@/src/types/aeps";
import type { StatementTransaction } from "@/types/statementReceipt";
import type { DmtBeneficiary, DmtTransaction } from "@/src/modules/dmt/types";

export function mapDmtTransactionToStatement(
  txn: DmtTransaction | null | undefined,
  beneficiary?: DmtBeneficiary | null
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
