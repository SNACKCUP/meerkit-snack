"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignupFormProps {
  onSubmit: (input: { email: string; password: string; name?: string }) => void;
  pending?: boolean;
  error?: string | null;
}

export function SignupForm({ onSubmit, pending, error }: SignupFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ email, password, name: name || undefined });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="signup-name">이름</Label>
        <Input id="signup-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">이메일</Label>
        <Input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">비밀번호</Label>
        <Input id="signup-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "가입 중…" : "회원가입"}</Button>
    </form>
  );
}
