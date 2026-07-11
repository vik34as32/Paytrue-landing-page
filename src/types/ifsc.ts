export interface IfscDetails {
  MICR?: string;
  BRANCH?: string;
  ADDRESS?: string;
  STATE?: string;
  CONTACT?: string;
  UPI?: boolean;
  RTGS?: boolean;
  CITY?: string;
  CENTRE?: string;
  DISTRICT?: string;
  NEFT?: boolean;
  IMPS?: boolean;
  SWIFT?: string | null;
  ISO3166?: string;
  BANK?: string;
  BANKCODE?: string;
  IFSC?: string;
}

export const IFSC_CODE_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function isValidIfscCode(value?: string | null): value is string {
  if (!value?.trim()) return false;
  return IFSC_CODE_PATTERN.test(value.trim().toUpperCase());
}
