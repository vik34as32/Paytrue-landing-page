/**
 * Canonical child service display names from GET /retailer/services.
 * Resolve IDs dynamically — do not hardcode UUIDs.
 */
export const RETAILER_SERVICE_NAMES = {
  DMT_IMPS: "Money Transfer (IMPS)",
  DMT_NEFT: "Money Transfer (NEFT)",
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

export const RETAILER_SERVICES_ENDPOINT = "/retailer/services";
