import { maskAccountNumber } from "@/src/lib/fundRequestUtils";
import { maskAadhaar } from "@/src/lib/aepsUtils";

export interface ProfileMedia {
  profileImage: string | null;
  aadhaarFront: string | null;
  aadhaarBack: string | null;
  panCard: string | null;
  ownerPhoto: string | null;
  passbookImage: string | null;
  cancelledChequeImage: string | null;
}

function pickUrl(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** Map live /auth/profile payload (bankDetails, *Url fields) to UI shape */
export function extractProfileMedia(profile: Record<string, unknown> | null): ProfileMedia {
  const kyc = asRecord(profile?.kyc);
  const bank = asRecord(profile?.bankDetails ?? profile?.bankAccount);

  return {
    profileImage: pickUrl(profile?.profileImage, profile?.profileImageUrl),
    aadhaarFront: pickUrl(
      kyc.aadhaarFrontUrl,
      kyc.aadhaarFrontImage,
      kyc.aadhaarFront
    ),
    aadhaarBack: pickUrl(kyc.aadhaarBackUrl, kyc.aadhaarBackImage, kyc.aadhaarBack),
    panCard: pickUrl(kyc.panCardUrl, kyc.panCardImage, kyc.panCard),
    ownerPhoto: pickUrl(kyc.ownerPhotoUrl, kyc.ownerPhoto),
    passbookImage: pickUrl(bank.passbookImage, bank.passbookImageUrl),
    cancelledChequeImage: pickUrl(bank.cancelledChequeImage, bank.cancelledChequeImageUrl),
  };
}

export function getProfileBank(profile: Record<string, unknown>): Record<string, unknown> {
  return asRecord(profile.bankDetails ?? profile.bankAccount);
}

/** Extract 12-digit Aadhaar from profile API payload for pre-fill */
export function getProfileAadhaarNumber(
  profile: Record<string, unknown> | null | undefined
): string {
  if (!profile) return "";
  const kyc = asRecord(profile.kyc);
  const raw =
    kyc.aadhaarNumber ??
    kyc.aadhaar ??
    profile.aadhaarNumber ??
    profile.aadhaar;
  const digits = String(raw ?? "").replace(/\D/g, "");
  return digits.length === 12 ? digits : "";
}

export function maskPan(value: string | null | undefined): string {
  const pan = String(value || "")
    .trim()
    .toUpperCase();
  if (!pan) return "—";
  if (pan.length <= 4) return pan;
  return `${pan.slice(0, 3)}XX${pan.slice(-3)}`;
}

export function formatProfileStatus(status: unknown): string {
  if (!status) return "—";
  const text = String(status).replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatDateTime(value: unknown): string {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export type StatusBadgeVariant = "success" | "warning" | "secondary" | "default";

export function resolveStatusBadge(status: unknown): {
  label: string;
  variant: StatusBadgeVariant;
} {
  const value = String(status || "").toLowerCase();
  if (["verified", "complete", "completed", "approved", "active", "txn"].includes(value)) {
    return { label: formatProfileStatus(status), variant: "success" };
  }
  if (["pending", "in_progress", "submitted", "action-required", "action_required"].includes(value)) {
    return { label: formatProfileStatus(status), variant: "warning" };
  }
  if (["inactive", "rejected", "failed", "blocked"].includes(value)) {
    return { label: formatProfileStatus(status), variant: "secondary" };
  }
  return { label: formatProfileStatus(status || "—"), variant: "default" };
}

export function maskCardNumber(value: string | null | undefined): string {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length <= 4) return digits || "—";
  return `•••• •••• •••• ${digits.slice(-4)}`;
}

export { maskAadhaar, maskAccountNumber };
