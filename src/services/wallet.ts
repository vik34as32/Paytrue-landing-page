import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

export interface AepsWalletBalanceData {
  success?: boolean;
  balance: number;
  currency: string;
  walletType: string;
  status: string;
}

export interface AepsWalletBalanceResult {
  balance: number;
  currency: string;
  walletType: string;
  status: string;
}

function toBalance(value: unknown): number {
  if (value == null) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * GET /wallet/aeps/balance
 * Auth: Bearer JWT (attached by axios interceptor)
 */
export async function getAepsWalletBalance(): Promise<AepsWalletBalanceResult> {
  const response = await api.get(API_ENDPOINTS.walletAepsBalance);
  const body = (response.data ?? {}) as Record<string, unknown>;
  const nested =
    body.data && typeof body.data === "object" && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : body;

  return {
    balance: toBalance(nested.balance),
    currency: String(nested.currency || "INR"),
    walletType: String(nested.walletType || "AEPS"),
    status: String(nested.status || "ACTIVE"),
  };
}
