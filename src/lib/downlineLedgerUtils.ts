import type {
  DownlineLedgerListParams,
  DownlineLedgerSummary,
  DownlineLedgerTransaction,
} from "@/src/types/downlineLedger";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (value == null) continue;
    if (typeof value === "object") continue;
    const text = String(value).trim();
    if (
      text &&
      text !== "—" &&
      text.toLowerCase() !== "null" &&
      text !== "[object Object]"
    ) {
      return text;
    }
  }
  return "";
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (value == null || value === "") continue;
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(num)) return num;
  }
  return 0;
}

/** Walk nested bags commonly used by ledger/DMT APIs. */
function collectNestedBags(
  row: Record<string, unknown>
): Record<string, unknown>[] {
  const metadata = asRecord(row.metadata);
  const walletSummary = asRecord(
    row.walletSummary || metadata.walletSummary || row.wallet
  );
  return [
    row,
    asRecord(row.retailer),
    asRecord(row.beneficiary),
    asRecord(row.payee),
    asRecord(row.bank),
    asRecord(row.remitter),
    asRecord(row.sender),
    asRecord(row.dmtSender),
    asRecord(row.transferDetails),
    asRecord(row.transactionDetails),
    asRecord(row.paymentDetails),
    asRecord(row.extra),
    asRecord(row.extraData),
    metadata,
    walletSummary,
    asRecord(metadata.beneficiary),
    asRecord(metadata.bank),
    asRecord(metadata.payee),
  ].filter((bag) => Object.keys(bag).length > 0);
}

function pickFromBags(
  bags: Record<string, unknown>[],
  keys: string[]
): string {
  for (const bag of bags) {
    for (const key of keys) {
      const value = pickString(bag[key]);
      if (value) return value;
    }
  }
  return "";
}

function pickNumberFromBags(
  bags: Record<string, unknown>[],
  keys: string[]
): number {
  for (const bag of bags) {
    for (const key of keys) {
      const value = pickNumber(bag[key]);
      if (value) return value;
    }
  }
  return 0;
}

