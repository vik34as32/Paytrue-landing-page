import type {
  DmtBank,
  DmtBeneficiary,
  DmtNextAction,
  DmtSender,
  DmtTransaction,
  DmtWorkflowResponse,
} from "../types";
import { DMT_NEXT_ACTIONS } from "../types";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function unwrapPayload(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  if (root.data && typeof root.data === "object") {
    return asRecord(root.data);
  }
  return root;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value != null && String(value).trim()) return String(value).trim();
  }
  return undefined;
}

/** Extract referenceKey from API payloads (supports nested data.data.referenceKey). */
export function extractReferenceKey(...sources: unknown[]): string | undefined {
  for (const source of sources) {
    const record = asRecord(source);
    const nested = asRecord(record.data);
    const deepNested = asRecord(nested.data);

    const key = pickString(
      record.referenceKey,
      record.reference_key,
      record.requestId,
      record.request_id,
      nested.referenceKey,
      nested.reference_key,
      nested.requestId,
      nested.request_id,
      deepNested.referenceKey,
      deepNested.reference_key,
      deepNested.requestId,
      deepNested.request_id
    );
    if (key) return key;
  }
  return undefined;
}

function normalizeNextAction(raw: unknown): DmtNextAction | null {
  const value = String(raw ?? "")
    .toUpperCase()
    .replace(/-/g, "_")
    .trim();
  if (!value) return null;
  if ((DMT_NEXT_ACTIONS as readonly string[]).includes(value)) {
    return value as DmtNextAction;
  }
  return null;
}

/**
 * Some backend responses don't carry an explicit `nextAction`, but signal the
 * next step through a status `code` (e.g. after OTP verify it returns
 * KYC_REQUIRED which means the sender must complete biometric eKYC).
 */
export function codeToNextAction(raw: unknown): DmtNextAction | null {
  const value = String(raw ?? "")
    .toUpperCase()
    .replace(/-/g, "_")
    .trim();
  if (!value) return null;

  switch (value) {
    case "KYC_REQUIRED":
    case "BIO_AUTH_REQUIRED":
    case "EKYC_REQUIRED":
      return "BIO_AUTH";
    default:
      return null;
  }
}

export function normalizeSender(raw: Record<string, unknown> = {}): DmtSender {
  const firstName = pickString(raw.firstName, raw.first_name) ?? "";
  const lastName = pickString(raw.lastName, raw.last_name) ?? "";
  const name =
    pickString(raw.name, raw.fullName, `${firstName} ${lastName}`.trim()) ?? "Sender";

  return {
    id: pickString(raw.id, raw.senderId, raw._id),
    mobile: pickString(raw.mobile, raw.mobileNumber) ?? "",
    name,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    pincode: pickString(raw.pincode),
    state: pickString(raw.state),
    city: pickString(raw.city),
    address: pickString(raw.address),
    dob: pickString(raw.dob, raw.dateOfBirth),
    verificationStatus: pickString(raw.verificationStatus, raw.kycStatus, raw.status),
    isVerified: Boolean(raw.isVerified ?? raw.verified),
    beneficiaryCount: Number(raw.beneficiaryCount ?? raw.beneficiary_count ?? 0) || 0,
    dailyLimit: Number(raw.dailyLimit ?? 0) || 0,
    monthlyLimit: Number(raw.monthlyLimit ?? 0) || 0,
  };
}

type BeneficiaryAccountKeyFields = Pick<
  DmtBeneficiary,
  "id" | "accountNumber" | "ifscCode" | "isVerified" | "status" | "externalRef"
>;

function isBeneficiaryVerified(beneficiary: BeneficiaryAccountKeyFields): boolean {
  if (beneficiary.isVerified) return true;
  const status = String(beneficiary.status ?? "")
    .trim()
    .toLowerCase();
  return (
    status === "verified" ||
    status === "active" ||
    (status.includes("verify") && !status.includes("unverify"))
  );
}

