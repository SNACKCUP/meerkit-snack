"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, CircleHelp, Download, FileText, SlidersVertical, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { AiPromptInput } from "@/meerkit/ai/AiPromptInput";
import { ThinkingOrb } from "@/meerkit/ai/ThinkingOrb";
import { UserAvatar } from "@/meerkit/auth/components/UserAvatar";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────
   Maemusae · workspace home (the first screen after sign-in)
   Screen only. All data is mock data and buttons do nothing.
   The palette below is scoped to this page and does not touch the Meerkit theme.
   ───────────────────────────────────────────────────────────── */

const INK = "#111111";
const ORANGE = "#ff5a14";
const PAPER = "#f6f6f3";

// Meerkit components (AI input, checkbox, dropzone) follow these tokens too.
const THEME = {
  "--mk-background": PAPER,
  "--mk-foreground": INK,
  "--mk-card": "#ffffff",
  "--mk-surface": "#ffffff",
  "--mk-muted": "#eceae2",
  "--mk-muted-foreground": "#6c6a62",
  "--mk-accent": "#eceae2",
  "--mk-border": "#d3d0c4",
  "--mk-primary": INK,
  "--mk-primary-foreground": "#ffffff",
  "--mk-brand": ORANGE,
  "--mk-radius": "1rem",
  "--mk-shadow-soft": "none",
  fontFamily: '"Hanken Grotesk", "Pretendard Variable", Pretendard, "Helvetica Neue", Arial, sans-serif',
} as React.CSSProperties;

const ME = { name: "김다나", nickname: null, avatar_url: null };
const NAV = ["프로젝트", "요구사항", "기능정의서", "내보내기"];

type StepState = "done" | "active" | "todo";
const STEPS: { title: string; owner: "관리자" | "AI" | "웹 · Excel"; stat: string; state: StepState; desc: string }[] = [
  { title: "문서 업로드", owner: "관리자", stat: "문서 6건", state: "done", desc: "텍스트, docx, pdf를 Markdown으로 변환해요." },
  { title: "분류 · 정제", owner: "AI", stat: "후보 68건", state: "done", desc: "기능/비기능으로 나누고 근거 문장과 확인 질문을 달아요." },
  { title: "선택 · 확정", owner: "관리자", stat: "42 / 68건 확정", state: "active", desc: "필요한 항목을 고르고 고쳐서 확정해요." },
  { title: "기능정의서", owner: "AI", stat: "대기", state: "todo", desc: "확정된 요구사항마다 기능을 만들고 연결해요." },
  { title: "내보내기", owner: "웹 · Excel", stat: "대기", state: "todo", desc: "웹에서 보거나 Excel 3종으로 받아요." },
];

const CANDIDATES = [
  { id: "REQ-041", name: "비회원도 장바구니에 상품을 담을 수 있다", kind: "기능", priority: "높음", quote: "로그인 안 해도 일단 담아 둘 수 있었으면 해요", question: null },
  { id: "REQ-042", name: "결제 응답은 3초 이내여야 한다", kind: "비기능", priority: "중간", quote: "결제가 너무 느려서 중간에 나가요", question: "3초는 평균인가요, 최대인가요?" },
  { id: "REQ-043", name: "주문 내역을 기간별로 조회한다", kind: "기능", priority: "높음", quote: "지난달 주문만 따로 보고 싶어요", question: null },
  { id: "REQ-044", name: "상품 후기에 사진을 첨부한다", kind: "기능", priority: "낮음", quote: "후기에 사진도 올릴 수 있으면 좋겠어요", question: "사진은 최대 몇 장까지인가요?" },
  { id: "REQ-045", name: "개인정보는 암호화해서 저장한다", kind: "비기능", priority: "중간", quote: "고객 정보가 안전하게 보관돼야 해요", question: null },
  { id: "REQ-046", name: "관리자가 쿠폰을 발급한다", kind: "기능", priority: "중간", quote: "이벤트 때 쿠폰을 직접 뿌리고 싶어요", question: null },
];

