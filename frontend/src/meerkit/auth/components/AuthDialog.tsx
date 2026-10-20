"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuthDialog } from "../dialog-store";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

/** 로그인·가입 팝업. MeerkitProvider가 한 번만 렌더링하고, 어디서든 useAuthDialog().openDialog()로 엽니다. */
export function AuthDialog() {
  const { open, mode, setMode, close } = useAuthDialog();
  const isLogin = mode === "login";

  const done = () => {
    close();
    toast.success(isLogin ? "로그인했어요." : "가입을 환영해요!");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isLogin ? "로그인" : "회원가입"}</DialogTitle>
          <DialogDescription>
            {isLogin ? "이메일과 비밀번호를 입력하세요." : "몇 가지만 입력하면 바로 시작할 수 있어요."}
          </DialogDescription>
        </DialogHeader>
        {isLogin ? <LoginForm onSuccess={done} /> : <SignupForm onSuccess={done} />}
        <p className="text-muted-foreground text-center text-sm">
          {isLogin ? "처음이신가요?" : "이미 계정이 있나요?"}
          <Button
            variant="link"
            className="px-1"
            onClick={() => setMode(isLogin ? "signup" : "login")}
          >
            {isLogin ? "회원가입" : "로그인"}
          </Button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
