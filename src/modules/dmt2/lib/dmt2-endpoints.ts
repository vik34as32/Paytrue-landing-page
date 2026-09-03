/** DMT2 API paths — relative to API_BASE_URL (/api/v1). Isolated from DMT. */
export const DMT2_ENDPOINTS = {
  remitterRegister: "/dmt2/remitter/register",
  remitterVerifyOtp: "/dmt2/remitter/verify-otp",
  remitterByMobile: (mobile: string) =>
    `/dmt2/remitter/${encodeURIComponent(mobile)}`,
  beneficiaryAdd: "/dmt2/beneficiary",
  beneficiaryVerify: "/dmt2/beneficiary/verify",
  beneficiaryById: (id: string) => `/dmt2/beneficiary/${encodeURIComponent(id)}`,
  beneficiaries: "/dmt2/beneficiaries",
  payoutImps: "/dmt2/payout/imps",
  payoutNeft: "/dmt2/payout/neft",
  payoutRtgs: "/dmt2/payout/rtgs",
  transactionStatus: (reference: string) =>
    `/dmt2/transaction/status/${encodeURIComponent(reference)}`,
  transactions: "/dmt2/transactions",
  receipt: (reference: string) => `/dmt2/receipt/${encodeURIComponent(reference)}`,
} as const;
