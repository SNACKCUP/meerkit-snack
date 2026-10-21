"use client";

import { BadgeCheck } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { errorMessage } from "../../api/error";
import { formatRemaining, useRemainingLock } from "../lockout";

interface EmailVerificationFieldProps {
  value: string;
  onChange: (email: string) => void;
  /** 인증을 마쳤는지 */
  verified: boolean;
  /** 인증에 성공하면 서버가 준 증표를, 인증을 풀면 null을 전달한다 */
  onVerifiedChange: (token: string | null) => void;
  sendCode: (email: string) => Promise<unknown>;
  verifyCode: (email: string, code: string) => Promise<string>;
  /** 인증번호 유효 시간(초) */
  expiresInSeconds?: number;
  /** 재전송까지 기다리는 시간(초) */
  resendAfterSeconds?: number;
  id?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 이메일 입력 + [인증번호 받기] → 번호 입력 + [확인] → 인증 완료. 서비스에 따라 켜고 끌 수 있다.
export function EmailVerificationField({
  value,
  onChange,
  verified,
  onVerifiedChange,
  sendCode,
  verifyCode,
  expiresInSeconds = 180,
  resendAfterSeconds = 30,
  id = "signup-email",
}: EmailVerificationFieldProps) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | null>(null);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const expiresIn = useRemainingLock(expiresAt);
  const resendIn = useRemainingLock(resendAt);
  const expired = sent && expiresIn <= 0;

  async function send() {
    if (!EMAIL_PATTERN.test(value)) return setMessage({ tone: "error", text: "이메일 형식이 올바르지 않습니다." });
    setBusy("send");
    setMessage(null);
    try {
      await sendCode(value);
      setSent(true);
      setCode("");
      setExpiresAt(Date.now() + expiresInSeconds * 1000);
      setResendAt(Date.now() + resendAfterSeconds * 1000);
      setMessage({ tone: "info", text: "인증번호를 보냈습니다. 메일을 확인해 주세요." });
    } catch (e) {
      setMessage({ tone: "error", text: errorMessage(e) ?? "인증번호를 보내지 못했습니다." });
    } finally {
      setBusy(null);
    }
  }

  async function verify() {
    if (!/^\d{6}$/.test(code)) return setMessage({ tone: "error", text: "인증번호 6자리를 입력해 주세요." });
    setBusy("verify");
    setMessage(null);
    try {
      onVerifiedChange(await verifyCode(value, code));
      setSent(false);
      setMessage(null);
    } catch (e) {
      setMessage({ tone: "error", text: errorMessage(e) ?? "인증번호가 올바르지 않습니다." });
    } finally {
      setBusy(null);
    }
  }

  function changeEmail() {
    onVerifiedChange(null);
    setSent(false);
    setCode("");
    setMessage(null);
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>이메일</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="email"
          autoComplete="email"
          required
          readOnly={verified}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (sent) setSent(false); // 인증번호는 보낸 이메일에만 유효하다
          }}
        />
        {verified ? (
          <Button type="button" variant="outline" className="shrink-0" onClick={changeEmail}>변경</Button>
        ) : (
          <Button type="button" variant="outline" className="shrink-0" disabled={busy !== null || (sent && resendIn > 0)} onClick={send}>
            {busy === "send" ? "보내는 중…" : sent ? (resendIn > 0 ? `재전송 ${Math.ceil(resendIn / 1000)}s` : "재전송") : "인증번호 받기"}
          </Button>
        )}
      </div>

      {verified && (
        <p className="mk-swap flex items-center gap-1.5 text-xs">
          <Badge variant="brand"><BadgeCheck /> 인증 완료</Badge>
          <span className="text-muted-foreground">이 이메일로 가입합니다.</span>
        </p>
      )}

      {sent && !verified && (
        <div className="mk-swap grid gap-2">
          <div className="flex gap-2">
            <Input
              aria-label="인증번호"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="인증번호 6자리"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <Button type="button" className="shrink-0" disabled={busy !== null || expired} onClick={verify}>
              {busy === "verify" ? "확인 중…" : "확인"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {expired ? "인증번호가 만료되었습니다. 다시 받아 주세요." : <>남은 시간 <span className="font-mono font-medium text-foreground">{formatRemaining(expiresIn)}</span></>}
          </p>
        </div>
      )}

      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={message.tone === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {message.text}
        </p>
      )}
    </div>
  );
}
