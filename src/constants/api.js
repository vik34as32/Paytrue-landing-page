export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://apis.paytrue.co.in/api/v1";

export const API_ENDPOINTS = {
  login: "/auth/login",
  profile: "/auth/profile",
  users: "/users",
  wallet: "/wallet",
  walletTransfer: "/wallet/transfer",
  walletTransfers: "/wallet/transfers",
  fundRequests: "/fund-requests",
  changePassword: "/auth/change-password",
  sendEmailVerification: "/auth/send-email-verification",
  verifyEmail: "/auth/verify-email",
};
