import { defineMeerkitConfig } from "@/meerkit/define-config";

// Meerkit 설정. 킷 폴더(src/meerkit)를 건드리지 않고 여기서만 바꾼다.
export default defineMeerkitConfig({
  // "meerkit" | "shadcn"
  theme: "meerkit",
  // false면 Meerkit 애니메이션을 모두 끈다
  motion: true,

  signup: {
    passwordConfirm: false,
    // 예: ["nickname", "phone", "address", "birth_date", "gender"]
    optionalFields: [],
    // "basic": 주소 + 상세 주소 / "postcode": 우편번호 + 주소 + 상세 주소
    addressType: "basic",
    // true면 이메일 인증번호 받기·확인 버튼을 보여 주고, 인증해야 가입할 수 있다
    emailVerification: false,
    // 가입 시 동의받을 약관. 빈 배열이면 약관 영역이 사라진다.
    terms: [
      { id: "terms", label: "이용약관 동의", required: true, href: "/terms" },
      { id: "privacy", label: "개인정보 수집 및 이용 동의", required: true, href: "/privacy" },
      { id: "marketing", label: "마케팅 정보 수신 동의", required: false },
    ],
  },

  login: {
    // 연속 5회 실패하면 5분 동안 로그인을 잠근다. maxAttempts: 0이면 끈다.
    maxAttempts: 5,
    lockMinutes: 5,
  },

});
