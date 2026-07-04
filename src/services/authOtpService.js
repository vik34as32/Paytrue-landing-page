import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

function unwrapPayload(responseData) {
  return responseData?.data ?? responseData;
}

/**
 * Send email verification OTP before user registration.
 * POST /auth/send-email-verification
 * @param {string} email
 */
export async function sendEmailOtp(email) {
  const response = await api.post(API_ENDPOINTS.sendEmailVerification, { email });
  return unwrapPayload(response.data);
}

/**
 * Verify email OTP.
 * POST /auth/verify-email
 * @param {{ email: string, otp: string }} payload
 */
export async function verifyEmailOtp(payload) {
  const response = await api.post(API_ENDPOINTS.verifyEmail, payload);
  return unwrapPayload(response.data);
}
