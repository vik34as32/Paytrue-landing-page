/** DMT API paths — relative to API_BASE_URL (/api/v1) */
export const DMT_ENDPOINTS = {
  checkSender: "/dmt/sender/check",
  senderProfile: "/dmt/sender/profile",
  senderByMobile: (mobile) => `/dmt/sender/${encodeURIComponent(mobile)}`,
  registerSender: "/dmt/sender/register",
  sendSenderOtp: "/dmt/sender/send-otp",
  verifySenderOtp: "/dmt/sender/verify-otp",
  resendSenderOtp: "/dmt/sender/resend-otp",
  beneficiaries: "/dmt/beneficiaries",
  beneficiaryVerify: (id) => `/dmt/beneficiaries/${encodeURIComponent(id)}/verify`,
  beneficiaryDelete: (id) => `/dmt/beneficiaries/${encodeURIComponent(id)}`,
  transfer: "/dmt/transfer",
  transactions: "/dmt/transactions",
  transactionById: (id) => `/dmt/transactions/${encodeURIComponent(id)}`,
};
