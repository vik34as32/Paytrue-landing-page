/** UPI ATM (Cash Point) API paths — relative to API_BASE_URL (/api/v1) */
export const UPI_ATM_ENDPOINTS = {
  generateQr: "/upi-atm/generate-qr",
  status: (referenceId: string) =>
    `/upi-atm/status/${encodeURIComponent(referenceId)}`,
  history: "/upi-atm/history",
  transaction: (id: string) => `/upi-atm/${encodeURIComponent(id)}`,
} as const;
