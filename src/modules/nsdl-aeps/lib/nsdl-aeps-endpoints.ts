/** NSDL AEPS (backend module `aeps2`, NifiPayments) — relative to API_BASE_URL (/api/v1). */
export const NSDL_AEPS_ENDPOINTS = {
  banks: "/aeps2/banks",
  states: "/aeps2/states",
  merchant: "/aeps2/merchant",
  onboardMerchant: "/aeps2/onboarding/merchant",
  onboardRequestOtp: "/aeps2/onboarding/request-otp",
  onboardVerifyOtp: "/aeps2/onboarding/verify-otp",
  onboardEkyc: "/aeps2/onboarding/ekyc",
  dailyLogin: "/aeps2/daily-login",
  transaction: "/aeps2/transaction",
  transactionById: (transactionId: string) =>
    `/aeps2/transaction/${encodeURIComponent(transactionId)}`,
  transactions: "/aeps2/transactions",
  status: "/aeps2/status",
  ledger: "/aeps2/ledger",
} as const;

export const NSDL_AEPS_BASE_PATH = "/rt/retailer/nsdl-aeps";
export const NSDL_AEPS_LOGIN_PATH = `${NSDL_AEPS_BASE_PATH}/login`;
export const NSDL_AEPS_ONBOARDING_PATH = `${NSDL_AEPS_BASE_PATH}/onboarding`;
export const NSDL_AEPS_LEDGER_PATH = `${NSDL_AEPS_BASE_PATH}/ledger`;
export const NSDL_AEPS_STATUS_PATH = `${NSDL_AEPS_BASE_PATH}/transaction-status`;
