import type {
  StatementTransaction,
  TransactionStatus,
} from "@/types/statementReceipt";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeStatus(status: unknown): TransactionStatus {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();

  if (
    normalized === "success" ||
    normalized === "successful" ||
    normalized === "completed" ||
    normalized === "txn" ||
    normalized === "paid"
  ) {
    return "success";
  }

  if (
    normalized === "pending" ||
    normalized === "processing" ||
    normalized === "initiated"
  ) {
    return "pending";
  }

  return "failed";
}

function formatAepsTransactionType(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mapDmtToStatement(raw: Record<string, unknown>): StatementTransaction {
  const beneficiary = asRecord(raw.beneficiary);
  const dmtSender = asRecord(raw.dmtSender);
  const metadata = asRecord(raw.metadata);
  const walletSummary = asRecord(metadata.walletSummary);

  const senderName =
    [dmtSender.firstName, dmtSender.lastName]
      .filter(Boolean)
      .map(String)
      .join(" ")
      .trim() || String(raw.senderMobile ?? dmtSender.mobile ?? "Sender");

  const beneficiaryName = String(
    beneficiary.name ?? raw.beneficiaryAccount ?? "Beneficiary"
  );
  const transferMode = String(raw.transferMode ?? "IMPS");
  const amount = toNumber(raw.amount);
  const charges = toNumber(walletSummary.charge ?? raw.charges);

  return {
    id: String(raw.id ?? raw.reference ?? ""),
    referenceNumber: String(
      raw.reference ?? raw.walletReference ?? raw.externalRef ?? raw.id ?? ""
    ),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    service: "Money Transfer",
    description: `DMT · ${beneficiaryName} · ${transferMode}`,
    type: "debit",
    status: normalizeStatus(raw.status),
    amount,
    openingBalance: toNumber(raw.openingBalance),
    balanceAfter: toNumber(raw.closingBalance),
    senderName,
    receiverName: beneficiaryName,
    mobile: String(
      raw.senderMobile ?? dmtSender.mobile ?? beneficiary.mobile ?? ""
    ),
    remark: String(raw.remarks ?? raw.providerMessage ?? ""),
    source: "dmt",
    bankReference: String(raw.bankRef ?? raw.transactionId ?? ""),
    transferMode,
    charges,
    bankName: String(raw.bankName ?? beneficiary.bankName ?? ""),
    accountNumber: String(
      raw.beneficiaryAccount ?? beneficiary.accountNumber ?? ""
    ),
    accountHolderName: beneficiaryName,
    ifscCode: String(
      raw.ifsc ?? raw.ifscCode ?? beneficiary.ifscCode ?? beneficiary.ifsc ?? ""
    )
      .trim()
      .toUpperCase(),
  };
}

export function mapUpiAtmToStatement(
  raw: Record<string, unknown>
): StatementTransaction {
  const payer = asRecord(raw.payerDetails);
  const customerMobile = String(raw.customerMobile ?? payer.mobile ?? "");
  const payerName = String(payer.name ?? raw.customerName ?? "Customer");
  const metadata = asRecord(raw.metadata);
  const walletSummary = asRecord(metadata.walletSummary);
  const amount = toNumber(raw.amount);
  const charges = toNumber(walletSummary.charge ?? raw.charges);
  const openingBalance = toNumber(
    raw.openingBalance ?? walletSummary.openingBalance
  );
  const balanceAfter = toNumber(
    raw.closingBalance ?? walletSummary.closingBalance
  );

  return {
    id: String(raw.id ?? raw.referenceId ?? ""),
    referenceNumber: String(
      raw.referenceId ?? raw.externalRef ?? raw.txnId ?? raw.id ?? ""
    ),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    service: "UPI ATM",
    description: `UPI ATM cash withdrawal · ${customerMobile || "Customer"}`,
    type: "debit",
    status: normalizeStatus(raw.status),
    amount,
    openingBalance,
    balanceAfter,
    senderName: payerName,
    receiverName: "UPI ATM",
    mobile: customerMobile,
    remark: String(raw.responseMessage ?? raw.message ?? ""),
    source: "upi-atm",
    bankReference: String(raw.rrn ?? raw.bankReference ?? raw.txnId ?? ""),
    bankName: String(payer.bankName ?? ""),
    accountNumber: String(payer.accountNumber ?? ""),
    accountHolderName: payerName,
    ifscCode: String(
      payer.ifscCode ?? payer.ifsc ?? raw.ifscCode ?? raw.ifsc ?? ""
    )
      .trim()
      .toUpperCase(),
  };
}

export function mapAepsToStatement(raw: Record<string, unknown>): StatementTransaction {
  const transactionType = String(raw.transactionType ?? "AEPS");
  const label = formatAepsTransactionType(transactionType);
  const bankName = String(raw.bankName ?? "Bank");
  const amount = raw.amount == null ? 0 : toNumber(raw.amount);
  const isCashMovement =
    transactionType === "CASH_WITHDRAWAL" ||
    transactionType === "AADHAAR_PAY" ||
    transactionType === "CASH_DEPOSIT";
  const metadata = asRecord(raw.metadata);
  const walletSummary = asRecord(metadata.walletSummary);
  const openingBalance = toNumber(
    raw.openingBalance ?? walletSummary.openingBalance
  );
  const balanceAfter = toNumber(
    raw.closingBalance ?? walletSummary.closingBalance
  );

  return {
    id: String(raw.id ?? raw.referenceId ?? ""),
    referenceNumber: String(raw.referenceId ?? raw.txnId ?? raw.id ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    service: "AEPS",
    description: `${label} · ${bankName}`,
    type: transactionType === "CASH_DEPOSIT" ? "credit" : isCashMovement ? "debit" : "debit",
    status: normalizeStatus(raw.status),
    amount,
    openingBalance,
    balanceAfter,
    senderName: String(raw.customerName ?? "Customer"),
    receiverName: bankName,
    mobile: String(raw.customerMobile ?? ""),
    remark: String(raw.message ?? ""),
    source: "aeps",
    bankReference: String(raw.rrn ?? raw.bankRRN ?? raw.txnId ?? ""),
    bankName: bankName === "Bank" ? "" : bankName,
    accountNumber: String(raw.accountNumber ?? raw.aadhaarMasked ?? ""),
    accountHolderName: String(
      raw.customerName ?? raw.accountHolderName ?? raw.accountHolder ?? "Customer"
    ),
    ifscCode: String(raw.ifscCode ?? raw.ifsc ?? "")
      .trim()
      .toUpperCase(),
    aepsTransactionType: transactionType,
  };
}

export function mergeStatementTransactions(
  rows: StatementTransaction[]
): StatementTransaction[] {
  return [...rows].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}
