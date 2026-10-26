import type { Candidate, DemoUser, Project, RequirementDoc } from "./types";

export const DEMO_USERS: DemoUser[] = [
  { id: "u1", name: "김다나", email: "dana@example.com" },
  { id: "u2", name: "이작성", email: "writer@example.com" },
  { id: "u3", name: "박조회", email: "viewer@example.com" },
  { id: "u4", name: "최신입", email: "newbie@example.com" },
];

const day = (d: number) => `2026-10-${String(d).padStart(2, "0")}T09:00:00Z`;

export const emptyDoc = (): RequirementDoc => ({ status: "empty", prompt: "", files: [], candidates: [], notes: [], lastViewedId: null, savedAt: null, confirmedAt: null, pendingSince: null });

// AI가 문서에서 뽑았다고 가정한 요구사항 후보 (목 데이터)
const POOL: Omit<Candidate, "id" | "code" | "answer" | "included">[] = [
  { name: "비회원도 장바구니에 상품을 담을 수 있다", kind: "기능", priority: "높음", description: "로그인하지 않아도 상품을 장바구니에 담고, 로그인하면 그대로 이어진다.", quote: "로그인 안 해도 일단 담아 둘 수 있었으면 해요", question: null },
  { name: "결제 응답은 3초 이내여야 한다", kind: "비기능", priority: "중간", description: "결제 요청부터 결과 화면까지의 응답 시간 기준.", quote: "결제가 너무 느려서 중간에 나가요", question: "3초는 평균인가요, 최대인가요?" },
  { name: "주문 내역을 기간별로 조회한다", kind: "기능", priority: "높음", description: "시작일과 종료일을 골라 그 기간의 주문만 본다.", quote: "지난달 주문만 따로 보고 싶어요", question: null },
  { name: "상품 후기에 사진을 첨부한다", kind: "기능", priority: "낮음", description: "후기를 쓸 때 사진을 올릴 수 있다.", quote: "후기에 사진도 올릴 수 있으면 좋겠어요", question: "사진은 최대 몇 장까지인가요?" },
  { name: "개인정보는 암호화해서 저장한다", kind: "비기능", priority: "중간", description: "이름, 연락처, 주소 같은 개인정보는 암호화해 보관한다.", quote: "고객 정보가 안전하게 보관돼야 해요", question: null },
  { name: "관리자가 쿠폰을 발급한다", kind: "기능", priority: "중간", description: "관리자가 쿠폰 종류와 기간을 정해 발급한다.", quote: "이벤트 때 쿠폰을 직접 뿌리고 싶어요", question: null },
  { name: "배송 상태를 알림으로 받는다", kind: "기능", priority: "높음", description: "배송 단계가 바뀔 때마다 알림을 보낸다.", quote: "택배가 어디쯤인지 알려 줬으면 해요", question: "알림은 앱 푸시인가요, 문자인가요?" },
  { name: "상품 목록은 2초 안에 보여야 한다", kind: "비기능", priority: "중간", description: "상품 목록 첫 화면이 열리는 시간 기준.", quote: "목록이 느리면 답답해요", question: null },
  { name: "회원 등급별로 할인율을 다르게 적용한다", kind: "기능", priority: "낮음", description: "등급에 따라 결제 금액에서 할인한다.", quote: "단골에게는 더 깎아 주고 싶어요", question: "등급은 몇 단계로 나눌까요?" },
  { name: "관리자 화면 접속 기록을 남긴다", kind: "비기능", priority: "낮음", description: "누가 언제 관리자 화면에 들어왔는지 기록한다.", quote: "누가 들어왔는지 나중에 확인하고 싶어요", question: null },
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

export const SEED_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "쇼핑몰 리뉴얼",
    startDate: "2026-10-01",
    endDate: "2026-12-15",
    createdBy: "u1",
    createdAt: day(1),
    members: [
      { id: "m1", userId: "u1", name: "김다나", email: "dana@example.com", role: "ADMIN", status: "active" },
      { id: "m2", userId: "u2", name: "이작성", email: "writer@example.com", role: "MEMBER", status: "active" },
      { id: "m3", userId: null, name: "viewer", email: "viewer@example.com", role: "MEMBER", status: "invited", token: "demo-invite-viewer", expiresAt: "2099-01-01T00:00:00Z" },
    ],
  },
  {
    id: "p2",
    name: "사내 예약 시스템",
    startDate: "2026-09-10",
    endDate: "2026-11-30",
    createdBy: "u2",
    createdAt: day(2),
    members: [
      { id: "m4", userId: "u2", name: "이작성", email: "writer@example.com", role: "ADMIN", status: "active" },
      { id: "m5", userId: "u1", name: "김다나", email: "dana@example.com", role: "MEMBER", status: "active" },
    ],
  },
];

export const SEED_DOCS: Record<string, RequirementDoc> = {
  p1: { ...emptyDoc(), status: "ready", prompt: "결제와 주문 중심으로 정리해 줘", files: ["쇼핑몰_요청서.docx", "운영팀_메모.txt"], candidates: makeCandidates(8), savedAt: null },
  p2: { ...emptyDoc(), status: "confirmed", prompt: "예약 흐름 중심", files: ["예약_요구사항.pdf"], candidates: makeCandidates(5), confirmedAt: day(20) },
};
