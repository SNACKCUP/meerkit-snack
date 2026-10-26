"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { AiPromptInput } from "@/meerkit";

import { useMaemusae } from "../_lib/store";
import type { Candidate, CandidateKind, Priority, RequirementDoc } from "../_lib/types";
import { ConfirmDialog, ProDialog } from "./dialogs";
import { Btn, Pill, card, fmtTime } from "./ui";

const area = "w-full rounded-2xl border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-[#ff5a14]/40";

// 후보 목록 + 상세 편집 + 입력한 내용 리스트 + 다시 분류. 확정 전까지 팀이 함께 쓰는 작업대.
export function Workspace({ projectId, doc, isAdmin }: { projectId: string; doc: RequirementDoc; isAdmin: boolean }) {
  const updateCandidate = useMaemusae((x) => x.updateCandidate);
  const addCandidate = useMaemusae((x) => x.addCandidate);
  const removeCandidate = useMaemusae((x) => x.removeCandidate);
  const setLastViewed = useMaemusae((x) => x.setLastViewed);
  const addNote = useMaemusae((x) => x.addNote);
  const saveDraft = useMaemusae((x) => x.saveDraft);
  const refine = useMaemusae((x) => x.refine);
  const confirm = useMaemusae((x) => x.confirm);

  const [selectedId, setSelectedId] = useState<string | null>(doc.lastViewedId ?? doc.candidates[0]?.id ?? null);
  const [askConfirm, setAskConfirm] = useState(false);
  const [pro, setPro] = useState(false);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const listRef = useRef<HTMLUListElement>(null);
  const focusText = useRef("");

  const selected = doc.candidates.find((c) => c.id === selectedId) ?? null;
  const included = doc.candidates.filter((c) => c.included);
  const openQuestions = included.filter((c) => c.question).length;

  // 다시 들어오면 마지막으로 보던 후보를 목록 가운데로 가져온다
  useEffect(() => {
    if (!doc.lastViewedId) return;
    const el = itemRefs.current[doc.lastViewedId];
    const box = listRef.current;
    if (el && box) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
    // 처음 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    setLastViewed(projectId, id);
  };
  const patch = (p: Partial<Candidate>) => selected && updateCandidate(projectId, selected.id, p);
  // 입력창을 벗어날 때: 임시저장하고, 내용이 바뀌었으면 "입력한 내용"에 남긴다
  const blurField = (label: string, value: string) => {
    saveDraft(projectId);
    if (selected && value.trim() && value !== focusText.current) addNote(projectId, selected.id, `${label}: ${value.trim()}`);
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3" data-rise>
        <p className="text-sm text-[#6c6a62]">
          선택한 {included.length}개{openQuestions > 0 && <> · 확인이 필요한 질문 <b className="text-[#c2410c]">{openQuestions}</b>개</>}
          {doc.savedAt && <span className="ml-2">· {fmtTime(doc.savedAt)} 저장됨</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" onClick={() => setPro(true)}>수정 이력</Btn>
          <Btn size="sm" onClick={() => { saveDraft(projectId); toast.success("임시 저장했어요."); }}>임시 저장</Btn>
          {isAdmin ? (
            <Btn size="sm" variant="primary" disabled={included.length === 0} onClick={() => setAskConfirm(true)}>요구사항 확정</Btn>
          ) : (
            <span className="inline-flex items-center text-xs text-[#6c6a62]" title="확정은 프로젝트 관리자만 할 수 있어요">확정은 관리자만 할 수 있어요</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" data-rise>
        <section aria-label="요구사항 후보" className={`${card} flex max-h-[560px] flex-col gap-3 p-4`}>
          <div className="flex items-center justify-between px-2">
            <h2 className="font-extrabold">후보 {doc.candidates.length}</h2>
            <Btn size="sm" onClick={() => { const id = addCandidate(projectId); select(id); }}>+ 직접 추가</Btn>
          </div>
          <ul ref={listRef} className="relative grid gap-2 overflow-y-auto pr-1">
            {doc.candidates.map((c) => (
              <li key={c.id} ref={(el) => { itemRefs.current[c.id] = el; }} className={`flex items-start gap-3 rounded-2xl border-[1.5px] p-3 ${c.id === selectedId ? "border-[#111] bg-[#f2f69a]" : "border-[#111]/20 bg-white"}`}>
                <Checkbox checked={c.included} aria-label={`${c.name} 포함`} onCheckedChange={(v) => { updateCandidate(projectId, c.id, { included: v === true }); saveDraft(projectId); }} className="mt-1" />
                <button type="button" onClick={() => select(c.id)} className="grid flex-1 gap-1 text-left" aria-current={c.id === selectedId}>
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span className="text-xs text-[#6c6a62]">{c.code}</span>{c.name}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    <Pill>{c.kind}</Pill><Pill>{c.priority}</Pill>
                    {c.question && <Pill tone="orange">확인 필요</Pill>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="요구사항 상세" className={`${card} grid content-start gap-4`}>
          {!selected ? (
            <p className="py-10 text-center text-sm text-[#6c6a62]">왼쪽에서 요구사항을 고르면 자세히 볼 수 있어요.</p>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 gap-1">
                  <label htmlFor="c-name" className="text-xs font-extrabold text-[#6c6a62]">{selected.code} 이름</label>
                  <Input id="c-name" value={selected.name} onChange={(e) => patch({ name: e.target.value })} onFocus={(e) => (focusText.current = e.target.value)} onBlur={(e) => blurField("이름", e.target.value)} className="rounded-xl border-[1.5px] border-[#111] bg-white" />
                </div>
                <Btn size="sm" variant="ghost" onClick={() => { removeCandidate(projectId, selected.id); setSelectedId(null); }}>삭제</Btn>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-extrabold text-[#6c6a62]">구분
                  <NativeSelect value={selected.kind} onChange={(e) => patch({ kind: e.target.value as CandidateKind })} onBlur={() => saveDraft(projectId)} className="rounded-xl border-[1.5px] border-[#111] font-normal text-[#111]">
                    <option>기능</option><option>비기능</option>
                  </NativeSelect>
                </label>
                <label className="grid gap-1 text-xs font-extrabold text-[#6c6a62]">우선순위
                  <NativeSelect value={selected.priority} onChange={(e) => patch({ priority: e.target.value as Priority })} onBlur={() => saveDraft(projectId)} className="rounded-xl border-[1.5px] border-[#111] font-normal text-[#111]">
                    <option>높음</option><option>중간</option><option>낮음</option>
                  </NativeSelect>
                </label>
              </div>
              <div className="grid gap-1">
                <label htmlFor="c-desc" className="text-xs font-extrabold text-[#6c6a62]">설명</label>
                <textarea id="c-desc" rows={4} value={selected.description} onChange={(e) => patch({ description: e.target.value })} onFocus={(e) => (focusText.current = e.target.value)} onBlur={(e) => blurField("설명", e.target.value)} className={area} />
              </div>
              <blockquote className="rounded-2xl bg-[#ebeae4] px-4 py-3 text-sm text-[#55534c]"><span className="mb-1 block text-xs font-extrabold text-[#6c6a62]">문서에서 찾은 근거</span>{selected.quote}</blockquote>
              {selected.question && (
                <div className="grid gap-2 rounded-2xl border-[1.5px] border-[#ff5a14] bg-[#fff3ec] p-4">
                  <label htmlFor="c-answer" className="text-sm font-semibold">AI의 질문 · {selected.question}</label>
                  <textarea id="c-answer" rows={2} placeholder="답을 적고 아래에서 다시 분류하면 반영돼요" value={selected.answer} onChange={(e) => patch({ answer: e.target.value })} onFocus={(e) => (focusText.current = e.target.value)} onBlur={(e) => blurField("답변", e.target.value)} className={area} />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <section aria-label="입력한 내용 리스트" className={`${card} grid gap-3`} data-rise>
        <h2 className="font-extrabold">입력한 내용 <span className="text-sm font-normal text-[#6c6a62]">· 누르면 해당 요구사항으로 이동해요</span></h2>
        {doc.notes.length === 0 ? (
          <p className="text-sm text-[#6c6a62]">상세 칸에 내용을 적고 벗어나면 여기에 쌓여요.</p>
        ) : (
          <ul className="grid max-h-48 gap-1.5 overflow-y-auto">
            {doc.notes.map((n) => {
              const target = doc.candidates.find((c) => c.id === n.candidateId);
              return (
                <li key={n.id}>
                  <button type="button" disabled={!target} onClick={() => select(n.candidateId)} className="flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-[#ebeae4] disabled:opacity-50">
                    <span className="shrink-0 text-xs text-[#6c6a62]">{target?.code ?? "삭제됨"}</span>
                    <span className="flex-1 truncate">{n.text}</span>
                    <span className="shrink-0 text-xs text-[#6c6a62]">{n.author} · {fmtTime(n.at)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <AiPromptInput
          placeholder="고객에게 새로 받은 내용이나 AI의 질문에 대한 답을 적고, 필요하면 파일도 붙여요"
          requireText={false}
          submitLabel="다시 분류"
          onSubmit={(msg, files) => refine(projectId, msg, files.map((f) => f.name))}
        />
      </section>

      <ConfirmDialog
        open={askConfirm}
        onOpenChange={setAskConfirm}
        title="요구사항을 확정할까요?"
        body={<>선택한 {included.length}개로 요구사항정의서를 만들어요. 확정한 뒤에도 관리자는 다시 열어 고칠 수 있어요.{openQuestions > 0 && <> 아직 답하지 않은 질문이 {openQuestions}개 있어요.</>}</>}
        confirmLabel="확정"
        onConfirm={() => { const r = confirm(projectId); if (!r.ok) toast.error(r.error); setAskConfirm(false); }}
      />
      <ProDialog open={pro} onOpenChange={setPro} />
    </div>
  );
}

export const ANALYZING_LABELS = ["문서를 읽는 중", "요구사항을 가려내는 중", "모호한 부분을 찾는 중", "후보를 정리하는 중"];
export const CONFIRMING_LABELS = ["선택한 요구사항을 모으는 중", "정의서를 만드는 중"];
