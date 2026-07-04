import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success?: boolean;
  message?: string;
}

export async function changePassword(
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  const response = await api.post(API_ENDPOINTS.changePassword, payload);
  return (response.data?.data ?? response.data) as ChangePasswordResponse;
}
