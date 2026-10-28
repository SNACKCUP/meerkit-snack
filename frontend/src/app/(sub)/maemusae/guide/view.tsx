"use client";

import { useRef } from "react";

import { cn } from "@/lib/utils";

import { useReveal } from "../_lib/motion";
import { Btn, Pill, card } from "../_components/ui";

const STEPS = [
  { id: "project", no: "01", title: "프로젝트 만들기", body: "프로젝트 화면에서 “+ 프로젝트 등록”을 눌러 이름과 기간을 정하세요. 함께할 팀원의 이메일을 미리 적어 두면 초대장이 같이 갑니다.", tip: "프로젝트를 만든 사람이 관리자가 돼요.", mock: "project" },
  { id: "upload", no: "02", title: "문서 올리고 정리 요청하기", body: "프로젝트의 요구사항정의서를 열어 고객 문서를 올리고, 정리해 줬으면 하는 방향을 한 줄 적어요. 파일 없이 내용만 적어도 됩니다.", tip: "예: “결제와 주문 중심으로 정리해 줘”", mock: "upload" },
  { id: "review", no: "03", title: "후보 살펴보고 고치기", body: "왼쪽 목록에서 후보를 고르면 오른쪽에서 이름, 구분, 우선순위, 설명을 고칠 수 있어요. 근거 문장도 함께 보여 줍니다. 필요 없는 후보는 체크를 해제하고, 빠진 건 “직접 추가”로 넣으세요.", tip: "“확인 필요” 표시는 AI가 남긴 질문이에요. 답하면 정리가 더 정확해져요.", mock: "review" },
  { id: "confirm", no: "04", title: "관리자가 확정하기", body: "다 고쳤다면 관리자가 “요구사항 확정”을 누르세요. 확정하면 요구사항정의서가 만들어지고, 누가 언제 확정했는지 기록돼요.", tip: "중간에 “임시 저장”을 하면 나중에 이어서 할 수 있어요.", mock: "confirm" },
  { id: "members", no: "05", title: "멤버 초대하고 권한 나누기", body: "프로젝트의 “멤버 권한 관리”에서 이메일로 초대하세요. 초대는 7일 안에 수락해야 해요. 관리자는 확정과 멤버 관리를, 일반 멤버는 확정 외의 작업을 할 수 있습니다.", tip: "초대를 잘못 보냈다면 “초대 취소”로 되돌려요.", mock: "members" },
  { id: "export", no: "06", title: "내보내고 공유하기", body: "확정된 정의서 화면에서 Excel로 받거나 PDF로 저장할 수 있어요. 고치고 다시 확정하면 새 판이 쌓이고, 수정 이력에서 이전 판을 볼 수 있습니다.", tip: "고객과 공유할 때는 PDF가 편해요.", mock: "export" },
] as const;

function Mock({ kind }: { kind: (typeof STEPS)[number]["mock"] }) {
  const base = "grid content-center gap-3 rounded-2xl border-2 border-[#111] bg-[#f6f6f3] p-5";
  if (kind === "project") return (
    <div className={base} aria-hidden>
      <span className="text-xs font-bold text-[#6c6a62]">프로젝트 이름</span>
      <span className="rounded-full border-2 border-[#111] bg-white px-4 py-2 text-sm">쇼핑몰 리뉴얼</span>
      <span className="w-fit rounded-full border-2 border-[#111] bg-[#ff5a14] px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0_#111]">+ 프로젝트 등록</span>
    </div>
  );
  if (kind === "upload") return (
    <div className={base} aria-hidden>
      <span className="grid h-20 place-items-center rounded-xl border-2 border-dashed border-[#111] bg-white text-xs font-semibold">쇼핑몰_요청서.docx</span>
      <span className="rounded-full border-2 border-[#111] bg-white px-4 py-2 text-xs text-[#6c6a62]">결제와 주문 중심으로 정리해 줘</span>
    </div>
  );
  if (kind === "review") return (
    <div className={base} aria-hidden>
      {[["REQ-001", "비회원도 장바구니에 담을 수 있다", false], ["REQ-002", "결제 응답은 3초 이내여야 한다", true]].map(([c, n, q]) => (
        <div key={String(c)} className={cn("flex flex-wrap items-center gap-2 rounded-xl border-2 border-[#111] bg-white px-3 py-2 text-xs", !q && "bg-[#f2f69a]")}>
          <span className="text-[#6c6a62]">{c}</span><span className="font-bold">{n}</span>{q && <Pill tone="orange" className="px-2 py-0 text-[10px]">확인 필요</Pill>}
        </div>
      ))}
    </div>
  );
  if (kind === "confirm") return (
    <div className={base} aria-hidden>
      <div className="flex items-center gap-2"><Pill tone="yellow">확정 대기</Pill><span className="text-xs text-[#6c6a62]">선택한 8개</span></div>
      <span className="w-fit rounded-full border-2 border-[#111] bg-[#ff5a14] px-4 py-1.5 text-xs font-bold text-white shadow-[2px_2px_0_#111]">요구사항 확정</span>
    </div>
  );
  if (kind === "members") return (
    <div className={base} aria-hidden>
      {[["김다나", "관리자"], ["이작성", "일반"]].map(([n, r]) => (
        <div key={n} className="flex items-center justify-between rounded-xl border-2 border-[#111] bg-white px-3 py-2 text-xs"><span className="font-bold">{n}</span><Pill>{r}</Pill></div>
      ))}
    </div>
  );
  return (
    <div className={base} aria-hidden>
      <div className="flex gap-2"><span className="rounded-full border-2 border-[#111] bg-white px-3 py-1 text-xs font-bold">Excel 받기</span><span className="rounded-full border-2 border-[#111] bg-white px-3 py-1 text-xs font-bold">PDF로 저장</span></div>
      <span className="text-xs text-[#6c6a62]">확정일 · 최종 확정인 · 요구사항 개수</span>
    </div>
  );
}

