/** DMT3 API paths — relative to API_BASE_URL. Isolated from DMT / DMT2. */
export const DMT3_ENDPOINTS = {
  beneficiaries: "/dmt3/beneficiaries",
  beneficiaryById: (id: string) =>
    `/dmt3/beneficiaries/${encodeURIComponent(id)}`,
  beneficiaryVerify: (id: string) =>
    `/dmt3/beneficiaries/${encodeURIComponent(id)}/verify`,
  commissionPreview: "/dmt3/commission/preview",
  transactionInitiate: "/dmt3/transaction/initiate",
  transactions: "/dmt3/transactions",
  transactionById: (id: string) =>
    `/dmt3/transactions/${encodeURIComponent(id)}`,
  transactionEnquiry: (id: string) =>
    `/dmt3/transactions/${encodeURIComponent(id)}/enquiry`,
} as const;
