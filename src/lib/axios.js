import axios from "axios";
import { API_BASE_URL } from "@/src/constants/api";
import { getAccessToken } from "@/src/lib/cookies";
import { isSessionClearInProgress } from "@/src/lib/sessionCleanup";

let unauthorizedHandler = null;

/** Pre-registration OTP endpoints must not clear an active portal session on failure. */
const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/send-otp",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/send-email-verification",
  "/auth/verify-email",
];

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

function isPublicAuthRequest(config) {
  const url = String(config?.url || "");
  return PUBLIC_AUTH_ENDPOINTS.some((path) => url.includes(path));
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    Accept: "application/json",
  },
});

export function isUnauthorizedApiError(error) {
  if (isPublicAuthRequest(error?.config) || error?.config?.skipSessionLogout) {
    return false;
  }

  const status = error?.response?.status ?? error?.status;
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      ""
  ).toLowerCase();

  if (status === 401 || status === 403) {
    return true;
  }

  return (
    message.includes("token expired") ||
    message.includes("jwt expired") ||
    message.includes("session expired") ||
    message.includes("invalid or expired token")
  );
}

export function formatApiErrorMessage(error, fallback = "Something went wrong") {
  const message =
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.originalError?.message ||
    fallback;
  const status = error?.status || error?.response?.status;
  return status ? `${message} (Error ${status})` : message;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const method = (config.method || "get").toLowerCase();
    const hasBody =
      config.data !== undefined && config.data !== null && config.data !== "";

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (["post", "put", "patch"].includes(method) && hasBody) {
      if (!config.headers["Content-Type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    } else {
      delete config.headers["Content-Type"];
      if (!hasBody) {
        delete config.data;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isUnauthorizedApiError(error) && !isSessionClearInProgress()) {
      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler(error);
      } else if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    return Promise.reject({
      status: error?.response?.status,
      message,
      data: error?.response?.data,
      originalError: error,
    });
  }
);

export default api;
