"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AddressType, SignupOptionalField, TermsItem } from "../../define-config";
import type { SignupInput } from "../../types";
import type { AddressSearchResult } from "./address-search";
import { EmailVerificationField } from "./EmailVerificationField";
import { OptionalFields, collectOptional, emptyOptionalValues, validateOptional, type OptionalValues } from "./OptionalFields";
import { TermsAgreement } from "./TermsAgreement";

export interface EmailVerificationHandlers {
  sendCode: (email: string) => Promise<unknown>;
  /** 인증번호가 맞으면 가입 요청에 붙일 증표(token)를 돌려준다 */
  verifyCode: (email: string, code: string) => Promise<string>;
}

interface SignupFormProps {
  onSubmit: (input: SignupInput) => void;
  pending?: boolean;
  error?: string | null;
  /** 비밀번호 확인 입력을 추가한다. 서버로는 보내지 않는다. */
  passwordConfirm?: boolean;
  /** 추가로 받을 선택 항목 */
  optionalFields?: SignupOptionalField[];
  /** 주소 입력 방식. "basic": 주소 + 상세 주소 / "postcode": 우편번호 + 주소 + 상세 주소 */
  addressType?: AddressType;
  /** 동의받을 약관. 비어 있으면 약관 영역이 없다 */
  terms?: TermsItem[];
  /** 주면 이메일 옆에 인증번호 받기·확인 버튼이 생기고, 인증해야 가입할 수 있다 */
  emailVerification?: EmailVerificationHandlers;
  /** 주소 검색 방법을 바꾸고 싶을 때 (기본: 카카오 우편번호 팝업) */
  onSearchAddress?: () => Promise<AddressSearchResult | null>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm({
  onSubmit,
  pending,
  error,
  passwordConfirm = false,
  optionalFields = [],
  addressType = "basic",
  terms = [],
  emailVerification,
  onSearchAddress,
}: SignupFormProps) {
  const [form, setForm] = useState({ user_id: "", email: "", name: "", password: "", password_confirm: "" });
  const [optional, setOptional] = useState<OptionalValues>(emptyOptionalValues);
  const [agreed, setAgreed] = useState<string[]>([]);
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [termsInvalid, setTermsInvalid] = useState(false);
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTermsInvalid(false);
    if (!EMAIL_PATTERN.test(form.email)) return setInvalid("이메일 형식이 올바르지 않습니다.");
    if (emailVerification && !emailToken) return setInvalid("이메일 인증을 완료해 주세요.");
    if (form.password.length < 8) return setInvalid("비밀번호는 8자 이상이어야 합니다.");
    if (passwordConfirm && form.password !== form.password_confirm) return setInvalid("비밀번호가 일치하지 않습니다.");
    const optionalError = validateOptional(optional, optionalFields);
    if (optionalError) return setInvalid(optionalError);
    if (terms.some((t) => t.required && !agreed.includes(t.id))) {
      setTermsInvalid(true);
      return setInvalid("필수 약관에 모두 동의해 주세요.");
    }
    setInvalid(null);

    const input: SignupInput = {
      user_id: form.user_id.trim(),
      name: form.name.trim(),
      email: form.email,
      password: form.password,
      // 켜 둔 선택 항목 중 값이 있는 것만 보낸다. 비밀번호 확인은 보내지 않는다.
      ...collectOptional(optional, optionalFields, addressType),
    };
    if (terms.length > 0) input.agreed_terms = agreed;
    if (emailVerification && emailToken) input.email_verification_token = emailToken;
    onSubmit(input);
  }

  const message = invalid ?? error;

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      <div className="grid gap-2">
        <Label htmlFor="signup-user-id">아이디</Label>
        <Input id="signup-user-id" autoComplete="username" required value={form.user_id} onChange={set("user_id")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-name">이름</Label>
        <Input id="signup-name" autoComplete="name" required value={form.name} onChange={set("name")} />
      </div>
      {emailVerification ? (
        <EmailVerificationField
          value={form.email}
          onChange={(email) => setForm((p) => ({ ...p, email }))}
          verified={emailToken !== null}
          onVerifiedChange={setEmailToken}
          sendCode={emailVerification.sendCode}
          verifyCode={emailVerification.verifyCode}
        />
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="signup-email">이메일</Label>
          <Input id="signup-email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="signup-password">비밀번호</Label>
        <Input id="signup-password" type="password" autoComplete="new-password" required value={form.password} onChange={set("password")} />
      </div>
      {passwordConfirm && (
        <div className="mk-swap grid gap-2">
          <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
          <Input id="signup-password-confirm" type="password" autoComplete="new-password" required value={form.password_confirm} onChange={set("password_confirm")} />
        </div>
      )}
      <OptionalFields
        idPrefix="signup"
        fields={optionalFields}
        values={optional}
        onChange={(patch) => setOptional((p) => ({ ...p, ...patch }))}
        addressType={addressType}
        onSearchAddress={onSearchAddress}
      />
      <TermsAgreement terms={terms} value={agreed} onChange={(v) => { setAgreed(v); setTermsInvalid(false); }} invalid={termsInvalid} />
      {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
      <Button type="submit" disabled={pending}>{pending ? "가입 중…" : "회원가입"}</Button>
    </form>
  );
}
