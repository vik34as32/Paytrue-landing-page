import type {
  BiometricStatusValue,
  MerchantBiometricUiPhase,
  MerchantReferenceDetails,
  MerchantStatusResult,
  SubmitBiometricKycResult,
} from "@/src/types/merchant";

const VERIFIED_STATUSES = new Set([
  "verified",
  "success",
  "completed",
  "done",
  "approved",
]);

const ACTION_REQUIRED_ACTIONS = new Set([
  "ACTION-REQUIRED",
  "ACTION_REQUIRED",
  "REQUIRED",
]);

const REFERENCE_KEY_ALIASES = [
  "referenceKey",
  "reference_key",
  "refKey",
  "ref_key",
];

const REFERENCE_TYPE_ALIASES = [
  "referenceKeyType",
  "reference_key_type",
  "refKeyType",
  "ref_key_type",
];

const SP_KEY_ALIASES = [
  "spKey",
  "spkey",
  "sp_key",
  "SPKEY",
  "serviceProviderKey",
  "service_provider_key",
  "instantPaySpKey",
  "instantpay_sp_key",
  "registrationKey",
  "providerKey",
];

const OUTLET_ID_ALIASES = [
  "outletId",
  "outlet_id",
  "externalOutletId",
  "instantPayOutletId",
  "merchantOutletId",
];

function unwrapMerchantData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/** InstantPay wraps outlet KYC fields in data.data */
function extractInstantPayKycPayload(
  payload: unknown
): Record<string, unknown> {
  const top =
    unwrapMerchantData<Record<string, unknown>>(payload) ??
    (payload as Record<string, unknown>) ??
    {};

  const level1 = top.data as Record<string, unknown> | undefined;
  if (level1 && typeof level1 === "object") {
    const level2 = level1.data as Record<string, unknown> | undefined;
    if (level2 && typeof level2 === "object" && !Array.isArray(level2)) {
      return level2;
    }
    return level1;
  }

  return top;
}

