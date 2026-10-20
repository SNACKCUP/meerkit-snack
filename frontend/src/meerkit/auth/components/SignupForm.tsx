"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { errorMessage } from "../../api/client";
import { useSignup } from "../mutations";

const MIN_PASSWORD = 8;

export function SignupForm({ onSuccess }: { onSuccess?: () => void }) {
  const signup = useSignup();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const tooShort = password.length > 0 && password.length < MIN_PASSWORD;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return;
    signup.mutate({ name, email, password }, { onSuccess });
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="signup-name">이름</Label>
        <Input
          id="signup-name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">이메일</Label>
        <Input
          id="signup-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">비밀번호</Label>
        <Input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          aria-invalid={tooShort}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className={tooShort ? "text-destructive text-sm" : "text-muted-foreground text-sm"}>
          {MIN_PASSWORD}자 이상 입력하세요.
        </p>
      </div>
      {signup.isError && (
        <p role="alert" className="text-destructive text-sm">
          {errorMessage(signup.error)}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={signup.isPending}>
        {signup.isPending ? "가입 중..." : "회원가입"}
      </Button>
    </form>
  );
}
