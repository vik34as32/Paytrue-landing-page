import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

export interface TransferBalanceRequest {
  receiverId: string;
  amount: number;
  description: string;
}

export async function transferBalance(data: TransferBalanceRequest) {
  const response = await api.post(API_ENDPOINTS.walletTransfer, {
    receiverId: data.receiverId,
    amount: data.amount,
    description: data.description,
  });
  return response.data?.data ?? response.data;
}
