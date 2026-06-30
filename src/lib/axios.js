import axios from "axios";
import { API_BASE_URL } from "@/src/constants/api";
import { getAccessToken, clearAuthCookies } from "@/src/lib/cookies";

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let the browser set multipart boundary — never force Content-Type on FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuthCookies();
      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler();
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
      status,
      message,
      data: error?.response?.data,
      originalError: error,
    });
  }
);

export default api;
