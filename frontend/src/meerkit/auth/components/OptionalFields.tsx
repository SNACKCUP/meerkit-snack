"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { AddressType, SignupOptionalField } from "../../define-config";
import type { User } from "../../types";
import { AddressField, AddressFieldLabel } from "./AddressField";
import { NicknameInput } from "./NicknameInput";
import type { AddressSearchProvider, AddressSearchResult } from "./address-search";

// 가입 폼과 내 정보 수정 폼이 함께 쓰는 선택 항목 입력 모음.
export interface OptionalValues {
  nickname: string;
  phone: string;
  postcode: string;
  address: string;
  address_detail: string;
  birth_date: string;
  gender: string;
}

export const emptyOptionalValues: OptionalValues = {
  nickname: "", phone: "", postcode: "", address: "", address_detail: "", birth_date: "", gender: "",
};

export const GENDER_OPTIONS = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "none", label: "선택 안 함" },
] as const;

export const NICKNAME_RANGE = { min: 2, max: 12 } as const;

export function optionalValuesFromUser(user: User): OptionalValues {
  return {
    nickname: user.nickname ?? "",
    phone: user.phone ?? "",
    postcode: user.postcode ?? "",
    address: user.address ?? "",
    address_detail: user.address_detail ?? "",
    birth_date: user.birth_date ?? "",
    gender: user.gender ?? "",
  };
}

/** 켜 둔 항목만 골라 서버로 보낼 값으로 만든다. 가입에서는 빈 값을 빼고, 수정에서는 비운 값도 보낸다. */
export function collectOptional(values: OptionalValues, fields: SignupOptionalField[], addressType: AddressType, keepEmpty = false) {
  const out: Record<string, string> = {};
  const put = (key: string, value: string) => {
    const v = value.trim();
    if (v || keepEmpty) out[key] = v;
  };
  for (const field of fields) {
    if (field === "address") {
      if (addressType === "postcode") put("postcode", values.postcode);
      put("address", values.address);
      put("address_detail", values.address_detail);
    } else {
      put(field, values[field]);
    }
  }
  return out;
}

export function validateOptional(values: OptionalValues, fields: SignupOptionalField[]): string | null {
  if (fields.includes("nickname") && values.nickname.trim()) {
    const len = Array.from(values.nickname.trim()).length;
    if (len < NICKNAME_RANGE.min || len > NICKNAME_RANGE.max) {
      return `닉네임은 ${NICKNAME_RANGE.min}~${NICKNAME_RANGE.max}자로 입력해 주세요.`;
    }
  }
  return null;
}

interface OptionalFieldsProps {
  fields: SignupOptionalField[];
  values: OptionalValues;
  onChange: (patch: Partial<OptionalValues>) => void;
  addressType?: AddressType;
  /** 주소 검색 방식과 검색 방법 (AddressField 참고) */
  addressSearch?: "popup" | "dialog";
  onSearchAddress?: () => Promise<AddressSearchResult | null>;
  addressSearchProvider?: AddressSearchProvider;
  /** 라벨 옆에 (선택)을 붙일지 */
  markOptional?: boolean;
  /** 닉네임 입력칸 옆에 [자동 생성] 버튼을 보여 줄지. 기본 true */
  nicknameGenerator?: boolean;
  idPrefix: string;
}

export function OptionalFields({ fields, values, onChange, addressType = "basic", addressSearch, onSearchAddress, addressSearchProvider, markOptional = true, nicknameGenerator = true, idPrefix }: OptionalFieldsProps) {
  const opt = markOptional ? <span className="font-normal text-muted-foreground"> (선택)</span> : null;

  return (
    <>
      {fields.map((field) => {
        if (field === "nickname") {
          return (
            <div key={field} className="mk-swap grid gap-2">
              <Label htmlFor={`${idPrefix}-nickname`}>닉네임{opt}</Label>
              <NicknameInput
                id={`${idPrefix}-nickname`}
                value={values.nickname}
                onChange={(nickname) => onChange({ nickname })}
                generator={nicknameGenerator}
                placeholder={`${NICKNAME_RANGE.min}~${NICKNAME_RANGE.max}자, 다른 사용자에게 보이는 이름`}
              />
            </div>
          );
        }
        if (field === "gender") {
          return (
            <div key={field} className="mk-swap grid gap-2">
              <Label>성별{opt}</Label>
              <RadioGroup className="grid-flow-col justify-start gap-5" value={values.gender} onValueChange={(v) => onChange({ gender: v })}>
                {GENDER_OPTIONS.map((o) => (
                  <div key={o.value} className="flex items-center gap-2">
                    <RadioGroupItem id={`${idPrefix}-gender-${o.value}`} value={o.value} />
                    <Label htmlFor={`${idPrefix}-gender-${o.value}`} className="cursor-pointer font-normal">{o.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          );
        }
        if (field === "address") {
          return (
            <div key={field} className="mk-swap grid gap-2">
              {markOptional ? <AddressFieldLabel>주소</AddressFieldLabel> : <Label>주소</Label>}
              <AddressField
                variant={addressType}
                idPrefix={`${idPrefix}-address`}
                value={{ postcode: values.postcode, address: values.address, address_detail: values.address_detail }}
                onChange={(v) => onChange(v)}
                searchMode={addressSearch}
                onSearch={onSearchAddress}
                searchProvider={addressSearchProvider}
              />
            </div>
          );
        }
        const simple = {
          nickname: { label: "닉네임", type: "text", autoComplete: "nickname", placeholder: `${NICKNAME_RANGE.min}~${NICKNAME_RANGE.max}자, 다른 사용자에게 보이는 이름` },
          phone: { label: "전화번호", type: "tel", autoComplete: "tel", placeholder: "" },
          birth_date: { label: "생년월일", type: "date", autoComplete: "bday", placeholder: "" },
        }[field];
        return (
          <div key={field} className="mk-swap grid gap-2">
            <Label htmlFor={`${idPrefix}-${field}`}>{simple.label}{opt}</Label>
            <Input
              id={`${idPrefix}-${field}`}
              type={simple.type}
              autoComplete={simple.autoComplete}
              placeholder={simple.placeholder}
              value={values[field]}
              onChange={(e) => onChange({ [field]: e.target.value })}
            />
          </div>
        );
      })}
    </>
  );
}
