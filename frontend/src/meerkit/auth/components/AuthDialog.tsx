"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { errorMessage } from "../../api/error";
import { meerkitConfig } from "../../config";
import { useAuthDialog } from "../dialog-store";
import { useLoginLockout } from "../lockout";
import { useCheckUserId, useForgotPassword, useLogin, useSendEmailCode, useSignup, useVerifyEmailCode } from "../mutations";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

const copy = {
  login: { title: "로그인", desc: "아이디와 비밀번호를 입력하세요." },
  signup: { title: "회원가입", desc: "정보를 입력해 계정을 만드세요." },
  forgot: { title: "비밀번호 찾기", desc: "가입한 이메일로 재설정 링크를 보내 드립니다." },
} as const;

export function AuthDialog() {
  const { open, mode, closeDialog, setMode } = useAuthDialog();
  const login = useLogin();
  const signup = useSignup();
  const forgot = useForgotPassword();
  const lock = useLoginLockout();
  const sendCode = useSendEmailCode();
  const checkId = useCheckUserId();
  const verifyCode = useVerifyEmailCode();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeDialog()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{copy[mode].title}</DialogTitle>
          <DialogDescription>{copy[mode].desc}</DialogDescription>
        </DialogHeader>

        {/* 모드가 바뀌면 폼이 부드럽게 교체된다 */}
        <div key={mode} className="mk-swap">
          {mode === "login" && (
            <LoginForm
              onSubmit={login.mutate}
              pending={login.isPending}
              error={errorMessage(login.error)}
              lockedUntil={lock.lockedUntil}
              attemptsLeft={lock.attemptsLeft}
              onForgotPassword={() => setMode("forgot")}
            />
          )}
          {mode === "signup" && (
            <SignupForm
              onSubmit={signup.mutate}
              pending={signup.isPending}
              error={errorMessage(signup.error)}
              passwordConfirm={meerkitConfig.signup.passwordConfirm}
              optionalFields={[...meerkitConfig.signup.optionalFields]}
              terms={[...meerkitConfig.signup.terms]}
              addressType={meerkitConfig.signup.addressType}
              nickname={meerkitConfig.signup.nickname}
              addressSearch={meerkitConfig.signup.addressSearch}
              checkUserId={(id) => checkId.mutateAsync(id)}
      emailVerification={
                meerkitConfig.signup.emailVerification
                  ? {
                      sendCode: (email) => sendCode.mutateAsync({ email }),
                      verifyCode: async (email, code) => (await verifyCode.mutateAsync({ email, code })).token,
                    }
                  : undefined
              }
            />
          )}
          {mode === "forgot" && (
            <ForgotPasswordForm
              onSubmit={forgot.mutate}
              pending={forgot.isPending}
              error={errorMessage(forgot.error)}
              sent={forgot.isSuccess}
              onBack={() => {
                forgot.reset();
                setMode("login");
              }}
            />
          )}
        </div>

        {mode !== "forgot" && (
          <Button variant="link" className="justify-self-center" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </Button>
        )}
        {mode === "forgot" && !forgot.isSuccess && (
          <Button variant="link" className="justify-self-center" onClick={() => setMode("login")}>로그인으로 돌아가기</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
