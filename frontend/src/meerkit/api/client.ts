import axios, { type InternalAxiosRequestConfig } from "axios";

import { setSessionHint } from "../auth/session-hint";
import { useAuthStore } from "../auth/store";
import { meerkitConfig } from "../config";

export const api = axios.create({
  baseURL: meerkitConfig.apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401이 동시에 여러 건 와도 갱신은 한 번만 한다.
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<{ access_token: string }>(
      `${meerkitConfig.apiBaseUrl}/auth/refresh`,
      null,
      { withCredentials: true },
    );
    useAuthStore.getState().setAccessToken(data.access_token);
    return data.access_token;
  } catch {
    useAuthStore.getState().setAccessToken(null);
    setSessionHint(false);
    return null;
  }
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(undefined, async (error) => {
  const original = error.config as RetriableConfig | undefined;
  const isAuthCall = original?.url?.startsWith("/auth/");
  if (error.response?.status !== 401 || !original || original._retried || isAuthCall) {
    return Promise.reject(error);
  }
  original._retried = true;
  refreshing ??= refreshAccessToken().finally(() => {
    refreshing = null;
  });
  const token = await refreshing;
  if (!token) return Promise.reject(error);
  original.headers.Authorization = `Bearer ${token}`;
  return api(original);
});
