export const AEPS_ENDPOINTS = {
  login: "/aeps/login",
  cashWithdrawal: "/aeps/cash-withdrawal",
  balanceEnquiry: "/aeps/balance-enquiry",
  miniStatement: "/aeps/mini-statement",
  cashDeposit: "/aeps/cash-deposit",
  /** POST — verify beneficiary account before cash deposit */
  cashDepositVerifyAccount: "/aeps/cash-deposit/verify-account",
  aadhaarPay: "/aeps/aadhaar-pay",
  transactionOtp: "/aeps/transaction-otp",
  transactionStatus: "/aeps/transaction-status",
  /** GET /aeps/banks — AEPS bank list (cached 24h on server) */
  banks: "/aeps/banks",
  /** GET /aeps/ledger — retailer AEPS transaction history */
  ledger: "/aeps/ledger",
  health: "/aeps/health",
};

export const AEPS_OTP_AMOUNT_THRESHOLD = 5000;

/** RD Service discovery configuration */
export const RD_SERVICE_HOSTS = ["127.0.0.1", "localhost"];

export const RD_SERVICE_PROTOCOLS = ["http", "https"];

export const RD_SERVICE_PORTS = [11100, 11101, 11102, 11103, 11104, 11105];

export const RD_SERVICE_PATHS = {
  info: "/rd/info",
  capture: "/rd/capture",
  deviceInfo: "/rd/deviceinfo",
};

export const RD_PROBE_TIMEOUT_MS = 5_000;
export const RD_CAPTURE_TIMEOUT_MS = 30_000;

/** @deprecated Use discoverRDService() — kept for backward compatibility */
export const RD_SERVICE_BASE_URLS = RD_SERVICE_PORTS.flatMap((port) =>
  RD_SERVICE_HOSTS.map((host) => `http://${host}:${port}`)
);
