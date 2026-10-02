/** DMT1 InstantPay remittance API paths — prefix /dmt1 */
export const DMT1_ENDPOINTS = {
  remitterRegister: "/dmt1/remitter/register",
  remitterResendOtp: "/dmt1/remitter/resend-otp",
  remitterVerifyOtp: "/dmt1/remitter/verify-otp",
  remitterByMobile: (mobile: string) =>
    `/dmt1/remitter/${encodeURIComponent(mobile)}`,
  beneficiaryAdd: "/dmt1/beneficiary",
  beneficiaryVerify: "/dmt1/beneficiary/verify",
  beneficiaryById: (id: string) => `/dmt1/beneficiary/${encodeURIComponent(id)}`,
  beneficiaries: "/dmt1/beneficiaries",
  commissionPreview: "/dmt1/commission/preview",
  generateTransactionOtp: "/dmt1/transaction/generate-otp",
  payoutImps: "/dmt1/payout/imps",
  payoutNeft: "/dmt1/payout/neft",
  payoutRtgs: "/dmt1/payout/rtgs",
  transactionInitiate: "/dmt1/transaction/initiate",
  transactionStatus: (reference: string) =>
    `/dmt1/transaction/status/${encodeURIComponent(reference)}`,
  transactions: "/dmt1/transactions",
  transactionById: (id: string) =>
    `/dmt1/transactions/${encodeURIComponent(id)}`,
  transactionEnquiry: (id: string) =>
    `/dmt1/transactions/${encodeURIComponent(id)}/enquiry`,
  receipt: (reference: string) => `/dmt1/receipt/${encodeURIComponent(reference)}`,
} as const;
