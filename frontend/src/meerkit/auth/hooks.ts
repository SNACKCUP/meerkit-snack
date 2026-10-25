import { isAdminUser } from "../roles";
import { useMe } from "./queries";
import { useAuthStore } from "./store";

export function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { data: user, isLoading } = useMe();
  return {
    user,
    isAuthenticated: !!accessToken,
    isLoading: !!accessToken && isLoading,
    isAdmin: isAdminUser(user),
  };
}
