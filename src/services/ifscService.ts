import type { IfscDetails } from "@/src/types/ifsc";
import { isValidIfscCode } from "@/src/types/ifsc";
import type { StatementTransaction } from "@/types/statementReceipt";

const IFSC_API_BASE = "https://ifsc.razorpay.com";

export async function fetchIfscDetails(
  ifscCode: string
): Promise<IfscDetails | null> {
  const normalized = ifscCode.trim().toUpperCase();
  if (!isValidIfscCode(normalized)) return null;

  try {
    const response = await fetch(`${IFSC_API_BASE}/${normalized}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as IfscDetails;
    if (!payload?.BANK && !payload?.IFSC) return null;

    return {
      ...payload,
      IFSC: payload.IFSC ?? normalized,
    };
  } catch {
    return null;
  }
}

export function applyIfscDetailsToTransaction(
  txn: StatementTransaction,
  details: IfscDetails | null | undefined
): StatementTransaction {
  if (!details) return txn;

  return {
    ...txn,
    ifscCode: details.IFSC ?? txn.ifscCode,
    bankName: details.BANK || txn.bankName,
    bankBranch: details.BRANCH || txn.bankBranch,
    bankAddress: details.ADDRESS || txn.bankAddress,
    bankCity: details.CITY || txn.bankCity,
    bankState: details.STATE || txn.bankState,
  };
}

export async function enrichStatementWithIfsc(
  txn: StatementTransaction
): Promise<StatementTransaction> {
  if (!txn.ifscCode) return txn;
  const details = await fetchIfscDetails(txn.ifscCode);
  return applyIfscDetailsToTransaction(txn, details);
}
