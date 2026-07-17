import type { UpiAtmStatus, UpiAtmTransaction } from "@/src/types/upiAtm";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return undefined;
}

function unwrapPayload(payload: unknown): Record<string, unknown> {
  const root = asRecord(payload);
  const nested = asRecord(root.data);
  const deep = asRecord(nested.data);
  return { ...root, ...nested, ...deep };
}

export function normalizeUpiAtmStatus(value: unknown): UpiAtmStatus {
  return String(value || "PENDING").trim().toUpperCase();
}

export function isUpiAtmTerminalStatus(status: UpiAtmStatus): boolean {
  const normalized = normalizeUpiAtmStatus(status);
  return ["SUCCESS", "FAILED", "EXPIRED", "CANCELLED", "REJECTED"].includes(normalized);
}

export function isUpiAtmSuccessStatus(status: UpiAtmStatus): boolean {
  return ["SUCCESS", "COMPLETED", "PAID", "SUCCESSFUL"].includes(
    normalizeUpiAtmStatus(status)
  );
}

export function normalizeUpiAtmTransaction(payload: unknown): UpiAtmTransaction {
  const root = unwrapPayload(payload);
  const txn = asRecord(root.transaction) || root;

  const qrImage = pickString(
    txn.qrImage,
    txn.qrBase64,
    txn.qrCodeImage,
    root.qrImage,
    root.qrBase64
  );

  const qrString = pickString(
    txn.qrString,
    txn.qrCode,
    txn.qrData,
    txn.upiQr,
    txn.qr,
    txn.paymentUrl,
    root.qrString,
    root.qrCode,
    root.qrData,
    root.upiQr
  );

  const expiryDt = pickString(
    txn.expiryDt,
    txn.expiryDate,
    txn.expiresAt,
    txn.qrExpire,
    txn.QRexpire,
    root.expiryDt,
    root.expiryDate,
    root.expiresAt
  );

  const displayExpirySecRaw =
    txn.displayExpirySec ??
    txn.display_expiry_sec ??
    root.displayExpirySec ??
    root.display_expiry_sec;

  const displayExpirySec =
    displayExpirySecRaw !== undefined && displayExpirySecRaw !== null
      ? Number(displayExpirySecRaw)
      : undefined;

  const expiresAtMs = resolveUpiAtmExpiresAtMs({
    expiryDt,
    displayExpirySec: Number.isFinite(displayExpirySec)
      ? displayExpirySec
      : undefined,
    qrString,
  });

  return {
    ...txn,
    id: pickString(txn.id, txn.transactionId, root.id),
    referenceId: pickString(
      txn.referenceId,
      txn.reference_id,
      txn.reference,
      root.referenceId,
      root.reference_id,
      root.reference
    ),
    externalRef: pickString(txn.externalRef, txn.external_ref, root.externalRef),
    mobile: pickString(txn.mobile, txn.customerMobile, root.mobile, root.customerMobile),
    amount: (txn.amount ?? root.amount) as string | number | undefined,
    status: normalizeUpiAtmStatus(txn.status ?? root.status),
    utr: pickString(txn.utr, txn.UTR, root.utr),
    rrn: pickString(txn.rrn, txn.RRN, root.rrn),
    transactionId: pickString(txn.transactionId, txn.txnId, root.transactionId),
    qrString,
    qrImage,
    message: pickString(txn.message, root.message),
    paidAt: pickString(txn.paidAt, txn.completedAt, root.paidAt),
    createdAt: pickString(txn.createdAt, root.createdAt),
    expiryDt,
    displayExpirySec: Number.isFinite(displayExpirySec)
      ? displayExpirySec
      : undefined,
    expiresAtMs,
  };
}

/** Parse API expiry into absolute epoch ms for countdown. */
export function resolveUpiAtmExpiresAtMs(input: {
  expiryDt?: string;
  displayExpirySec?: number;
  qrString?: string;
  nowMs?: number;
}): number | undefined {
  const now = input.nowMs ?? Date.now();

  if (input.expiryDt) {
    const parsed = parseUpiAtmExpiryDate(input.expiryDt);
    if (parsed != null) return parsed;
  }

  const fromQr = extractQrExpireMs(input.qrString);
  if (fromQr != null) return fromQr;

  if (
    input.displayExpirySec != null &&
    Number.isFinite(input.displayExpirySec) &&
    input.displayExpirySec > 0
  ) {
    return now + Math.round(input.displayExpirySec * 1000);
  }

  return undefined;
}

function parseUpiAtmExpiryDate(value: string): number | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  // "2026-07-16 19:01:13" → treat as local time
  const spaceMatch = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/
  );
  if (spaceMatch) {
    const [, y, mo, d, h, mi, s] = spaceMatch;
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s)
    );
    const ms = date.getTime();
    return Number.isNaN(ms) ? null : ms;
  }

  const ms = new Date(raw).getTime();
  return Number.isNaN(ms) ? null : ms;
}

function extractQrExpireMs(qrString?: string): number | null {
  if (!qrString) return null;
  try {
    const match = qrString.match(/QRexpire=([^&]+)/i);
    if (!match?.[1]) return null;
    const decoded = decodeURIComponent(match[1]);
    const ms = new Date(decoded).getTime();
    return Number.isNaN(ms) ? null : ms;
  } catch {
    return null;
  }
}

/** Remaining seconds until expiry (0 when expired). */
export function getUpiAtmRemainingSeconds(
  expiresAtMs?: number,
  nowMs = Date.now()
): number | null {
  if (expiresAtMs == null || !Number.isFinite(expiresAtMs)) return null;
  return Math.max(0, Math.ceil((expiresAtMs - nowMs) / 1000));
}

/** Format seconds as m:ss or "Xm Ys" for display. */
export function formatUpiAtmCountdown(totalSeconds: number): {
  clock: string;
  label: string;
} {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;
  const clock = `${minutes}:${String(seconds).padStart(2, "0")}`;

  if (sec <= 0) {
    return { clock: "0:00", label: "QR expired" };
  }

  if (minutes <= 0) {
    return { clock, label: `Expires in ${seconds} sec` };
  }

  if (seconds === 0) {
    return {
      clock,
      label: `Expires in ${minutes} min`,
    };
  }

  return {
    clock,
    label: `Expires in ${minutes} min ${seconds} sec`,
  };
}

export function resolveUpiAtmQrValue(transaction: UpiAtmTransaction): string {
  if (transaction.qrImage?.startsWith("data:image")) {
    return transaction.qrImage;
  }
  return transaction.qrString || "";
}

export function formatUpiAtmError(error: unknown): string {
  const err = error as {
    message?: string;
    data?: {
      message?: string;
      errors?: Array<{ field?: string; message?: string }>;
    };
  };

  const validationErrors = err?.data?.errors;
  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item) => item.message || item.field)
      .filter(Boolean)
      .join(". ");
  }

  return err?.data?.message || err?.message || "Request failed";
}
