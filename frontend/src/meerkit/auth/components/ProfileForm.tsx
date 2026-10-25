"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AddressType, SignupOptionalField } from "../../define-config";
import type { UpdateProfileInput, User } from "../../types";
import type { AddressSearchProvider, AddressSearchResult } from "./address-search";
import { EmailVerificationField } from "./EmailVerificationField";
import type { EmailVerificationHandlers } from "./SignupForm";
import { OptionalFields, collectOptional, optionalValuesFromUser, validateOptional, type OptionalValues } from "./OptionalFields";

interface ProfileFormProps {
  user: User;
  onSubmit: (input: UpdateProfileInput) => void;
  pending?: boolean;
  error?: string | null;
  /** 함께 수정할 선택 항목. 가입 폼에서 켠 것과 같은 목록을 쓴다 */
  optionalFields?: SignupOptionalField[];
  addressType?: AddressType;
  addressSearch?: "popup" | "dialog";
  onSearchAddress?: () => Promise<AddressSearchResult | null>;
  addressSearchProvider?: AddressSearchProvider;
  /** 주면 이메일을 바꿀 때 새 이메일로 인증번호를 확인해야 저장할 수 있다 (서버가 요구) */
  emailVerification?: EmailVerificationHandlers;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 아이디는 바꿀 수 없다. 이름, 이메일, 켜 둔 선택 항목(닉네임, 주소 등)만 수정한다.
export function ProfileForm({ user, onSubmit, pending, error, optionalFields = [], addressType = "basic", addressSearch, onSearchAddress, addressSearchProvider, emailVerification }: ProfileFormProps) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const emailChanged = form.email.trim().toLowerCase() !== user.email;
  const [optional, setOptional] = useState<OptionalValues>(() => optionalValuesFromUser(user));
  const [invalid, setInvalid] = useState<string | null>(null);

  const initial = optionalValuesFromUser(user);
  const keys = Object.keys(collectOptional(optional, optionalFields, addressType, true)) as (keyof OptionalValues)[];
  const dirty = form.name !== user.name || form.email !== user.email || keys.some((k) => optional[k] !== initial[k]);

  return (
    <form
      className="grid gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return setInvalid("이름을 입력해 주세요.");
        if (!EMAIL_PATTERN.test(form.email)) return setInvalid("이메일 형식이 올바르지 않습니다.");
        if (emailVerification && emailChanged && !emailToken) return setInvalid("새 이메일 인증을 완료해 주세요.");
        const optionalError = validateOptional(optional, optionalFields);
        if (optionalError) return setInvalid(optionalError);
        setInvalid(null);
        // 수정에서는 비운 값도 보내서 지울 수 있게 한다
        onSubmit({
          name: form.name.trim(),
          email: form.email,
          ...(emailChanged && emailToken ? { email_verification_token: emailToken } : {}),
          ...collectOptional(optional, optionalFields, addressType, true),
        });
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="profile-user-id">아이디</Label>
        <Input id="profile-user-id" value={user.user_id} disabled readOnly />
        <p className="text-xs text-muted-foreground">아이디는 변경할 수 없습니다.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="profile-name">이름</Label>
        <Input id="profile-name" autoComplete="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
      </div>
      {emailVerification ? (
        <div className="grid gap-1">
          {/* 같은 입력칸을 계속 써야 입력 중에 포커스를 잃지 않는다. 바꾸지 않았으면 인증 버튼만 숨긴다 */}
          <EmailVerificationField
            id="profile-email"
            value={form.email}
            onChange={(email) => setForm((p) => ({ ...p, email }))}
            verified={emailToken !== null}
            onVerifiedChange={setEmailToken}
            sendCode={emailVerification.sendCode}
            verifyCode={emailVerification.verifyCode}
            skip={!emailChanged}
            verifiedText="저장하면 이 이메일로 바뀝니다."
          />
          {!emailChanged && <p className="text-xs text-muted-foreground">이메일을 바꾸면 새 이메일로 인증번호를 확인해야 합니다.</p>}
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="profile-email">이메일</Label>
          <Input id="profile-email" type="email" autoComplete="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
        </div>
      )}
      <OptionalFields
        idPrefix="profile"
        fields={optionalFields}
        values={optional}
        onChange={(patch) => setOptional((p) => ({ ...p, ...patch }))}
        addressType={addressType}
        addressSearch={addressSearch}
        onSearchAddress={onSearchAddress}
        addressSearchProvider={addressSearchProvider}
        markOptional={false}
      />
      {(invalid ?? error) && <p role="alert" className="text-sm text-destructive">{invalid ?? error}</p>}
      <Button type="submit" disabled={pending || !dirty} className="justify-self-start">
        {pending ? "저장 중…" : "저장"}
      </Button>
    </form>
  );
}
