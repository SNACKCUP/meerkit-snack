import type { Candidate, RequirementDoc } from "./types";

export const emptyDoc = (): RequirementDoc => ({ status: "empty", prompt: "", files: [], candidates: [], notes: [], lastViewedId: null, savedAt: null, confirmedAt: null, confirmedBy: null, pendingSince: null });

// AI가 문서에서 뽑았다고 가정한 요구사항 후보 (목 데이터, M3 분석 API가 생기면 지움). 구분은 공통코드 값
const POOL: Omit<Candidate, "id" | "code" | "answer" | "included">[] = [
  { name: "비회원도 장바구니에 상품을 담을 수 있다", kind: "FUNCTIONAL", priority: "높음", description: "로그인하지 않아도 상품을 장바구니에 담고, 로그인하면 그대로 이어진다.", quote: "로그인 안 해도 일단 담아 둘 수 있었으면 해요", question: null },
  { name: "결제 응답은 3초 이내여야 한다", kind: "NON_FUNCTIONAL", priority: "중간", description: "결제 요청부터 결과 화면까지의 응답 시간 기준.", quote: "결제가 너무 느려서 중간에 나가요", question: "3초는 평균인가요, 최대인가요?" },
  { name: "주문 내역을 기간별로 조회한다", kind: "FUNCTIONAL", priority: "높음", description: "시작일과 종료일을 골라 그 기간의 주문만 본다.", quote: "지난달 주문만 따로 보고 싶어요", question: null },
  { name: "상품 후기에 사진을 첨부한다", kind: "FUNCTIONAL", priority: "낮음", description: "후기를 쓸 때 사진을 올릴 수 있다.", quote: "후기에 사진도 올릴 수 있으면 좋겠어요", question: "사진은 최대 몇 장까지인가요?" },
  { name: "개인정보는 암호화해서 저장한다", kind: "NON_FUNCTIONAL", priority: "중간", description: "이름, 연락처, 주소 같은 개인정보는 암호화해 보관한다.", quote: "고객 정보가 안전하게 보관돼야 해요", question: null },
  { name: "관리자가 쿠폰을 발급한다", kind: "FUNCTIONAL", priority: "중간", description: "관리자가 쿠폰 종류와 기간을 정해 발급한다.", quote: "이벤트 때 쿠폰을 직접 뿌리고 싶어요", question: null },
  { name: "배송 상태를 알림으로 받는다", kind: "FUNCTIONAL", priority: "높음", description: "배송 단계가 바뀔 때마다 알림을 보낸다.", quote: "택배가 어디쯤인지 알려 줬으면 해요", question: "알림은 앱 푸시인가요, 문자인가요?" },
  { name: "상품 목록은 2초 안에 보여야 한다", kind: "NON_FUNCTIONAL", priority: "중간", description: "상품 목록 첫 화면이 열리는 시간 기준.", quote: "목록이 느리면 답답해요", question: null },
  { name: "회원 등급별로 할인율을 다르게 적용한다", kind: "FUNCTIONAL", priority: "낮음", description: "등급에 따라 결제 금액에서 할인한다.", quote: "단골에게는 더 깎아 주고 싶어요", question: "등급은 몇 단계로 나눌까요?" },
  { name: "관리자 화면 접속 기록을 남긴다", kind: "NON_FUNCTIONAL", priority: "낮음", description: "누가 언제 관리자 화면에 들어왔는지 기록한다.", quote: "누가 들어왔는지 나중에 확인하고 싶어요", question: null },
];

export function makeCandidates(count = 8): Candidate[] {
  return POOL.slice(0, count).map((c, i) => ({
    ...c,
    id: `cand-${i + 1}`,
    code: `REQ-${String(i + 1).padStart(3, "0")}`,
    answer: "",
    included: true,
  }));
}
