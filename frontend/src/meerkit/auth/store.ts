import { create } from "zustand";

// restoring: 새로고침 직후 리프레시 쿠키로 로그인 상태를 되살리는 중
export type AuthStatus = "restoring" | "authenticated" | "anonymous";

interface AuthState {
  accessToken: string | null;
  status: AuthStatus;
  setAccessToken: (token: string) => void;
  clear: () => void;
}

// 액세스 토큰은 메모리에만 둡니다 (persist 사용 안 함). 새로고침하면 리프레시 쿠키로 다시 받습니다.
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  status: "restoring",
  setAccessToken: (token) => set({ accessToken: token, status: "authenticated" }),
  clear: () => set({ accessToken: null, status: "anonymous" }),
}));
