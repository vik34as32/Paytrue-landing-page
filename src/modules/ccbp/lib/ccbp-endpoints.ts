export const CCBP_ENDPOINTS = {
  pay: "/ccbp/pay",
  status: (reference: string) => `/ccbp/status/${encodeURIComponent(reference)}`,
  transactions: "/ccbp/transactions",
  receipt: (reference: string) => `/ccbp/receipt/${encodeURIComponent(reference)}`,
} as const;
