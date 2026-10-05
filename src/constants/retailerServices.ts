/**
 * Canonical child service display names from GET /retailer/services.
 * Resolve IDs dynamically — do not hardcode UUIDs.
 */
export const RETAILER_SERVICE_NAMES = {
  DMT_IMPS: "Money Transfer (IMPS)",
  DMT_NEFT: "Money Transfer (NEFT)",
  /** Catalog parent "dmt 3" — serviceCode 104 */
  DMT3: "dmt 3",
  /** InstantPay DMT1 remittance */
  DMT1: "dmt 1",
  AEPS_CASH_WITHDRAWAL: "Cash Withdrawal",
  AEPS_BALANCE_ENQUIRY: "Balance Enquiry",
  AEPS_MINI_STATEMENT: "Mini Statement",
  AEPS_AADHAAR_PAY: "Aadhaar Pay",
  AEPS_CASH_DEPOSIT: "Cash Deposit",
  UPI_CASH_POINT: "UPI Cash Point",
} as const;

export type RetailerServiceName =
  (typeof RETAILER_SERVICE_NAMES)[keyof typeof RETAILER_SERVICE_NAMES];

/** Fallback aliases for UPI ATM / Cash Point child naming variations */
export const UPI_CASH_POINT_ALIASES = [
  RETAILER_SERVICE_NAMES.UPI_CASH_POINT,
  "UPI ATM",
  "UPI Cashpoint",
  "Cash Point",
  "UPI Collection",
] as const;

export const DMT3_SERVICE_CODE = "104";

export const DMT3_SERVICE_NAME_ALIASES = [
  RETAILER_SERVICE_NAMES.DMT3,
  "DMT 3",
  "DMT3",
  "dmt3",
] as const;

export const DMT1_SERVICE_NAME_ALIASES = [
  RETAILER_SERVICE_NAMES.DMT1,
  "DMT 1",
  "DMT1",
  "dmt1",
  "Instant DMT",
  "InstantPay DMT",
] as const;

/** Catalog parent "XPRESS DMT" (NIFI) — used by the DMT2 / Xpress Transfer module */
export const XPRESS_DMT_SERVICE_CODE = "DMT004";

export const XPRESS_DMT_SERVICE_NAME_ALIASES = [
  "XPRESS DMT",
  "Xpress DMT",
  "Express DMT",
] as const;

/** Catalog child "Bill Payment" under parent "Credit Card" (CREDIT_CARD) — CCBP module */
export const CCBP_SERVICE_CODE = "CREDIT_CARD_BILL_PAYMENT";
export const CCBP_PARENT_SERVICE_CODE = "CREDIT_CARD";

export const RETAILER_SERVICES_ENDPOINT = "/retailer/services";