// 사용 가이드: 왼쪽 목차(큰 화면)와 여섯 단계. 각 단계에 화면 모양을 흉내 낸 그림을 붙였다.
export default function GuideView() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <article ref={root} className="mx-auto grid w-full max-w-[1100px] gap-16">
      <header className="grid gap-6 pt-4 sm:pt-10">
        <div data-hero><Pill tone="yellow" className="-rotate-2 shadow-[2px_2px_0_#111]">✦ Guide</Pill></div>
        <h1 data-hero className="text-[44px] leading-[1.05] tracking-[-0.05em] sm:text-[84px]">
          <span className="block font-light">처음이어도</span>
          <span className="block font-extrabold">여섯 단계면 끝</span>
        </h1>
        <p data-hero className="max-w-lg text-base leading-relaxed text-[#55534c]">프로젝트를 만들고 요구사항정의서를 확정해 내보내기까지, 순서대로 따라오세요.</p>
      </header>

      <div className="grid items-start gap-10 lg:grid-cols-[200px_1fr]">
        <nav aria-label="가이드 목차" className="lg:sticky lg:top-8">
          <ol className="flex flex-wrap gap-2 lg:grid">
            {STEPS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="inline-flex items-center gap-2 rounded-full border-2 border-transparent px-3 py-1.5 text-[13px] font-semibold transition-colors hover:border-[#111] hover:bg-[#f2f69a]"><span className="text-[#ff5a14]">{s.no}</span>{s.title}</a></li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-8">
          {STEPS.map((s) => (
            <section key={s.id} id={s.id} data-reveal className={cn(card, "grid scroll-mt-8 gap-6 sm:p-8 md:grid-cols-[1fr_0.9fr]")}>
              <div className="grid content-start gap-4">
                <span className="grid size-11 place-items-center rounded-full border-2 border-[#111] bg-[#ff5a14] font-extrabold text-white">{s.no}</span>
                <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{s.title}</h2>
                <p className="text-sm leading-relaxed text-[#55534c]">{s.body}</p>
                <p className="rounded-xl border-2 border-dashed border-[#111] bg-[#f2f69a] px-4 py-3 text-[13px] font-medium">💡 {s.tip}</p>
              </div>
              <Mock kind={s.mock} />
            </section>
          ))}
        </div>
      </div>

      <section data-reveal className="grid gap-5 rounded-[32px] border-2 border-[#111] bg-[#111] px-6 py-14 text-center text-white sm:py-16">
        <h2 className="text-3xl tracking-[-0.04em] sm:text-5xl"><span className="font-light">이제 직접</span> <span className="font-extrabold">해 볼까요?</span></h2>
        <div className="flex justify-center"><Btn href="/maemusae/projects" variant="primary" size="lg">프로젝트 만들러 가기 →</Btn></div>
      </section>
    </article>
  );
}
