/** DMT3 retailer API paths — same shape as DMT2, prefix /dmt3. */
export const DMT3_ENDPOINTS = {
  remitterRegister: "/dmt3/remitter/register",
  remitterResendOtp: "/dmt3/remitter/resend-otp",
  remitterVerifyOtp: "/dmt3/remitter/verify-otp",
  remitterByMobile: (mobile: string) =>
    `/dmt3/remitter/${encodeURIComponent(mobile)}`,
  beneficiaryAdd: "/dmt3/beneficiary",
  beneficiaryVerify: "/dmt3/beneficiary/verify",
  beneficiaryById: (id: string) => `/dmt3/beneficiary/${encodeURIComponent(id)}`,
  beneficiaries: "/dmt3/beneficiaries",
  commissionPreview: "/dmt3/commission/preview",
  payoutImps: "/dmt3/payout/imps",
  payoutNeft: "/dmt3/payout/neft",
  payoutRtgs: "/dmt3/payout/rtgs",
  transactionInitiate: "/dmt3/transaction/initiate",
  transactionStatus: (reference: string) =>
    `/dmt3/transaction/status/${encodeURIComponent(reference)}`,
  transactions: "/dmt3/transactions",
  transactionById: (id: string) =>
    `/dmt3/transactions/${encodeURIComponent(id)}`,
  transactionEnquiry: (id: string) =>
    `/dmt3/transactions/${encodeURIComponent(id)}/enquiry`,
  receipt: (reference: string) => `/dmt3/receipt/${encodeURIComponent(reference)}`,
} as const;
