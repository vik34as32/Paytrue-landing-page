const DMT_SENDER_MOBILE_KEY = "dmt_active_sender_mobile";

export function setActiveSenderMobile(mobile: string): void {
  if (typeof window === "undefined") return;
  const value = String(mobile || "").replace(/\D/g, "");
  if (value) {
    sessionStorage.setItem(DMT_SENDER_MOBILE_KEY, value);
  }
}

export function getActiveSenderMobile(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(DMT_SENDER_MOBILE_KEY) || "";
}

const DMT_SENDER_REF_KEY = "dmt_sender_reference_key";

export function setSenderReferenceKey(referenceKey: string): void {
  if (typeof window === "undefined") return;
  if (referenceKey) {
    sessionStorage.setItem(DMT_SENDER_REF_KEY, referenceKey);
  }
}

export function getSenderReferenceKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(DMT_SENDER_REF_KEY) || "";
}

export function clearSenderReferenceKey(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DMT_SENDER_REF_KEY);
}

export function getBeneficiaryReferenceKey(beneficiaryId: string): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(`dmt_beneficiary_ref_${beneficiaryId}`) || "";
}

export function setBeneficiaryReferenceKey(
  beneficiaryId: string,
  referenceKey: string
): void {
  if (typeof window === "undefined") return;
  if (referenceKey) {
    sessionStorage.setItem(`dmt_beneficiary_ref_${beneficiaryId}`, referenceKey);
  }
}

export function getTransactionReferenceKey(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem("dmt_transaction_reference_key") || "";
}

export function setTransactionReferenceKey(referenceKey: string): void {
  if (typeof window === "undefined") return;
  if (referenceKey) {
    sessionStorage.setItem("dmt_transaction_reference_key", referenceKey);
  }
}

export function resolveSenderMobile(preferred?: string): string {
  const fromArg = String(preferred || "").replace(/\D/g, "");
  if (fromArg) return fromArg;
  return getActiveSenderMobile();
}

/** Remove all DMT session keys on logout */
export function clearDmtSessionStorage(): void {
  if (typeof window === "undefined") return;

  const keysToRemove: string[] = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (
      key &&
      (key.startsWith("dmt_") || key === "dmt-api-logs")
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  sessionStorage.removeItem(DMT_SENDER_MOBILE_KEY);
  sessionStorage.removeItem(DMT_SENDER_REF_KEY);
  sessionStorage.removeItem("dmt_transaction_reference_key");
}
