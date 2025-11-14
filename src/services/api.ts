import axios, { AxiosInstance, AxiosError } from "axios";
import { AuthStorage } from "../utils/auth";
import type * as API from "../types/api";

const BASE_URL = "http://localhost:8080";

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------------------
// Refresh Token Queue 시스템
// ----------------------------
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// ----------------------------
// Request Interceptor
// ----------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthStorage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
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

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = AuthStorage.getRefreshToken();
      if (!refreshToken) {
        console.warn("❌ refreshToken 없음 → 로그아웃");
        AuthStorage.clearTokens();
        window.location.href = "/login";
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

            console.log("🔁 Access Token 자동 갱신 완료");

            isRefreshing = false;
            resolve(accessToken);
          } catch (err) {
            console.error("❌ Refresh 실패 → 로그아웃");
            isRefreshing = false;
            AuthStorage.clearTokens();
            window.location.href = "/login";
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
