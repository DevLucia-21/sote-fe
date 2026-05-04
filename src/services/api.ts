import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthStorage } from "../utils/auth";
import type * as API from "../types/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------------------
// Refresh Token Queue 시스템
// ----------------------------
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let hasNotifiedAuthExpired = false;

const AUTH_EXPIRED_EVENT = "auth:expired";

const isAuthRequest = (url?: string) => {
  return !!url && url.includes("/api/auth/");
};

const isBusiness403Request = (url?: string) => {
  if (!url) return false;

  return (
    url.includes("/api/analysis") ||
    url.includes("/api/challenge/") ||
    url.includes("/api/statistics/") ||
    url.includes("/api/settings/") ||
    url.includes("/api/diaries") ||
    url.includes("/api/calendar-notes/") ||
    url.includes("/api/health/") ||
    url.includes("/api/ocr/upload") ||
    url.includes("/ai/stt/transcribe")
  );
};

const shouldHandleAuthFailure = (status?: number, url?: string) => {
  if (status === 401) {
    return true;
  }

  if (status === 403 && !isBusiness403Request(url)) {
    return true;
  }

  return false;
};

const clearAuthData = () => {
  AuthStorage.clearTokens();
  localStorage.removeItem("expiresIn");
  localStorage.removeItem("user_id");
  localStorage.removeItem("profileData");
};

const notifyAuthExpired = () => {
  if (hasNotifiedAuthExpired) return;

  hasNotifiedAuthExpired = true;
  clearAuthData();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
};

// ----------------------------
// Request Interceptor
// ----------------------------
apiClient.interceptors.request.use(
  (config) => {
    if (isAuthRequest(config.url)) {
      delete config.headers.Authorization;
      return config;
    }

    const token = AuthStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    hasNotifiedAuthExpired = false;
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// Response Interceptor
// ----------------------------
apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const status = error.response?.status;
    const url = originalRequest?.url;

    if (isAuthRequest(url)) {
      return Promise.reject(error);
    }

    if (shouldHandleAuthFailure(status, url) && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = AuthStorage.getRefreshToken();
      if (!refreshToken) {
        notifyAuthExpired();
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = new Promise(async (resolve) => {
          try {
            const res = await axios.post<API.TokenResponse>(
              `${BASE_URL}/api/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefresh } = res.data;

            AuthStorage.setTokens(accessToken, newRefresh);


            isRefreshing = false;
            resolve(accessToken);
          } catch (err) {
            console.error("❌ Refresh 실패 → 로그아웃");
            isRefreshing = false;
            notifyAuthExpired();
            resolve(null);
          }
        });
      }

      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      return Promise.reject(error);
    }

    if (shouldHandleAuthFailure(status, url)) {
      notifyAuthExpired();
    }

    return Promise.reject(error);
  }
);

// ----------------------------
// API 함수들 (Named Export)
// ----------------------------

// 워치 인증 요청 API
export const watchAuthAPI = async () => {
  const res = await apiClient.get("/api/watch/auth");
  return res.data;
};

// 로그인 API 예시
export const loginAPI = async (payload: API.LoginRequest) => {
  const res = await apiClient.post("/api/auth/login", payload);
  return res.data;
};

// 유저 정보 API 예시
export const refreshAuthAPI = async (refreshToken: string) => {
  const res = await axios.post<API.TokenResponse>(
    `${BASE_URL}/api/auth/refresh`,
    { refreshToken }
  );
  return res.data;
};

export const getMyInfoAPI = async () => {
  const res = await apiClient.get("/api/user/me");
  return res.data;
};

// 필요한 API 계속 추가 가능
// export const getSomething = ...

// ----------------------------
// Default export (apiClient만)
// ----------------------------
export default apiClient;
