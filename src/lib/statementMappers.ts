import type {
  StatementTransaction,
  TransactionStatus,
  TransactionType,
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

  if (normalized === "expired" || normalized === "timeout") {
    return "expired";
  }

  return "failed";
}

function formatAepsTransactionType(value: string): string {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Pull transfer / deduction / commission from txn + nested walletSummary. */
function extractAmountBreakdown(
  raw: Record<string, unknown>,
  walletSummary: Record<string, unknown>
): {
  amount: number;
  transferAmount: number;
  deductionAmount: number;
  commission: number;
  charges: number;
} {
  const amount = toNumber(raw.amount ?? walletSummary.amount);
  const transferAmount = toNumber(
    walletSummary.transferAmount ??
      walletSummary.txnAmount ??
      raw.transferAmount ??
      raw.txnAmount ??
      amount
  );
  const deductionAmount = toNumber(
    walletSummary.charge ??
      walletSummary.deduction ??
      walletSummary.deductionAmount ??
      walletSummary.deductAmount ??
      raw.chargeAmount ??
      raw.charges ??
      raw.charge ??
      raw.deductionAmount ??
      raw.deduction
  );
  const commission = toNumber(
    walletSummary.commission ??
      walletSummary.commissionAmount ??
      walletSummary.retailerCommission ??
      raw.commission ??
      raw.commissionAmount ??
      raw.retailerCommission
  );

  return {
    amount,
    transferAmount,
    deductionAmount,
    commission,
    charges: deductionAmount,
  };
}

function resolveAepsType(transactionType: string): TransactionType {
  // Cash withdrawal → money in for retailer (Credit)
  // Cash deposit → money out for retailer (Debit)
  if (transactionType === "CASH_WITHDRAWAL") return "credit";
  if (transactionType === "CASH_DEPOSIT") return "debit";
  return "debit";
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
  const {
    amount,
    transferAmount,
    deductionAmount,
    commission,
    charges,
  } = extractAmountBreakdown(raw, walletSummary);

  return {
    id: String(raw.id ?? raw.reference ?? ""),
    referenceNumber: String(
      raw.reference ?? raw.walletReference ?? raw.externalRef ?? raw.id ?? ""
    ),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    service: "DMT",
    description: `DMT · ${beneficiaryName} · ${transferMode}`,
    type: "debit",
    status: normalizeStatus(raw.status),
    amount,
    transferAmount,
    deductionAmount,
    commission,
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
  const payerName = String(payer.name ?? raw.customerName ?? "").trim() || "—";
  const metadata = asRecord(raw.metadata);
  const walletSummary = asRecord(metadata.walletSummary);
  const {
    amount,
    transferAmount,
    deductionAmount,
    commission,
    charges,
  } = extractAmountBreakdown(raw, walletSummary);

  const withdrawalAmount = toNumber(
    raw.withdrawalAmount ?? walletSummary.withdrawalAmount ?? amount
  );
  const creditAmount = toNumber(
    raw.creditAmount ?? raw.creditedAmount ?? raw.netCreditedAmount
  );
  const debitAmount = toNumber(raw.debitAmount ?? raw.totalDebitAmount);
  const openingBalance = toNumber(
    raw.openingBalance ?? walletSummary.openingBalance
  );
  const balanceAfter = toNumber(
    raw.closingBalance ??
      raw.updatedBalance ??
      walletSummary.closingBalance
  );
  const responseMessage = String(
    raw.responseMessage ?? raw.message ?? ""
  ).trim();
  const vpa = String(payer.vpa ?? "").trim();
  const upiTxnId = String(
    raw.txnId ?? raw.providerReference ?? ""
  ).trim();
  const qrImage = String(raw.qrImage ?? "").trim();
  const qrString = String(raw.qrString ?? "").trim();

  return {
    id: String(raw.id ?? raw.referenceId ?? ""),
    referenceNumber: String(
      raw.referenceId ?? raw.externalRef ?? raw.txnId ?? raw.id ?? ""
    ),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    service: "UPI ATM",
    description:
      payerName !== "—"
        ? `UPI ATM · ${payerName}`
        : `UPI ATM cash withdrawal · ${customerMobile || "Customer"}`,
    type: "credit",
    status: normalizeStatus(raw.status),
    amount: withdrawalAmount || amount,
    transferAmount: transferAmount || withdrawalAmount || amount,
    withdrawalAmount,
    deductionAmount,
    commission,
    openingBalance,
    balanceAfter,
    creditAmount,
    debitAmount,
    senderName: payerName,
    receiverName: "UPI ATM",
    mobile: customerMobile,
    remark: responseMessage,
    source: "upi-atm",
    bankReference: String(raw.rrn ?? raw.bankReference ?? upiTxnId ?? ""),
    bankName: String(payer.bankName ?? "").trim(),
    accountNumber: String(payer.accountNumber ?? "").trim(),
    accountHolderName: payerName,
    vpa,
    upiTxnId,
    qrImage: qrImage || undefined,
    qrString: qrString || undefined,
    ifscCode: String(
      payer.ifscCode ?? payer.ifsc ?? raw.ifscCode ?? raw.ifsc ?? ""
    )
      .trim()
      .toUpperCase(),
    charges,
  };
}

export function mapAepsToStatement(raw: Record<string, unknown>): StatementTransaction {
  const transactionType = String(raw.transactionType ?? "AEPS").toUpperCase();
  const label = formatAepsTransactionType(transactionType);
  const bankName = String(raw.bankName ?? "Bank");
  const metadata = asRecord(raw.metadata);
  const walletSummary = asRecord(metadata.walletSummary);

  const amount = toNumber(raw.amount ?? walletSummary.amount);
  const withdrawalAmount = toNumber(
    raw.withdrawalAmount ?? walletSummary.withdrawalAmount
  );
  const transferAmount = toNumber(
    raw.transferAmount ??
      walletSummary.transferAmount ??
      walletSummary.txnAmount ??
      raw.txnAmount
  );

  // Cash Withdrawal → show withdrawalAmount (not transferAmount)
  // Cash Deposit → show transferAmount (not withdrawalAmount)
  const principalAmount =
    transactionType === "CASH_WITHDRAWAL"
      ? withdrawalAmount || amount
      : transactionType === "CASH_DEPOSIT"
        ? transferAmount || amount
        : amount || transferAmount || withdrawalAmount;

  // null / missing charge & commission → 0
  const deductionAmount = toNumber(
    raw.chargeAmount ??
      raw.charges ??
      raw.charge ??
      raw.deductionAmount ??
      raw.deduction ??
      walletSummary.charge ??
      walletSummary.deduction ??
      walletSummary.deductionAmount ??
      walletSummary.deductAmount,
    0
  );
  const commission = toNumber(
    raw.commission ??
      raw.commissionAmount ??
      raw.retailerCommission ??
      walletSummary.commission ??
      walletSummary.commissionAmount ??
      walletSummary.retailerCommission,
    0
  );

  const openingBalance = toNumber(
    raw.openingBalance ?? walletSummary.openingBalance
  );
  const balanceAfter = toNumber(
    raw.closingBalance ??
      raw.updatedBalance ??
      walletSummary.closingBalance
  );

  const creditAmount = toNumber(raw.creditAmount ?? raw.creditedAmount ?? raw.netCreditedAmount);
  const debitAmount = toNumber(raw.debitAmount ?? raw.totalDebitAmount);

  return {
    id: String(raw.id ?? raw.referenceId ?? ""),
    referenceNumber: String(raw.referenceId ?? raw.txnId ?? raw.id ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    service: "AEPS",
    description: `${label} · ${bankName}`,
    type: resolveAepsType(transactionType),
    status: normalizeStatus(raw.status),
    amount: principalAmount,
    transferAmount:
      transactionType === "CASH_DEPOSIT"
        ? transferAmount || amount
        : transferAmount,
    withdrawalAmount:
      transactionType === "CASH_WITHDRAWAL"
        ? withdrawalAmount || amount
        : withdrawalAmount,
    deductionAmount,
    commission,
    openingBalance,
    balanceAfter,
    debitAmount,
    creditAmount,
    senderName: String(raw.customerName ?? "Customer"),
    receiverName: bankName,
    mobile: String(raw.customerMobile ?? ""),
    remark: String(raw.message ?? ""),
    source: "aeps",
    bankReference: String(raw.rrn ?? raw.bankRRN ?? raw.txnId ?? ""),
    bankName: bankName === "Bank" ? "" : bankName,
    accountNumber: String(raw.accountNumber ?? ""),
    aadhaarMasked: String(raw.aadhaarMasked ?? raw.aadhaar ?? ""),
    accountHolderName: String(
      raw.customerName ?? raw.accountHolderName ?? raw.accountHolder ?? "Customer"
    ),
    ifscCode: String(raw.ifscCode ?? raw.ifsc ?? "")
      .trim()
      .toUpperCase(),
    aepsTransactionType: transactionType,
    charges: deductionAmount,
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
