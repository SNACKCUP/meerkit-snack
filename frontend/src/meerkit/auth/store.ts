import { create } from "zustand";

// 액세스 토큰은 메모리에만 둔다 (persist 금지). 리프레시 토큰은 httpOnly 쿠키.
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
}));