const AI_JOBS = [
  { name: "결제_개선_요구사항.docx", step: "분류 중", pct: 72, active: true },
  { name: "배송_정책_회의록.pdf", step: "Markdown 변환 중", pct: 38, active: true },
  { name: "고객_인터뷰_메모.txt", step: "대기 중", pct: 0, active: false },
];

const RECENT = [
  { name: "쇼핑몰_리뉴얼_요청서.docx", meta: "Markdown 변환 완료 · 2시간 전" },
  { name: "운영팀_요청_메모.txt", meta: "후보 24건 추출 · 어제" },
];

const TRACE = [
  { req: "REQ-012", funcs: ["FN-021 상품 목록 조회", "FN-022 상품 검색"] },
  { req: "REQ-015", funcs: ["FN-031 장바구니 담기"] },
  { req: "REQ-018", funcs: ["FN-040 주문 생성", "FN-041 결제 요청"] },
];

const EXPORTS = [
  { name: "요구사항 정의서", meta: ".xlsx · 42행 · 준비됨", ready: true },
  { name: "기능정의서", meta: ".xlsx · 생성 후 다운로드", ready: false },
  { name: "추적표", meta: ".xlsx · 생성 후 다운로드", ready: false },
];

const ACTIVITY = [
  { time: "10:42", text: "김다나 님이 REQ-043을 확정", tone: "bg-[#111]" },
  { time: "10:15", text: "AI가 확인 질문 3건을 표시", tone: "bg-[#ff5a14]" },
  { time: "09:50", text: "쇼핑몰_리뉴얼_요청서.docx 변환 완료", tone: "bg-[#f2f69a] border-[1.5px] border-[#111]" },
];

const BARS = [34, 52, 28, 76, 46, 88, 40];

// Outlined card: the signature container of this page.
const card = "rounded-[28px] border-[1.5px] border-[#111] bg-white p-6";
const pill = "inline-flex items-center rounded-full border-[1.5px] border-[#111] px-3 py-1 text-xs font-medium";

