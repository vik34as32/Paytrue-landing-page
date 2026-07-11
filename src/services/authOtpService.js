import api from "@/src/lib/axios";
import { API_ENDPOINTS } from "@/src/constants/api";

const OTP_REQUEST_CONFIG = { skipSessionLogout: true };

function unwrapPayload(responseData) {
  return responseData?.data ?? responseData;
}

/**
 * Send email verification OTP before user registration.
 * POST /auth/send-email-verification
 * @param {string} email
 */
export async function sendEmailOtp(email) {
  const response = await api.post(
    API_ENDPOINTS.sendEmailVerification,
    { email },
    OTP_REQUEST_CONFIG
  );
  return unwrapPayload(response.data);
}

/**
 * Verify email OTP.
 * POST /auth/verify-email
 * @param {{ email: string, otp: string }} payload
 */
export async function verifyEmailOtp(payload) {
  const response = await api.post(
    API_ENDPOINTS.verifyEmail,
    payload,
    OTP_REQUEST_CONFIG
  );
  return unwrapPayload(response.data);
}

/**
 * Send mobile verification OTP before user registration.
 * POST /auth/send-otp
 * @param {string} mobile
 */
export async function sendMobileOtp(mobile) {
  const response = await api.post(
    API_ENDPOINTS.sendMobileOtp,
    { mobile },
    OTP_REQUEST_CONFIG
  );
  return unwrapPayload(response.data);
}

/**
 * Verify mobile OTP.
 * POST /auth/verify-otp
 * @param {{ mobile: string, otp: string }} payload
 */
export async function verifyMobileOtp(payload) {
  const response = await api.post(
    API_ENDPOINTS.verifyMobileOtp,
    payload,
    OTP_REQUEST_CONFIG
  );
  return unwrapPayload(response.data);
}

/**
 * Resend mobile OTP.
 * POST /auth/resend-otp
 * @param {string} mobile
 */
export async function resendMobileOtp(mobile) {
  const response = await api.post(
    API_ENDPOINTS.resendMobileOtp,
    { mobile },
    OTP_REQUEST_CONFIG
  );
  return unwrapPayload(response.data);
}