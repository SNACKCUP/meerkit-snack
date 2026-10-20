import type { RoleCode } from "../types";
import { useMe } from "./queries";
import { useAuthStore } from "./store";

/** 로그인 상태와 내 정보를 한 번에. 화면에서는 이 훅을 먼저 쓰세요. */
export function useAuth() {
  const status = useAuthStore((s) => s.status);
  const me = useMe();
  const user = status === "authenticated" ? me.data : undefined;
  return {
    status,
    user,
    isLoading: status === "restoring" || (status === "authenticated" && me.isPending),
    isAuthenticated: status === "authenticated",
    isAdmin: user?.roles.includes("ADMIN") ?? false,
  };
}

/** 내가 이 역할을 가졌는지 */
export function usePermission(role: RoleCode): boolean {
  const { user } = useAuth();
  return user?.roles.includes(role) ?? false;
}
