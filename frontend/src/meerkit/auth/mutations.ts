import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "../api/auth";
import type { LoginInput, SignupInput } from "../types";
import { useAuthDialog } from "./dialog-store";
import { meKey } from "./queries";
import { useAuthStore } from "./store";

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const closeDialog = useAuthDialog((s) => s.closeDialog);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ access_token }) => {
      setAccessToken(access_token);
      closeDialog();
    },
  });
}

export function useSignup() {
  const login = useLogin();
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      await authApi.signup(input);
      await login.mutateAsync({ email: input.email, password: input.password });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      setAccessToken(null);
      queryClient.removeQueries({ queryKey: meKey });
    },
  });
}
