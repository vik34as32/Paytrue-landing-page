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