function pickString(
  source: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (value != null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return undefined;
}

function deepFindString(
  source: unknown,
  keys: string[],
  depth = 0
): string | undefined {
  if (!source || depth > 8) return undefined;

  if (typeof source === "object") {
    const record = source as Record<string, unknown>;
    const direct = pickString(record, keys);
    if (direct) return direct;

    for (const value of Object.values(record)) {
      if (value && typeof value === "object") {
        const found = deepFindString(value, keys, depth + 1);
        if (found) return found;
      }
    }
  }

  return undefined;
}

export function appendProviderSpKeyFields(
  body: Record<string, unknown>,
  spKey?: string
): void {
  const value = spKey?.trim();
  if (!value) return;
  body.spKey = value;
  body.spkey = value;
}

export function buildMerchantStatusRequest(
  ...sources: unknown[]
): {
  retailerId?: string;
  outletId?: string;
  spKey?: string;
} {
  const refs = extractMerchantReferenceDetails(...sources);
  return {
    retailerId: resolveAuthRetailerId(...sources) || refs.retailerId,
    outletId: refs.outletId,
    spKey: refs.spKey,
  };
}

function readInnerBiometricStatus(inner: Record<string, unknown>): string {
  const status = pickString(inner, [
    "status",
    "biometricStatus",
    "biometricKycStatus",
  ]);
  return status ? status.toUpperCase() : "";
}

function readInnerAction(inner: Record<string, unknown>): string {
  const action = pickString(inner, ["action", "nextAction", "next_action"]);
  return action ? action.toUpperCase().replace(/_/g, "-") : "";
}

function normalizeStatusToken(status: string): string {
  return status.trim().toLowerCase().replace(/[\s_-]+/g, " ");
}

/**
 * True when InstantPay still requires biometric capture.
 * Example: status=PENDING + action=ACTION-REQUIRED
 */
export function isBiometricActionRequired(
  status: string,
  action: string
): boolean {
  const actionToken = action.toUpperCase().replace(/_/g, "-");
  if (ACTION_REQUIRED_ACTIONS.has(actionToken)) {
    return true;
  }

  const statusToken = normalizeStatusToken(status);
  if (
    statusToken === "action required" ||
    statusToken === "not started" ||
    statusToken === "notstarted"
  ) {
    return true;
  }

  // Bare PENDING (without approval wording) still means capture is required
  return statusToken === "pending";
}

/**
 * True when biometric was submitted and InstantPay/PayTrue approval is pending.
 * Never true when action is still ACTION-REQUIRED.
 */
export function isApprovalPendingStatus(
  status: string,
  action = ""
): boolean {
  if (isBiometricActionRequired(status, action)) {
    return false;
  }

  const normalized = normalizeStatusToken(status);
  return (
    normalized === "approval pending" ||
    normalized.includes("approval pending") ||
    normalized.includes("pending approval") ||
    normalized === "submitted" ||
    normalized === "under review" ||
    normalized === "review" ||
    normalized === "processing"
  );
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const AUTH_RETAILER_UUID_KEYS = [
  "id",
  "_id",
  "retailerId",
  "retailer_id",
  "userId",
  "user_id",
];

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

function pickAuthRetailerUuid(
  record: Record<string, unknown>
): string | undefined {
  for (const key of AUTH_RETAILER_UUID_KEYS) {
    const value = pickString(record, [key]);
    if (value && isUuid(value)) return value;
  }
  return undefined;
}

function resolveReferenceRecord(source: unknown): Record<string, unknown> {
  if (!source || typeof source !== "object") return {};

  const obj = source as Record<string, unknown>;

  if ("inner" in obj && obj.inner && typeof obj.inner === "object") {
    return obj.inner as Record<string, unknown>;
  }

  if (
    "referenceKey" in obj ||
    "referenceKeyType" in obj ||
    "outletId" in obj ||
    "pidOptionWadh" in obj
  ) {
    return obj;
  }

  return extractInstantPayKycPayload(source);
}

/** Logged-in retailer UUID — never display codes (PTRT...) or InstantPay outletId */
export function resolveAuthRetailerId(...sources: unknown[]): string {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    const record = source as Record<string, unknown>;
    const direct = pickAuthRetailerUuid(record);
    if (direct) return direct;

    const outlet = record.outlet;
    if (outlet && typeof outlet === "object") {
      const fromOutlet = pickAuthRetailerUuid(
        outlet as Record<string, unknown>
      );
      if (fromOutlet) return fromOutlet;
    }
  }

  return "";
}

export function extractMerchantReferenceDetails(
  ...sources: unknown[]
): MerchantReferenceDetails {
  const merged: MerchantReferenceDetails = {};

  for (const source of sources) {
    if (!source) continue;

    const raw = resolveReferenceRecord(source);

    if (!merged.referenceKey) {
      merged.referenceKey = pickString(raw, REFERENCE_KEY_ALIASES);
    }
    if (!merged.referenceKeyType) {
      merged.referenceKeyType = pickString(raw, REFERENCE_TYPE_ALIASES);
    }
    if (!merged.spKey) {
      merged.spKey =
        pickString(raw, SP_KEY_ALIASES) ??
        deepFindString(source, SP_KEY_ALIASES);
    }
    if (!merged.outletId) {
      merged.outletId =
        pickString(raw, OUTLET_ID_ALIASES) ??
        deepFindString(source, OUTLET_ID_ALIASES);
    }
    if (!merged.pidOptionWadh) {
      merged.pidOptionWadh = pickString(raw, [
        "pidOptionWadh",
        "pid_option_wadh",
        "wadh",
      ]);
    }
  }

  return merged;
}

export function isBiometricVerified(raw: unknown): boolean {
  const inner = extractInstantPayKycPayload(raw);
  const action = readInnerAction(inner);
  const status = readInnerBiometricStatus(inner);

  if (isBiometricActionRequired(status, action)) {
    return false;
  }

  if (
    inner.isVerified === true ||
    inner.biometricKycComplete === true ||
    inner.isBiometricKycDone === true
  ) {
    return true;
  }

  const statusToken = normalizeStatusToken(status);
  return VERIFIED_STATUSES.has(statusToken);
}

/** Derive dashboard / gate UI phase strictly from normalized status fields. */
export function deriveMerchantBiometricUiPhase(
  result: Pick<
    MerchantStatusResult,
    | "isVerified"
    | "isPendingApproval"
    | "actionRequired"
    | "biometricStatus"
    | "action"
  >
): MerchantBiometricUiPhase {
  if (result.isVerified) return "approved";
  if (result.isPendingApproval) return "approval_pending";
  if (
    result.actionRequired ||
    isBiometricActionRequired(result.biometricStatus, result.action ?? "")
  ) {
    return "action_required";
  }
  return "action_required";
}

export function normalizeMerchantStatus(payload: unknown): MerchantStatusResult {
  const top =
    unwrapMerchantData<Record<string, unknown>>(payload) ??
    (payload as Record<string, unknown>) ??
    {};
  const inner = extractInstantPayKycPayload(payload);
  const refs = extractMerchantReferenceDetails(payload, inner, top);

  const innerStatus = readInnerBiometricStatus(inner);
  const action = readInnerAction(inner);
  const actionRequired = isBiometricActionRequired(innerStatus, action);
  const isVerified = isBiometricVerified(payload);
  const isPendingApproval =
    !isVerified &&
    !actionRequired &&
    isApprovalPendingStatus(innerStatus, action);

  let biometricStatus: BiometricStatusValue;
  if (isVerified) {
    biometricStatus = "APPROVED";
  } else if (isPendingApproval) {
    biometricStatus = "APPROVAL_PENDING";
  } else {
    biometricStatus = innerStatus || "PENDING";
  }

  const result: MerchantStatusResult = {
    biometricStatus,
    action: action || undefined,
    actionRequired,
    isVerified,
    isPending: !isVerified,
    isPendingApproval,
    outletId: refs.outletId,
    referenceKey: refs.referenceKey,
    referenceKeyType: refs.referenceKeyType,
    spKey: refs.spKey,
    pidOptionWadh: refs.pidOptionWadh,
    message:
      pickString(inner, ["status", "message", "responseMessage"]) ??
      (top.message ? String(top.message) : undefined),
    raw: { top, inner },
  };

  result.uiPhase = deriveMerchantBiometricUiPhase(result);
  return result;
}

export function normalizeBiometricKycSubmit(
  payload: unknown
): SubmitBiometricKycResult {
  const inner = extractInstantPayKycPayload(payload);
  const top =
    unwrapMerchantData<Record<string, unknown>>(payload) ??
    (payload as Record<string, unknown>) ??
    {};

  const apiSuccess = top.success === true;
  const innerStatus = readInnerBiometricStatus(inner);
  const action = readInnerAction(inner);
  const actionRequired = isBiometricActionRequired(innerStatus, action);
  const isVerified = isBiometricVerified(payload);

  const isPendingApproval =
    !isVerified &&
    !actionRequired &&
    (apiSuccess || isApprovalPendingStatus(innerStatus, action));

  const biometricStatus: BiometricStatusValue = isVerified
    ? "APPROVED"
    : isPendingApproval
      ? "APPROVAL_PENDING"
      : innerStatus || "PENDING";

  return {
    success: apiSuccess || isVerified || isPendingApproval,
    isVerified,
    isPendingApproval,
    message: String(top.message ?? "Biometric verification submitted."),
    biometricStatus,
    action: action || undefined,
    raw: { top, inner },
  };
}

function formatProviderSpKeyError(message: string): string | null {
  const lower = message.toLowerCase();
  if (!lower.includes("spkey")) return null;
  return "Mini KYC is incomplete. Please contact admin to complete outlet registration, then try biometric verification again.";
}

export function mapMerchantError(error: unknown): Error {
  if (error && typeof error === "object") {
    const err = error as {
      message?: string;
      data?: {
        message?: string;
        providerError?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    };

    const providerHint = err.data?.providerError
      ? formatProviderSpKeyError(String(err.data.providerError))
      : null;
    if (providerHint) return new Error(providerHint);

    const validationErrors = err.data?.errors;
    if (Array.isArray(validationErrors) && validationErrors.length > 0) {
      const retailerIdError = validationErrors.find(
        (item) => item.field === "retailerId"
      );
      if (retailerIdError) {
        return new Error(
          "Invalid retailer session. Please logout and login again, then retry biometric verification."
        );
      }

      const details = validationErrors
        .map((item) =>
          item.field
            ? `${item.field}: ${item.message || "invalid"}`
            : item.message
        )
        .filter(Boolean)
        .join("; ");
      const spKeyHint = details ? formatProviderSpKeyError(details) : null;
      if (spKeyHint) return new Error(spKeyHint);
      return new Error(
        details || err.data?.message || err.message || "Validation failed."
      );
    }

    const combined = [err.data?.message, err.message]
      .filter(Boolean)
      .join(" ");
    const spKeyHint = formatProviderSpKeyError(combined);
    if (spKeyHint) return new Error(spKeyHint);

    return new Error(
      err.data?.message ||
        err.message ||
        "Merchant request failed. Please try again."
    );
  }

  return new Error("Merchant request failed. Please try again.");
}

export function formatMissingReferenceError(
  refs: MerchantReferenceDetails
): string {
  const missing: string[] = [];
  if (!refs.referenceKey) missing.push("referenceKey");
  if (!refs.referenceKeyType) missing.push("referenceKeyType");

  if (missing.length === 0) return "";

  return `Merchant reference details missing (${missing.join(", ")}). Refresh biometric status and try again.`;
}

export function hasRequiredBiometricReferences(
  refs: MerchantReferenceDetails
): boolean {
  return Boolean(refs.referenceKey?.trim() && refs.referenceKeyType?.trim());
}

/** Paths that require InstantPay merchant biometric APPROVED status. */
export function isBiometricProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/rt/retailer/aeps") ||
    pathname.startsWith("/rt/retailer/dmt")
  );
}