function beneficiaryAccountKey(beneficiary: BeneficiaryAccountKeyFields): string {
  const account = String(beneficiary.accountNumber ?? "")
    .replace(/\s/g, "")
    .trim();
  const ifsc = String(beneficiary.ifscCode ?? "")
    .trim()
    .toUpperCase();
  return account && ifsc ? `${account}|${ifsc}` : `id:${beneficiary.id}`;
}

/** Hide local UNVERIFIED rows when the same account already exists as VERIFIED. */
export function dedupeBeneficiariesByAccount<T extends BeneficiaryAccountKeyFields>(
  beneficiaries: T[]
): T[] {
  const groups = new Map<string, T[]>();

  for (const beneficiary of beneficiaries) {
    const key = beneficiaryAccountKey(beneficiary);
    const group = groups.get(key) ?? [];
    group.push(beneficiary);
    groups.set(key, group);
  }

  const result: T[] = [];
  for (const group of groups.values()) {
    const verified = group.filter(isBeneficiaryVerified);
    if (verified.length) {
      result.push(verified.find((item) => item.externalRef) ?? verified[0]);
      continue;
    }
    result.push(group[0]);
  }

  return result;
}

export function normalizeBeneficiary(raw: Record<string, unknown> = {}): DmtBeneficiary {
  const metadata = asRecord(raw.metadata);
  const instantPay = asRecord(metadata.instantPay);
  const bankObj = asRecord(raw.bank);
  const ifscCode = (pickString(raw.ifscCode, raw.ifsc) ?? "").toUpperCase();
  const bankName =
    pickString(bankObj.name, bankObj.bankName, raw.bankName) ||
    (ifscCode ? `${ifscCode.slice(0, 4)} Bank` : "Bank");

  return {
    id: pickString(raw.id, raw.beneficiaryId, raw._id) ?? "",
    name: pickString(raw.name, raw.beneficiaryName) ?? "Beneficiary",
    mobile: pickString(raw.mobile, raw.beneficiaryMobileNumber, raw.mobileNumber),
    bankName,
    accountNumber: pickString(raw.accountNumber, raw.accountNo, raw.account) ?? "",
    ifscCode,
    isVerified: Boolean(raw.isVerified ?? raw.verified ?? raw.status === "verified"),
    status: pickString(raw.status, raw.verificationStatus),
    referenceKey: pickString(
      raw.referenceKey,
      metadata.referenceKey,
      instantPay.referenceKey
    ),
    externalRef: pickString(raw.externalRef, instantPay.beneficiaryId),
  };
}

/** Extract beneficiary rows from GET /dmt/beneficiaries (local + provider buckets). */
export function extractDmtBeneficiaryRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  const level1 = unwrapPayload(payload);

  const local = Array.isArray(level1.local)
    ? (level1.local as Record<string, unknown>[])
    : [];
  const provider = Array.isArray(level1.provider)
    ? (level1.provider as Record<string, unknown>[])
    : [];
  if (local.length || provider.length) {
    return [...local, ...provider];
  }

  const level2 = asRecord(level1.data);

  const candidates = [
    level1.beneficiaries,
    level2.beneficiaries,
    level2.data,
    level1.data,
    level1.items,
    level2.items,
    level1.list,
    level2.list,
    root.beneficiaries,
    root.items,
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Record<string, unknown>[];
    }
  }

  return [];
}

export function normalizeBeneficiaryList(payload: unknown): DmtBeneficiary[] {
  const beneficiaries = extractDmtBeneficiaryRows(payload).map(normalizeBeneficiary);
  return dedupeBeneficiariesByAccount(beneficiaries);
}

