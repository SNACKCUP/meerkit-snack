// meerkit.config.ts에서 쓰는 설정 타입. 킷 폴더 밖(프로젝트 루트)의 설정 파일이 이 타입을 따른다.
export type ThemeMode = "meerkit" | "shadcn";

export type SignupOptionalField = "nickname" | "phone" | "address" | "birth_date" | "gender";

/**
 * 주소 입력 방식.
 * "basic": 주소 + 상세 주소
 * "postcode": 우편번호 + 주소 + 상세 주소
 */
export type AddressType = "basic" | "postcode";

/** 가입 시 동의받을 약관 한 줄 */
export interface TermsItem {
  /** 서버로 전달되는 식별자. 예: "terms", "privacy", "marketing" */
  id: string;
  label: string;
  /** true면 동의하지 않으면 가입할 수 없다 */
  required: boolean;
  /** 약관 전문 주소. 새 창으로 열린다 */
  href?: string;
}

export interface MeerkitUserConfig {
  /**
   * "meerkit": Meerkit 기본 스타일(쿨 그레이 + 포인트 블루).
   * "shadcn": 프로젝트의 shadcn 기본 CSS 변수(--background, --primary ...)를 그대로 따른다.
   */
  theme?: ThemeMode;
  /** false면 Meerkit의 모든 진입·전환 애니메이션을 끈다. */
  motion?: boolean;
  signup?: {
    /** 비밀번호 확인 입력을 추가한다. 서버로는 보내지 않는다. */
    passwordConfirm?: boolean;
    /** 가입 폼에 추가로 받을 선택 항목. */
    optionalFields?: SignupOptionalField[];
    /** 가입 시 동의받을 약관 목록. 빈 배열이면 약관 영역을 숨긴다. */
    terms?: TermsItem[];
    /** optionalFields에 "address"를 넣었을 때 쓰는 주소 입력 방식. 기본 "basic" */
    addressType?: AddressType;
    /** true면 이메일 옆에 인증번호 받기·확인 버튼을 보여 주고, 인증을 마쳐야 가입할 수 있다. */
    emailVerification?: boolean;
  };
  login?: {
    /** 이 횟수만큼 연속 실패하면 로그인을 잠근다. 0이면 잠금 기능을 끈다. */
    maxAttempts?: number;
    /** 잠금 시간(분) */
    lockMinutes?: number;
  };
}

export const defineMeerkitConfig = (config: MeerkitUserConfig) => config;
