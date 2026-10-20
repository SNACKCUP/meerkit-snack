import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi, type LoginInput, type SignupInput } from "../api/auth";
import { meQueryKey } from "./queries";
import { useAuthStore } from "./store";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ access_token }) => {
      useAuthStore.getState().setAccessToken(access_token);
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

/** 가입 후 바로 로그인까지 합니다. */
export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      await authApi.signup(input);
      return authApi.login({ email: input.email, password: input.password });
    },
    onSuccess: ({ access_token }) => {
      useAuthStore.getState().setAccessToken(access_token);
      queryClient.invalidateQueries({ queryKey: meQueryKey });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      useAuthStore.getState().clear();
      queryClient.clear();
    },
  });
}
