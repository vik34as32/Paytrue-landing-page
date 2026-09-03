import { getCurrentLocation } from "@/src/lib/rdService";

const FALLBACK = {
  latitude: "20.5936",
  longitude: "78.9628",
};

/** DMT3-only location helper — does not modify shared location utilities. */
export async function resolveDmt3Location(): Promise<{
  latitude: string;
  longitude: string;
}> {
  try {
    return await getCurrentLocation();
  } catch {
    return FALLBACK;
  }
}

export function maskAccountNumber(accountNumber: string): string {
  const digits = String(accountNumber || "").replace(/\s/g, "");
  if (digits.length <= 4) return digits;
  return `${"•".repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
}

export function formatDmt3Inr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function createClientTxnId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `dmt3_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function formatDmt3Date(value?: string): string {
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

export function isPendingLikeStatus(status: string): boolean {
  return ["PENDING", "PROCESSING"].includes(status.toUpperCase());
}

export function sanitizeMobile(value: string): string {
  return String(value || "").replace(/\D/g, "").slice(-10);
}
