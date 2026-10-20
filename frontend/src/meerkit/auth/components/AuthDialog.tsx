"use client";

import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuthDialog } from "../dialog-store";
import { useLogin, useSignup } from "../mutations";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

function errorMessage(error: unknown): string | null {
  if (!error) return null;
  if (isAxiosError(error)) return error.response?.data?.detail ?? "요청에 실패했습니다.";
  return "알 수 없는 오류가 발생했습니다.";
}

export function AuthDialog() {
  const { open, mode, closeDialog, setMode } = useAuthDialog();
  const login = useLogin();
  const signup = useSignup();
  const isLogin = mode === "login";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeDialog()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isLogin ? "로그인" : "회원가입"}</DialogTitle>
          <DialogDescription>
            {isLogin ? "계정으로 로그인하세요." : "이메일로 계정을 만드세요."}
          </DialogDescription>
        </DialogHeader>
        {isLogin ? (
          <LoginForm onSubmit={login.mutate} pending={login.isPending} error={errorMessage(login.error)} />
        ) : (
          <SignupForm onSubmit={signup.mutate} pending={signup.isPending} error={errorMessage(signup.error)} />
        )}
        <Button variant="link" className="justify-self-center" onClick={() => setMode(isLogin ? "signup" : "login")}>
          {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
