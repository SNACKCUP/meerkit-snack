import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import { authApi } from "../api/auth";
import { usersApi } from "../api/users";
import { meerkitConfig } from "../config";
import type { ChangePasswordInput, EmailCodeInput, ForgotPasswordInput, LoginInput, ResetPasswordInput, SignupInput, UpdateProfileInput, VerifyEmailCodeInput } from "../types";
import { useAuthDialog } from "./dialog-store";
import { useLockoutStore } from "./lockout";
import { meKey } from "./queries";
import { useAuthStore } from "./store";

export function useLogin() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const closeDialog = useAuthDialog((s) => s.closeDialog);
  const { recordFailure, lockFor, reset } = useLockoutStore.getState();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: ({ access_token }) => {
      reset();
      setAccessToken(access_token);
      closeDialog();
    },
    onError: (error) => {
      if (!isAxiosError(error) || !error.response) return; // 네트워크 오류는 실패로 세지 않는다
      const status = error.response.status;
      if (status === 429 || status === 423) {
        // 서버가 이미 잠갔다면 서버가 알려 준 시간(Retry-After, 초)을 따른다
        const retry = Number(error.response.headers["retry-after"]);
        lockFor(Number.isFinite(retry) && retry > 0 ? retry * 1000 : meerkitConfig.login.lockMinutes * 60_000);
      } else if (status === 400 || status === 401) {
        recordFailure(); // 아이디·비밀번호가 틀린 경우만 센다
      }
    },
  });
}

export function useSignup() {
  const login = useLogin();
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      await authApi.signup(input);
      await login.mutateAsync({ user_id: input.user_id, password: input.password });
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

export function useForgotPassword() {
  return useMutation({ mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input) });
}

export function useSendEmailCode() {
  return useMutation({ mutationFn: (input: EmailCodeInput) => authApi.sendEmailCode(input) });
}

export function useVerifyEmailCode() {
  return useMutation({ mutationFn: (input: VerifyEmailCodeInput) => authApi.verifyEmailCode(input) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (input: ResetPasswordInput) => authApi.resetPassword(input) });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => usersApi.updateMe(input),
    onSuccess: (user) => {
      queryClient.setQueryData(meKey, user);
      toast.success("내 정보를 저장했습니다.");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) => usersApi.changePassword(input),
    onSuccess: () => toast.success("비밀번호를 변경했습니다."),
  });
}