export function normalizeTransaction(raw: Record<string, unknown> = {}): DmtTransaction {
  return {
    id: pickString(raw.id, raw.transactionId),
    transactionId: pickString(raw.transactionId, raw.id),
    referenceNumber: pickString(raw.referenceNumber, raw.reference, raw.referenceNo),
    reference: pickString(raw.reference, raw.referenceNumber),
    utr: pickString(raw.utr, raw.UTR),
    rrn: pickString(raw.rrn, raw.RRN),
    amount: Number(raw.amount ?? 0) || 0,
    beneficiaryName: pickString(raw.beneficiaryName, raw.beneficiary_name),
    bankName: pickString(raw.bankName),
    accountNumber: pickString(raw.accountNumber),
    transferMode: pickString(raw.transferMode, raw.mode) as DmtTransaction["transferMode"],
    status: pickString(raw.status)?.toLowerCase(),
    message: pickString(raw.message),
    reason: pickString(raw.reason, raw.failureReason),
  };
}

function isFailedTransactionStatus(status?: string): boolean {
  const normalized = String(status ?? "")
    .trim()
    .toLowerCase();
  return ["failed", "failure", "error", "rejected", "cancelled"].includes(normalized);
}

function inferNextActionFromTransfer(
  data: Record<string, unknown>,
  root: Record<string, unknown>,
  explicit: DmtNextAction | null,
  transaction?: DmtTransaction
): DmtNextAction | null {
  if (explicit) return explicit;

  const fromCode = codeToNextAction(root.code ?? data.code);
  if (fromCode) return fromCode;

  const status = String(transaction?.status ?? data.status ?? "").toLowerCase();
  if (isFailedTransactionStatus(status)) return "FAILED";

  const success = Boolean(root.success ?? data.success ?? true);
  const hasTxnRef = Boolean(
    transaction?.referenceNumber ||
      transaction?.transactionId ||
      transaction?.utr ||
      transaction?.rrn ||
      data.utr ||
      data.UTR ||
      data.referenceNumber ||
      data.reference
  );

  if (success && hasTxnRef) return "SUCCESS";

  return null;
}

export function ensureTransferSuccessResponse(
  response: DmtWorkflowResponse,
  context: {
    amount: number;
    transferMode: DmtTransaction["transferMode"];
    remarks?: string;
    beneficiary?: DmtBeneficiary | null;
  }
): DmtWorkflowResponse {
  if (response.nextAction === "FAILED" || response.success === false) {
    return {
      ...response,
      nextAction: "FAILED",
      success: false,
    };
  }

  const apiTxn = response.transaction;
  const beneficiary = context.beneficiary;

  const transaction: DmtTransaction = {
    id: apiTxn?.id ?? apiTxn?.transactionId,
    transactionId:
      apiTxn?.transactionId ?? apiTxn?.id ?? apiTxn?.referenceNumber ?? response.referenceKey,
    referenceNumber:
      apiTxn?.referenceNumber ??
      apiTxn?.reference ??
      response.referenceKey,
    reference: apiTxn?.reference ?? apiTxn?.referenceNumber ?? response.referenceKey,
    utr: apiTxn?.utr ?? apiTxn?.rrn,
    rrn: apiTxn?.rrn ?? apiTxn?.utr,
    amount: apiTxn?.amount && apiTxn.amount > 0 ? apiTxn.amount : context.amount,
    beneficiaryName: apiTxn?.beneficiaryName ?? beneficiary?.name,
    bankName: apiTxn?.bankName ?? beneficiary?.bankName,
    accountNumber: apiTxn?.accountNumber ?? beneficiary?.accountNumber,
    transferMode: apiTxn?.transferMode ?? context.transferMode,
    status: apiTxn?.status ?? "success",
    message: apiTxn?.message ?? response.message ?? context.remarks,
    reason: apiTxn?.reason,
  };

  return {
    ...response,
    success: true,
    nextAction: "SUCCESS",
    transaction,
  };
}

