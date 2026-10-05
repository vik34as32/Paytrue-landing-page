/** Backend prefix: /api/v1/upi-payout (axios baseURL already includes /api/v1). */
export const UPI_PAYOUT_ENDPOINTS = {
  verifyVpa: "/upi-payout/vpa/verify",
  commissionPreview: "/upi-payout/commission/preview",
  pay: "/upi-payout/pay",
  transactionStatus: (reference: string) =>
    `/upi-payout/transaction/status/${encodeURIComponent(reference)}`,
  transactions: "/upi-payout/transactions",
  receipt: (reference: string) => `/upi-payout/receipt/${encodeURIComponent(reference)}`,
} as const;
