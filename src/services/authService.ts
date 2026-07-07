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

export interface ForgotPasswordRequest {
  email?: string;
  mobile?: string;
}

export interface ForgotPasswordResponse {
  success?: boolean;
  message?: string;
}

export interface ResetPasswordRequest {
  email?: string;
  mobile?: string;
  otp: string;
  password: string;
}

export interface ResetPasswordResponse {
  success?: boolean;
  message?: string;
}

export async function changePassword(
  payload: ChangePasswordRequest
): Promise<ChangePasswordResponse> {
  const response = await api.post(API_ENDPOINTS.changePassword, payload);
  return (response.data?.data ?? response.data) as ChangePasswordResponse;
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const body: ForgotPasswordRequest = {};
  if (payload.email?.trim()) body.email = payload.email.trim();
  if (payload.mobile?.trim()) body.mobile = payload.mobile.trim();
  const response = await api.post(API_ENDPOINTS.forgotPassword, body);
  return (response.data?.data ?? response.data) as ForgotPasswordResponse;
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const body: ResetPasswordRequest = {
    otp: payload.otp.trim(),
    password: payload.password,
  };
  if (payload.email?.trim()) body.email = payload.email.trim();
  if (payload.mobile?.trim()) body.mobile = payload.mobile.trim();
  const response = await api.post(API_ENDPOINTS.resetPassword, body);
  return (response.data?.data ?? response.data) as ResetPasswordResponse;
}