export function normalizeWorkflowResponse(payload: unknown): DmtWorkflowResponse {
  const root = asRecord(payload);
  const data = unwrapPayload(payload);

  const senderRaw =
    asRecord(data.sender) ||
    asRecord(data.remitter) ||
    asRecord(root.sender) ||
    asRecord(root.remitter);

  const beneficiaryRaw = asRecord(data.beneficiary) || asRecord(root.beneficiary);
  const transactionRaw =
    asRecord(data.transaction) || asRecord(root.transaction) || data;

  const nestedData = asRecord(data.data);

  const explicitNextAction = normalizeNextAction(
    data.nextAction ?? data.next_action ?? root.nextAction ?? root.next_action
  );

  const referenceKey = extractReferenceKey(
    data,
    nestedData,
    root,
    senderRaw,
    beneficiaryRaw,
    payload
  );

  const beneficiaries = normalizeBeneficiaryList(
    data.beneficiaries ? { beneficiaries: data.beneficiaries } : payload
  );

  const transaction = Object.keys(transactionRaw).length
    ? normalizeTransaction(transactionRaw)
    : undefined;

  const nextAction = inferNextActionFromTransfer(
    data,
    root,
    explicitNextAction,
    transaction
  );

  return {
    success: Boolean(root.success ?? data.success ?? true),
    nextAction,
    message: pickString(root.message, data.message),
    referenceKey,
    data,
    sender: Object.keys(senderRaw).length ? normalizeSender(senderRaw) : undefined,
    beneficiary: Object.keys(beneficiaryRaw).length
      ? normalizeBeneficiary(beneficiaryRaw)
      : undefined,
    beneficiaries: beneficiaries.length ? beneficiaries : undefined,
    transaction,
  };
}

export function nextActionToStep(action: DmtNextAction | null): number {
  switch (action) {
    case "REGISTER":
      return 1;
    case "VERIFY_OTP":
      return 2;
    case "BIO_AUTH":
      return 3;
    case "ADD_BENEFICIARY":
    case "BENEFICIARY_OTP":
    case "SELECT_BENEFICIARY":
    case "SENDER_PROFILE":
      return 4;
    case "GENERATE_TRANSACTION_OTP":
      return 5;
    case "TRANSFER":
      return 6;
    case "SUCCESS":
    case "FAILED":
      return 7;
    default:
      return 0;
  }
}

/** Extract bank rows from InstantPay /dmt/banks response (supports nested data.data). */
export function extractDmtBankRows(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload);
  const level1 = unwrapPayload(payload);
  const level2 = asRecord(level1.data);

  const candidates = [
    level2.data,
    level1.data,
    level1.banks,
    level1.items,
    level1.bankList,
    root.banks,
    root.items,
    root.data,
    payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as Record<string, unknown>[];
    }
  }

  return [];
}

export function normalizeDmtBankList(payload: unknown): DmtBank[] {
  return extractDmtBankRows(payload).map((item) => {
    const ifscAlias = String(item.ifscAlias ?? item.ifscPrefix ?? "").trim().toUpperCase();
    const ifscGlobal = String(item.ifscGlobal ?? item.ifsc ?? item.ifscCode ?? "").trim();
    const ifscPrefix = ifscAlias || (ifscGlobal ? ifscGlobal.slice(0, 4).toUpperCase() : "");
    const code = String(item.code ?? item.bankCode ?? item.operatorCode ?? "").trim();
    const rawInstantPayId = item.bankId ?? item.instantPayBankId;
    const instantPayBankId =
      rawInstantPayId != null && String(rawInstantPayId).trim()
        ? String(rawInstantPayId).trim()
        : undefined;
    const internalId = item.id != null && isUuid(String(item.id)) ? String(item.id) : undefined;

    return {
      id: instantPayBankId ?? internalId ?? "",
      name: String(item.name ?? item.bankName ?? "Unknown Bank"),
      code: code || undefined,
      ifsc: ifscGlobal || ifscPrefix || undefined,
      ifscPrefix: ifscPrefix || undefined,
      instantPayBankId,
    };
  });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}