export default function MaemusaePage() {
  const root = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [picked, setPicked] = useState<string[]>(["REQ-041", "REQ-043"]);
  const [files, setFiles] = useState<File[]>([]);
  const [agent, setAgent] = useState("auto");

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  useEffect(() => {
    const scope = root.current;
    if (!scope) return;
    const still = document.documentElement.dataset.mkMotion === "off" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return; // the markup already shows the final state

    const ctx = gsap.context(() => {
      // Headline: each line slides up out of a mask.
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .from("[data-nav]", { y: -20, opacity: 0, duration: 0.7 })
        .from("[data-h]", { yPercent: 115, duration: 1, stagger: 0.12 }, 0.1)
        .from("[data-fade]", { y: 18, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.55)
        .from("[data-tile]", { scale: 0.88, opacity: 0, duration: 1, ease: "power3.out" }, 0.25)
        .from("[data-pop]", { scale: 0.5, opacity: 0, duration: 0.7, stagger: 0.09, ease: "back.out(1.8)" }, 0.6)
        .from("[data-drawy]", { scaleY: 0, transformOrigin: "top center", duration: 0.9, ease: "power2.inOut" }, 0.7)
        .from("[data-sticker]", { y: 60, rotation: 8, opacity: 0, duration: 0.9, ease: "back.out(1.5)" }, 0.9);

      // Things that keep moving a little.
      gsap.to("[data-sticker]", { rotation: "-=2.4", duration: 2.2, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1.8 });
      gsap.to("[data-orb]", { y: -10, duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.utils.toArray<HTMLElement>("[data-bar]").forEach((el, i) => {
        gsap.fromTo(el, { scaleY: 0.35 }, { scaleY: 1, transformOrigin: "bottom center", duration: 0.9 + (i % 3) * 0.35, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.12 });
      });

      // Sections reveal as they scroll into view.
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 92%",
        once: true,
        onEnter: (els) => gsap.from(els, { y: 56, opacity: 0, duration: 0.95, stagger: 0.12, ease: "power3.out", clearProps: "transform,opacity" }),
      });

      // Workflow: the dotted track draws, then the steps pop in.
      gsap
        .timeline({ scrollTrigger: { trigger: "[data-flow]", start: "top 80%", once: true } })
        .from("[data-drawx]", { scaleX: 0, transformOrigin: "left center", duration: 1.3, ease: "power2.inOut" })
        .from("[data-node]", { scale: 0, duration: 0.6, stagger: 0.14, ease: "back.out(2)" }, 0.1)
        .from("[data-step]", { y: 24, opacity: 0, duration: 0.7, stagger: 0.12 }, 0.2);

      // Numbers count up, segments fill, bars grow.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 95%", once: true }, onUpdate: () => { el.textContent = String(Math.round(o.v)); } });
      });
      gsap.from("[data-seg]", { scaleY: 0, transformOrigin: "bottom center", duration: 0.5, stagger: 0.03, ease: "power2.out", scrollTrigger: { trigger: "[data-seg]", start: "top 95%", once: true } });
      gsap.from("[data-progress]", { width: "0%", duration: 1.4, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: "[data-progress]", start: "top 95%", once: true } });

      // Hover lift.
      gsap.utils.toArray<HTMLElement>("[data-hover]").forEach((el) => {
        const up = gsap.to(el, { y: -5, duration: 0.4, ease: "power3.out", paused: true });
        el.addEventListener("mouseenter", () => up.play());
        el.addEventListener("mouseleave", () => up.reverse());
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  // The selected count pops when it changes.
  useEffect(() => {
    if (!countRef.current || document.documentElement.dataset.mkMotion === "off") return;
    gsap.fromTo(countRef.current, { scale: 1.5 }, { scale: 1, duration: 0.55, ease: "back.out(2.4)" });
  }, [picked.length]);

  return (
    <div ref={root} style={THEME} className="min-h-screen bg-[#d9d9d6] px-3 py-3 text-[#111] antialiased sm:px-6 sm:py-8">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;800&display=swap" />

      <div className="mx-auto max-w-[1240px] rounded-[32px] bg-[#f6f6f3] px-5 pb-10 pt-5 sm:px-12 sm:pt-7">
        {/* ── Nav ── */}
        <header data-nav className="flex items-center gap-6">
          <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
            <span className="grid size-10 place-items-center rounded-full bg-[#111] text-white">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 18V7l8 7 8-7v11" /></svg>
            </span>
            매무새
          </a>
          <nav className="ml-6 hidden items-center gap-7 text-[13px] md:flex">
            {NAV.map((n) => (
              <a key={n} href="#" onClick={(e) => e.preventDefault()} className="transition-opacity hover:opacity-60">{n}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <button className="hidden items-center gap-1 text-[13px] sm:flex">도움말 <ChevronDown className="size-3.5" /></button>
            <button className="flex items-center gap-2 rounded-full border-[1.5px] border-[#111] py-1 pl-1 pr-4 text-[13px] font-medium transition-colors hover:bg-[#111] hover:text-white">
              <UserAvatar user={ME} size="sm" /> {ME.name}
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <section className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <h1 className="text-[42px] leading-[1.08] tracking-[-0.04em] sm:text-[60px]">
              <span className="block overflow-hidden pb-1"><span data-h className="block font-light">모호한 요청을</span></span>
              <span className="block overflow-hidden pb-1"><span data-h className="block font-extrabold">명확한 정의서로</span></span>
            </h1>
            <p data-fade className="mt-6 max-w-sm text-[15px] leading-relaxed text-[#55534c]">
              고객이 보낸 문서를 올리면 AI가 요구사항을 가려내고, 확정은 사람이 하고, 기능정의서는 알아서 만들어져요.
            </p>
            <div data-fade className="mt-8 flex flex-wrap items-center gap-6">
              <button className="group inline-flex items-center gap-3 rounded-full border-[1.5px] border-[#111] bg-[#ff5a14] py-3.5 pl-7 pr-6 text-[14px] font-semibold text-white transition-transform hover:scale-[1.04]">
                새 프로젝트 <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </button>
              <div className="flex items-center gap-4">
                <span className="text-[34px] font-medium leading-none tracking-tight"><span data-count="26">26</span></span>
                <span className="h-9 w-px bg-[#111]/40" />
                <span className="text-[11px] leading-tight text-[#55534c]">확정을 기다리는<br />요구사항</span>
              </div>
            </div>
          </div>

          {/* Collage */}
          <div className="relative mx-auto hidden h-[470px] w-full max-w-[560px] md:block">
            {/* REQ tag with a dotted stem */}
            <div data-pop className="absolute left-0 top-0 z-20 w-[128px] rounded-[20px] border-[1.5px] border-[#111] bg-white p-3.5">
              <span className="grid size-7 place-items-center rounded-full bg-[#ff5a14] text-[11px] font-bold text-white">41</span>
              <p className="mt-3 text-[15px] font-semibold tracking-tight">REQ-041 <span className="text-[#ff5a14]">↑</span></p>
              <p className="text-[11px] text-[#6c6a62]">우선순위 높음</p>
            </div>
            <div data-drawy className="absolute left-[26px] top-[110px] h-[300px] border-l-2 border-dotted border-[#111]" />
            <div data-pop className="absolute left-[14px] top-[392px] grid size-6 place-items-center rounded-full border-[1.5px] border-[#111] bg-white"><span className="size-2 rounded-full bg-[#111]" /></div>

            <p data-fade className="absolute left-[160px] top-[6px] z-10 text-[13px] font-extrabold uppercase leading-[1.15] tracking-tight">Ready<br />to review</p>

            {/* Main tile with the orb */}
            <div data-tile className="absolute left-[78px] top-[96px] h-[320px] w-[330px] overflow-hidden rounded-[36px] bg-[#e3dfd1]">
              <div data-orb className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 text-[#111]"><ThinkingOrb state="composing" size={230} /></div>
            </div>
            {/* Sticker */}
            <div className="absolute bottom-[40px] left-[96px] z-20 h-[78px] w-[340px] rounded-[26px] bg-[#111]" />
            <div data-sticker className="absolute bottom-[50px] left-[104px] z-30 w-[330px] -rotate-[5deg] rounded-[24px] bg-[#f2f69a] px-6 py-4 text-center text-[16px] font-extrabold tracking-tight">
              확인해 보셨나요?
            </div>

            {/* Bars tile */}
            <div data-pop className="absolute right-0 top-[10px] z-10 flex h-[120px] w-[120px] items-end justify-center gap-[7px] rounded-[28px] bg-[#111] px-5 pb-5">
              {BARS.map((h, i) => (
                <span key={i} data-bar className={cn("w-[5px] rounded-full", i === 5 ? "bg-[#f2f69a]" : "bg-white/25")} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div data-pop className="absolute right-[20px] top-[132px] z-20 inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-[#111] bg-white px-3 py-1.5 text-[12px] font-semibold">
              <Star className="size-3.5 fill-[#f2f69a] stroke-[#111]" /> 9건 확인 필요
            </div>
            <div data-drawy className="absolute right-[34px] top-[236px] h-[70px] border-l-2 border-dotted border-[#111]" />
            <span data-pop className="absolute right-[30px] top-[226px] size-2.5 rounded-full bg-[#111]" />
            <SlidersVertical data-pop className="absolute right-[26px] top-[320px] size-6" />
          </div>
        </section>

        {/* ── Overview ── */}
        <section data-reveal className="mt-16 grid gap-5 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className={cn(card, "flex flex-col justify-between")}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium">확정 완료</p>
              <span className={cn(pill, "bg-[#f2f69a]")}>62%</span>
            </div>
            <div>
              <p className="mt-6 text-[56px] font-light leading-none tracking-[-0.03em]"><span data-count="42">42</span><span className="text-[28px] text-[#6c6a62]"> / 68</span></p>
              <div className="mt-5 flex gap-[3px]">
                {Array.from({ length: 24 }, (_, i) => (
                  <span key={i} data-seg className={cn("h-7 flex-1 rounded-[3px]", i < 15 ? "bg-[#111]" : "bg-[#e4e1d6]")} />
                ))}
              </div>
              <p className="mt-3 text-xs text-[#6c6a62]">이번 주 +11건</p>
            </div>
          </div>
          <div className={cn(card, "flex flex-col justify-between bg-[#e3dfd1]")}>
            <p className="text-sm font-medium">확인 질문</p>
            <p className="mt-6 text-[56px] font-light leading-none tracking-[-0.03em]"><span data-count="9">9</span></p>
            <p className="mt-6 text-xs text-[#55534c]">AI가 사람의 판단을 기다리는 모호한 항목이에요.</p>
          </div>
          <div className="flex flex-col justify-between rounded-[28px] bg-[#111] p-6 text-white">
            <p className="text-sm font-medium">업로드 문서</p>
            <p className="mt-6 text-[56px] font-light leading-none tracking-[-0.03em]"><span data-count="6">6</span></p>
            <p className="mt-6 text-xs text-white/60">변환 4건 · 진행 2건</p>
          </div>
        </section>

        {/* ── Workflow ── */}
        <section data-flow className="mt-20">
          <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr] lg:items-end">
            <h2 className="text-[40px] leading-[1.05] tracking-[-0.03em]"><span className="font-light">다섯 단계,</span><br /><span className="font-extrabold">담당은 둘.</span></h2>
            <p className="max-w-md text-[15px] leading-relaxed text-[#55534c] lg:justify-self-end">사람은 결정하고, AI는 무거운 일을 맡아요. 넘기는 순간이 모두 보여서 고객 메일에서 확정된 정의서까지 아무것도 놓치지 않아요.</p>
          </div>
          <div className="relative mt-10">
            <div data-drawx className="absolute left-[10%] right-[10%] top-[15px] hidden border-t-2 border-dotted border-[#111] md:block" />
            <ol className="relative grid gap-5 md:grid-cols-5">
              {STEPS.map((s, i) => (
                <li key={s.title} data-step className="flex flex-col">
                  <div className="flex items-center gap-3 md:justify-center">
                    <span data-node className={cn("grid size-8 place-items-center rounded-full border-[1.5px] border-[#111] text-xs font-bold", s.state === "done" && "bg-[#111] text-white", s.state === "active" && "bg-[#ff5a14] text-white", s.state === "todo" && "bg-white")}>
                      {s.state === "done" ? <Check className="size-4" /> : i + 1}
                    </span>
                    {s.state === "active" && <span className={cn(pill, "bg-[#f2f69a]")}>진행 중</span>}
                  </div>
                  <div data-hover className={cn("mt-4 flex-1 rounded-[24px] border-[1.5px] border-[#111] p-4", s.state === "active" ? "bg-[#f2f69a]" : "bg-white")}>
                    <span className={cn(pill, "px-2.5 py-0.5 text-[11px]", s.owner === "AI" ? "bg-[#111] text-white" : "bg-white")}>{s.owner}</span>
                    <p className="mt-3 text-[16px] font-semibold leading-tight tracking-tight">{s.title}</p>
                    <p className="mt-1.5 text-[12px] leading-snug text-[#55534c]">{s.desc}</p>
                    <p className={cn("mt-4 text-sm font-semibold", s.state === "todo" && "text-[#9a978c]")}>{s.stat}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Sign-off + side stack ── */}
        <section className="mt-20 grid gap-5 lg:grid-cols-12">
          <div data-reveal className="rounded-[32px] border-[1.5px] border-[#111] bg-[#e3dfd1] p-6 lg:col-span-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className={cn(pill, "bg-white")}>SIGN-OFF</span>
                <h2 className="mt-4 text-[30px] leading-[1.05] tracking-[-0.02em]"><span className="font-light">확정을 기다리는</span> <span className="font-extrabold">요구사항</span></h2>
              </div>
              <p className="hidden max-w-[200px] text-right text-xs text-[#55534c] sm:block">필요한 항목을 고르고 문구를 고친 뒤 확정하세요.</p>
            </div>
            <ul className="mt-6 grid gap-2.5">
              {CANDIDATES.map((c) => {
                const on = picked.includes(c.id);
                return (
                  <li key={c.id}>
                    <label className={cn("flex cursor-pointer items-start gap-3.5 rounded-[20px] border-[1.5px] p-4 transition-all duration-300", on ? "border-[#111] bg-white" : "border-transparent bg-white/55 hover:bg-white/90")}>
                      <Checkbox checked={on} onCheckedChange={() => toggle(c.id)} className="mt-1 rounded-full" aria-label={`${c.id} 선택`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] text-[#6c6a62]">{c.id}</span>
                          <span className={cn(pill, "px-2 py-0 text-[11px]", c.kind === "기능" ? "bg-white" : "bg-[#111] text-white")}>{c.kind}</span>
                          <span className={cn(pill, "px-2 py-0 text-[11px]", c.priority === "높음" ? "border-[#ff5a14] bg-[#ff5a14] text-white" : c.priority === "중간" ? "bg-[#f2f69a]" : "bg-white")}>{c.priority}</span>
                          {c.question && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff5a14]"><CircleHelp className="size-3.5" /> 판단 필요</span>}
                        </div>
                        <p className="mt-2 text-[16px] font-semibold leading-snug tracking-tight">{c.name}</p>
                        <p className="mt-1 truncate text-[12px] italic text-[#6c6a62]">“{c.quote}”</p>
                        {c.question && <p className="mt-2 rounded-xl bg-[#f2f69a] px-3 py-1.5 text-xs font-medium">{c.question}</p>}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-center justify-between rounded-full bg-[#111] py-2 pl-6 pr-2 text-white">
              <p className="text-sm"><span ref={countRef} className="mr-1 inline-block text-lg font-semibold">{picked.length}</span> 건 선택됨</p>
              <button className="group inline-flex items-center gap-2 rounded-full bg-[#ff5a14] px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-[1.04]">
                요구사항 확정 <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          <div className="grid gap-5 lg:col-span-5 lg:content-start">
            <div data-reveal className={card}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">AI가 작업 중</h3>
                <span className="text-[#111]"><ThinkingOrb state="searching" size={36} /></span>
              </div>
              <ul className="mt-5 grid gap-4">
                {AI_JOBS.map((j) => (
                  <li key={j.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-[13px]">
                      <span className="flex min-w-0 items-center gap-2"><FileText className="size-4 shrink-0" /><span className="truncate font-medium">{j.name}</span></span>
                      <span className={cn("shrink-0 text-xs", j.active ? "font-semibold text-[#ff5a14]" : "text-[#9a978c]")}>{j.step}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#ecebe4]">
                      <div data-progress style={{ width: `${j.pct}%` }} className="h-full rounded-full bg-[#111]" />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-[#f2f69a] px-4 py-3 text-xs font-medium">
                <span>오늘 처리한 문서 4건</span><span>건당 약 2분</span>
              </div>
            </div>

            <div data-reveal className={card}>
              <h3 className="text-lg font-semibold tracking-tight">문서 추가</h3>
              <div className="mt-4">
                <FileDropzone value={files} onChange={setFiles} accept=".txt,.docx,.pdf" maxFiles={5} label="고객 문서를 끌어다 놓거나 눌러서 고르세요" hint=".docx · .pdf · .txt, 텍스트 붙여넣기도 가능" />
              </div>
              <ul className="mt-4 grid gap-2">
                {RECENT.map((r) => (
                  <li key={r.name} className="flex items-center gap-3 rounded-2xl bg-[#f3f2ec] px-3 py-2.5">
                    <span className="grid size-8 place-items-center rounded-full bg-[#111] text-white"><FileText className="size-3.5" /></span>
                    <div className="min-w-0"><p className="truncate text-[13px] font-medium">{r.name}</p><p className="text-[11px] text-[#6c6a62]">{r.meta}</p></div>
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal className={card}>
              <h3 className="text-lg font-semibold tracking-tight">오늘</h3>
              <ul className="relative mt-5 grid gap-5">
                <span className="absolute bottom-2 left-[5px] top-2 border-l-2 border-dotted border-[#111]" />
                {ACTIVITY.map((a) => (
                  <li key={a.text} className="relative flex items-center gap-4 pl-6">
                    <span className={cn("absolute left-0 size-3 rounded-full", a.tone)} />
                    <span className="w-11 font-mono text-[11px] text-[#6c6a62]">{a.time}</span>
                    <span className="text-[13px] font-medium">{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Trace + Export ── */}
        <section className="mt-5 grid gap-5 lg:grid-cols-12">
          <div data-reveal className={cn(card, "lg:col-span-7")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className={cn(pill, "bg-white")}>FUNCTIONAL SPEC</span>
                <h2 className="mt-4 text-[30px] leading-[1.05] tracking-[-0.02em]"><span className="font-light">요구사항마다</span><br /><span className="font-extrabold">기능으로 이어져요</span></h2>
              </div>
              <span className={cn(pill, "bg-[#111] text-white")}>AI generated</span>
            </div>
            <ul className="mt-7 grid gap-3">
              {TRACE.map((t) => (
                <li key={t.req} className="flex flex-wrap items-center gap-3">
                  <span className={cn(pill, "bg-[#f2f69a] font-mono")}>{t.req}</span>
                  <span className="hidden h-0 w-12 border-t-2 border-dotted border-[#111] sm:block" />
                  <span className="hidden size-2.5 rounded-full bg-[#111] sm:block" />
                  <div className="flex flex-wrap gap-2">
                    {t.funcs.map((f) => <span key={f} className="rounded-full bg-[#f1f0ea] px-3.5 py-1.5 text-xs font-medium">{f}</span>)}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-[#6c6a62]">기능 ID · 기능명 · 설명 · 입력/출력 · 처리 규칙이 원 요구사항과 함께 정리돼요.</p>
          </div>

          <div data-reveal className="rounded-[32px] bg-[#111] p-6 text-white lg:col-span-5">
            <span className="inline-flex items-center rounded-full border-[1.5px] border-white/40 px-3 py-1 text-xs font-medium">EXPORT</span>
            <h2 className="mt-4 text-[30px] leading-[1.05] tracking-[-0.02em]"><span className="font-light">어디로든</span> <span className="font-extrabold">내보내기</span></h2>
            <ul className="mt-6 grid gap-2.5">
              {EXPORTS.map((e) => (
                <li key={e.name} className={cn("flex items-center gap-3 rounded-[20px] p-3 pl-4", e.ready ? "bg-white text-[#111]" : "bg-white/10 text-white/50")}>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{e.name}</p>
                    <p className={cn("text-[11px]", e.ready ? "text-[#6c6a62]" : "text-white/40")}>{e.meta}</p>
                  </div>
                  <button disabled={!e.ready} aria-label={`${e.name} 다운로드`} className="grid size-10 place-items-center rounded-full bg-[#ff5a14] text-white transition-transform enabled:hover:scale-110 disabled:bg-white/15 disabled:text-white/40">
                    <Download className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <button className="mt-4 flex w-full items-center justify-between rounded-full border-[1.5px] border-white/40 px-5 py-3 text-sm font-medium transition-colors hover:bg-white hover:text-[#111]">
              웹에서 보기 <ArrowUpRight className="size-4" />
            </button>
          </div>
        </section>

        {/* ── Assistant ── */}
        <section data-reveal className="mt-20 grid items-center gap-8 lg:grid-cols-[0.8fr_1.4fr]">
          <div>
            <span className={cn(pill, "bg-[#f2f69a]")}>ASSISTANT</span>
            <h2 className="mt-4 text-[38px] leading-[1.05] tracking-[-0.03em]"><span className="font-light">아직 헷갈리세요?</span><br /><span className="font-extrabold">물어보세요.</span></h2>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-[#55534c]">요구사항을 더 또렷하게 다듬거나, 측정 가능한 기준을 제안받거나, 고객에게 되물을 질문을 만들어 달라고 해 보세요.</p>
          </div>
          <AiPromptInput onSubmit={() => {}} glow={false} placeholder="예: REQ-042의 응답 시간 기준을 구체적으로 제안해 줘" agents={[{ id: "auto", label: "자동 선택", description: "요청에 맞는 에이전트를 고릅니다" }, { id: "refine", label: "요구사항 정제" }, { id: "func", label: "기능정의서 작성" }]} agent={agent} onAgentChange={setAgent} attachments={false} />
        </section>

        <footer className="mt-16 flex items-center justify-between border-t border-[#111]/15 pt-5 text-[12px] text-[#6c6a62]">
          <span>매무새 — Meerkit 위에 얹은 샘플 서비스</span>
          <span>© 2026</span>
        </footer>
      </div>
    </div>
  );
}