export function formatDownlineAmount(value: number): string {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDownlineDateTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDownlineDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDownlineTime(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function serviceTypeLabel(serviceType: string): string {
  const key = String(serviceType || "").toUpperCase().trim();
  if (!key) return "—";
  // Ignore UUID / opaque codes leaking into service column
  if (
    /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(
      key
    )
  ) {
    return "—";
  }
  // Internal service product codes (e.g. SVC003) — not shown on downline ledger
  if (/^SVC\d+$/i.test(key) || key.includes("SVC003")) {
    return "—";
  }
  if (key === "UPI_ATM" || key.includes("UPI")) return "UPI ATM";
  if (key.startsWith("AEPS") || key.includes("AEPS")) {
    if (key.includes("CASH_WITHDRAWAL") || key.includes("WITHDRAW")) {
      return "AEPS Withdrawal";
    }
    if (key.includes("CASH_DEPOSIT") || key.includes("DEPOSIT")) {
      return "AEPS Deposit";
    }
    if (key.includes("BALANCE")) return "AEPS Balance";
    if (key.includes("MINI")) return "AEPS Mini Statement";
    return "AEPS";
  }
  if (key.startsWith("DMT3") || key === "DMT3") return "DMT3";
  if (key.startsWith("DMT2") || key === "DMT2") return "DMT2";
  if (key.startsWith("DMT") || key === "DMT") return "DMT";
  if (key.includes("RECHARGE")) return "Recharge";
  if (key.includes("BBPS")) return "BBPS";
  if (key.includes("WALLET")) return "Wallet";
  if (key.includes("COMMISSION")) return "Commission";
  return key.replace(/_/g, " ");
}

/** Hide internal SVC* product codes (e.g. SVC003) from downline ledger. */
export function isHiddenDownlineServiceRow(raw: unknown): boolean {
  const row =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const fields = [
    row.service,
    row.serviceType,
    row.serviceCode,
    row.serviceName,
    row.description,
    row.narration,
  ]
    .map((v) => String(v || "").toUpperCase())
    .join(" ");

  if (/\bSVC003\b/.test(fields)) return true;
  if (/\bSVC\d{2,}\b/.test(fields) && !/\b(DMT|AEPS|UPI)\b/.test(fields)) {
    return true;
  }

  // Hide AEPS Balance Enquiry rows
  if (
    fields.includes("AEPS_BALANCE_ENQUIRY") ||
    fields.includes("BALANCE_ENQUIRY") ||
    fields.includes("AEPS BALANCE ENQUIRY") ||
    (fields.includes("AEPS") &&
      fields.includes("BALANCE") &&
      fields.includes("ENQUIRY"))
  ) {
    return true;
  }

  // Hide Retailer Commission Credit rows
  if (
    fields.includes("RETAILER COMMISSION CREDIT") ||
    fields.includes("RETAILER_COMMISSION_CREDIT") ||
    (fields.includes("COMMISSION") && fields.includes("CREDIT") && fields.includes("RETAILER"))
  ) {
    return true;
  }

  return false;
}

/** Map UI filter chips to API serviceType values. */
export function resolveServiceTypeParam(
  filter?: string
): string | undefined {
  const key = String(filter || "").toUpperCase();
  if (!key || key === "ALL") return undefined;
  if (key === "UPI_ATM") return "UPI_ATM";
  if (key === "AEPS") return "AEPS";
  if (key === "DMT3") return "DMT3";
  if (key === "DMT2") return "DMT2";
  if (key === "DMT") return "DMT";
  return key;
}

export function buildDownlineLedgerQuery(
  params: DownlineLedgerListParams = {}
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
  };

  const search = params.search?.trim();
  if (search) query.search = search;

  if (params.retailerId) query.retailerId = params.retailerId;

  const serviceType = resolveServiceTypeParam(params.serviceType);
  if (serviceType) {
    // Backend accepts both `service` and `serviceType`
    query.service = serviceType;
    query.serviceType = serviceType;
  }

  const txnType = String(params.transactionType || "").toUpperCase();
  if (txnType === "CREDIT" || txnType === "DEBIT") {
    query.type = txnType;
    query.transactionType = txnType;
  }

  const status = String(params.status || "").toUpperCase();
  if (
    ["SUCCESS", "FAILED", "PENDING", "REVERSED", "REFUNDED"].includes(status)
  ) {
    query.status = status;
  }

  if (params.fromDate) {
    query.fromDate = params.fromDate;
    query.startDate = params.fromDate;
  }
  if (params.toDate) {
    query.toDate = params.toDate;
    query.endDate = params.toDate;
  }

  return query;
}

export function normalizeDownlineLedgerRow(
  raw: unknown,
  index = 0
): DownlineLedgerTransaction {
  const row = asRecord(raw);
  const bags = collectNestedBags(row);
  const retailer = asRecord(row.retailer);

  const serviceType = pickString(
    row.service,
    row.serviceType,
    row.serviceCode,
    row.serviceName
  );
  const serviceLabelRaw = serviceTypeLabel(
    pickString(row.serviceType, row.service, row.serviceCode, row.serviceName)
  );
  const serviceLabel =
    serviceLabelRaw !== "—"
      ? serviceLabelRaw
      : serviceTypeLabel(pickString(row.service, row.serviceName));
  const txnType = pickString(
    row.transactionType,
    row.type,
    row.creditDebit
  ).toUpperCase();

  let ifscCode = pickString(row.ifsc, row.ifscCode)
    .trim()
    .toUpperCase();
  if (!ifscCode) {
    ifscCode = pickFromBags(bags, [
      "ifscCode",
      "ifsc",
      "beneficiaryIfsc",
      "bankIfsc",
    ])
      .trim()
      .toUpperCase();
  }

  let accountNumber = pickString(
    row.accountNumber,
    row.accountMasked,
    row.beneficiaryAccount,
    row.beneficiaryAccountNumber,
    row.accountNo,
    row.accNo
  );
  if (!accountNumber) {
    accountNumber = pickFromBags(bags, [
      "accountNumber",
      "accountMasked",
      "beneficiaryAccount",
      "beneficiaryAccountNumber",
      "accountNo",
      "accNo",
    ]);
  }

  let bankName = pickString(
    typeof row.bank === "string" ? row.bank : "",
    row.bankName
  );
  if (!bankName) {
    bankName = pickFromBags(bags, [
      "bankName",
      "bank",
      "beneficiaryBank",
      "beneficiaryBankName",
      "payerBankName",
    ]);
  }

  const retailerMobile = pickString(
    row.retailerMobile,
    retailer.mobile,
    retailer.phone,
    retailer.phoneNumber
  );

  const retailerName = pickString(
    row.retailerName,
    retailer.name,
    retailer.fullName,
    [retailer.firstName, retailer.lastName].filter(Boolean).join(" ").trim(),
    retailer.firstName,
    "Retailer"
  );

  const retailerCode = pickString(
    row.retailerCode,
    retailer.userCode,
    retailer.retailerCode,
    retailer.code
  );

  // API flat `mobile` is customer/beneficiary (separate from retailerMobile)
  const beneficiaryMobile = pickString(
    row.mobile && String(row.mobile).trim() !== retailerMobile
      ? row.mobile
      : "",
    row.beneficiaryMobile,
    row.customerMobile,
    row.payeeMobile,
    pickFromBags(
      [
        asRecord(row.beneficiary),
        asRecord(row.payee),
        asRecord(asRecord(row.metadata).beneficiary),
      ],
      ["mobile", "phone", "phoneNumber", "beneficiaryMobile", "customerMobile"]
    )
  );

  const beneficiaryName = pickString(
    row.beneficiaryName,
    row.customerName,
    row.accountHolderName,
    row.receiverName,
    pickFromBags(
      [
        asRecord(row.beneficiary),
        asRecord(row.payee),
        asRecord(asRecord(row.metadata).beneficiary),
      ],
      ["name", "fullName", "accountHolderName", "payeeName", "beneficiaryName"]
    )
  );

  const aadhaarMasked = pickString(
    row.aadhaar,
    row.aadhaarMasked,
    row.aadhaarNumber
  );

  if (!accountNumber && aadhaarMasked) {
    accountNumber = aadhaarMasked;
  }

  const narration = pickString(row.narration, row.remarks, row.message, row.remark);
  const description = pickString(
    row.description,
    serviceTypeLabel(serviceType),
    narration
  );

  if (!ifscCode && narration) {
    const ifscMatch = narration.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/i);
    if (ifscMatch) ifscCode = ifscMatch[1].toUpperCase();
  }

  const resolvedBank =
    bankName && bankName.toLowerCase() !== "bank" ? bankName : "";

  return {
    id: pickString(row.id, row.ledgerId, `row_${index}`),
    retailerId: pickString(row.retailerId, retailer.id, retailer.userId),
    retailerName,
    retailerMobile,
    retailerCode,
    transactionId: pickString(
      row.transactionId,
      row.txnId,
      row.clientTxnId,
      row.providerTransactionId,
      row.id
    ),
    referenceId: pickString(
      row.referenceNo,
      row.referenceId,
      row.reference,
      row.apiReference,
      row.utr,
      row.bankRef,
      row.rrn,
      row.bankRRN
    ),
    serviceType,
    serviceLabel: serviceLabel !== "—" ? serviceLabel : serviceTypeLabel(serviceType),
    description,
    transactionType: txnType || "DEBIT",
    transactionAmount: pickNumber(
      row.transferAmount,
      row.transactionAmount,
      row.amount,
      row.txnAmount,
      pickNumberFromBags(bags, ["transferAmount", "transactionAmount", "amount"])
    ),
    chargeAmount: pickNumber(
      row.chargeAmount,
      row.charges,
      row.charge,
      row.deductionAmount
    ),
    gstAmount: pickNumber(row.gstAmount, row.gst),
    commissionAmount: pickNumber(
      row.commissionAmount,
      row.commission,
      row.retailerCommission,
      row.distributorCommission
    ),
    totalDebitAmount: pickNumber(
      row.totalDebitAmount,
      row.totalDebited,
      row.debitAmount,
      row.chargeableAmount
    ),
    creditedAmount: pickNumber(
      row.creditedAmount,
      row.creditAmount,
      row.totalCreditAmount
    ),
    openingBalance: pickNumber(row.openingBalance, row.previousBalance),
    closingBalance: pickNumber(
      row.closingBalance,
      row.updatedBalance,
      row.newBalance
    ),
    status: pickString(row.status).toUpperCase() || "PENDING",
    narration: narration || description,
    createdAt: pickString(
      row.createdAt,
      row.date,
      row.transactedAt,
      row.txnDate
    ),
    bankName: resolvedBank,
    accountNumber,
    ifscCode,
    accountHolderName: beneficiaryName,
    beneficiaryMobile,
    aadhaarMasked,
  };
}

export function normalizeDownlineSummary(
  raw: unknown
): DownlineLedgerSummary | null {
  const row = asRecord(raw);
  if (!Object.keys(row).length) return null;
  return {
    totalTransactions: pickNumber(row.totalTransactions, row.total),
    successfulTransactions: pickNumber(row.successfulTransactions),
    failedTransactions: pickNumber(row.failedTransactions),
    pendingTransactions: pickNumber(row.pendingTransactions),
    totalDebitAmount: pickNumber(row.totalDebitAmount),
    totalCreditAmount: pickNumber(row.totalCreditAmount),
    totalCharges: pickNumber(row.totalCharges),
    totalCommission: pickNumber(row.totalCommission),
  };
}
