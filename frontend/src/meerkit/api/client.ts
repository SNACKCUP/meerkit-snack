import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import { meerkitConfig } from "../config";
import { useAuthStore } from "../auth/store";
import type { TokenResponse } from "../types";

// 모든 서버 호출은 이 인스턴스를 사용합니다.
export const api = axios.create({
  baseURL: meerkitConfig.apiBaseUrl,
  withCredentials: true, // 리프레시 쿠키 전송
});

// 리프레시 전용 인스턴스 (아래 인터셉터를 타지 않게 분리)
const refreshClient = axios.create({
  baseURL: meerkitConfig.apiBaseUrl,
  withCredentials: true,
});

let refreshing: Promise<string | null> | null = null;

/** 리프레시 쿠키로 새 액세스 토큰을 받습니다. 동시에 여러 번 불려도 요청은 한 번만 보냅니다. */
export function refreshAccessToken(): Promise<string | null> {
  refreshing ??= refreshClient
    .post<TokenResponse>("/auth/refresh")
    .then(({ data }) => {
      useAuthStore.getState().setAccessToken(data.access_token);
      return data.access_token;
    })
    .catch(() => {
      useAuthStore.getState().clear();
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetryConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// 401이면 토큰을 한 번 갱신하고 원래 요청을 다시 보냅니다.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    const isAuthCall = config?.url?.startsWith("/auth/");
    if (error.response?.status !== 401 || !config || config._retried || isAuthCall) {
      throw error;
    }
    config._retried = true;
    const token = await refreshAccessToken();
    if (!token) throw error;
    config.headers.Authorization = `Bearer ${token}`;
    return api(config);
  },
);

/** 서버 오류 응답에서 사용자에게 보여 줄 문구를 꺼냅니다. */
export function errorMessage(error: unknown, fallback = "잠시 후 다시 시도해 주세요."): string {
  if (axios.isAxiosError(error)) {
    const detail = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return "입력값을 다시 확인해 주세요.";
  }
  return fallback;
}
