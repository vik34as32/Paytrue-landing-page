/**
 * DMT module endpoints — mapped to existing backend routes.
 * Spec names are aliased to the live API paths in dmtApi.js.
 */
export const DMT_MODULE_ENDPOINTS = {
  searchSender: "/dmt/remitter/check",
  registerSender: "/dmt/remitter/register",
  sendRemitterOtp: "/dmt/remitter/send-otp",
  verifySenderOtp: "/dmt/remitter/verify-otp",
  bioAuth: "/dmt/remitter/ekyc",
  remitterPidOptions: (mobile: string) =>
    `/dmt/remitter/${encodeURIComponent(mobile)}/pid-options`,
  senderProfile: (mobile: string) => `/dmt/remitter/${encodeURIComponent(mobile)}`,
  banks: "/dmt/banks",
  verifyBankAccount: "/dmt/bank-account/verify",
  beneficiaries: "/dmt/beneficiaries",
  addBeneficiary: "/dmt/beneficiaries",
  verifyBeneficiaryOtp: (id: string) =>
    `/dmt/beneficiaries/${encodeURIComponent(id)}/verify`,
  deleteBeneficiary: (id: string) => `/dmt/beneficiaries/${encodeURIComponent(id)}`,
  deleteBeneficiaryVerify: (id: string) =>
    `/dmt/beneficiaries/${encodeURIComponent(id)}/delete/verify`,
  generateTransactionOtp: "/dmt/transaction/generate-otp",
  verifyTransactionOtp: "/dmt/transaction/verify-otp",
  transfer: "/dmt/transfer",
  transferImps: "/dmt/transfer/imps",
  transferNeft: "/dmt/transfer/neft",
  transactionStatus: (reference: string) =>
    `/dmt/status/${encodeURIComponent(reference)}`,
  receipt: (reference: string) => `/dmt/receipt/${encodeURIComponent(reference)}`,
} as const;
