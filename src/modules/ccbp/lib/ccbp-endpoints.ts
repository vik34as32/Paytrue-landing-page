/** Backend prefix: /api/v1/ccbp (axios baseURL already includes /api/v1). */
export const CCBP_ENDPOINTS = {
  commissionPreview: "/ccbp/commission/preview",
  pay: "/ccbp/pay",
  transactionStatus: (reference: string) =>
    `/ccbp/transaction/status/${encodeURIComponent(reference)}`,
  status: (reference: string) => `/ccbp/status/${encodeURIComponent(reference)}`,
  transactions: "/ccbp/transactions",
  receipt: (reference: string) => `/ccbp/receipt/${encodeURIComponent(reference)}`,
} as const;
