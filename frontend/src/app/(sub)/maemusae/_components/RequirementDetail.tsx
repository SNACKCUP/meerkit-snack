"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

import type { ApiNote, ApiRequirementDetail, NoteField, RequirementChanges } from "../_lib/api";
import { usePriorities, useReqKinds } from "../_lib/queries";
import { Btn, Pill, fmtTime } from "./ui";

const area = "w-full rounded-2xl border-[1.5px] border-[#111] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-[#ff5a14]/40 disabled:opacity-60";
const FIELD_LABEL: Record<NoteField, string> = { DESCRIPTION: "설명", ANSWER: "AI 질문 답변" };

/**
 * 후보 하나의 상세. 이름·설명은 칸을 벗어날 때 저장하고(바뀐 칸만, version을 같이 보냄),
 * 설명·답변 칸은 "입력한 내용"에도 내 입력으로 남는다 (사람마다 칸마다 한 건).
 * key로 후보 id를 받아, 다른 후보를 고르면 새로 그린다.
 */
export function RequirementDetail({
  detail,
  readOnly,
  onSave,
  onNote,
  onDelete,
}: {
  detail: ApiRequirementDetail;
  readOnly: boolean;
  onSave: (changes: RequirementChanges) => void;
  onNote: (field: NoteField, text: string | null) => void;
  onDelete: () => void;
}) {
  const kinds = useReqKinds();
  const priorities = usePriorities();
  const myAnswer = detail.notes.find((n) => n.mine && n.field === "ANSWER")?.text ?? "";
  const [name, setName] = useState(detail.name);
  const [description, setDescription] = useState(detail.description);
  const [answer, setAnswer] = useState(myAnswer);

  const others = (field: NoteField) => detail.notes.filter((n) => n.field === field && !n.mine);
  const saveName = () => {
    const v = name.trim();
    if (!v) return setName(detail.name);
    if (v !== detail.name) onSave({ name: v });
  };
  const saveDescription = () => {
    if (description === detail.description) return;
    onSave({ description });
    if (description.trim()) onNote("DESCRIPTION", description.trim());
  };
  const saveAnswer = () => {
    const v = answer.trim();
    if (v === myAnswer.trim()) return;
    onNote("ANSWER", v || null);
  };

  return (
    <>
      <div className="grid gap-1">
        <label htmlFor="c-name" className="text-xs font-extrabold text-[#6c6a62]">{detail.code} 이름</label>
        <div className="flex gap-2">
          <Input id="c-name" value={name} disabled={readOnly} maxLength={200} onChange={(e) => setName(e.target.value)} onBlur={saveName} className="h-10 flex-1 rounded-xl border-[1.5px] border-[#111] bg-white" />
          {detail.is_manual && !readOnly && <Btn className="h-10 shrink-0 rounded-xl" onClick={onDelete}>삭제</Btn>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1 text-xs font-extrabold text-[#6c6a62]">
          <span className="flex flex-wrap items-center gap-1.5">구분{detail.kind_defaulted && <Pill tone="orange">AI 값 이상 · 확인 필요</Pill>}</span>
          <NativeSelect value={detail.kind} disabled={readOnly} onChange={(e) => onSave({ kind: e.target.value })} className="rounded-xl border-[1.5px] border-[#111] font-normal text-[#111]">
            {kinds.codes.map((k) => <option key={k.code} value={k.code}>{k.label}</option>)}
            {!kinds.codes.some((k) => k.code === detail.kind) && <option value={detail.kind}>{kinds.label(detail.kind)}</option>}
          </NativeSelect>
        </label>
        <label className="grid gap-1 text-xs font-extrabold text-[#6c6a62]">
          <span className="flex flex-wrap items-center gap-1.5">우선순위{detail.priority_defaulted && <Pill tone="orange">AI 값 이상 · 확인 필요</Pill>}</span>
          <NativeSelect value={detail.priority} disabled={readOnly} onChange={(e) => onSave({ priority: e.target.value })} className="rounded-xl border-[1.5px] border-[#111] font-normal text-[#111]">
            {priorities.codes.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}
            {!priorities.codes.some((p) => p.code === detail.priority) && <option value={detail.priority}>{priorities.label(detail.priority)}</option>}
          </NativeSelect>
        </label>
      </div>
      <div className="grid gap-1">
        <label htmlFor="c-desc" className="text-xs font-extrabold text-[#6c6a62]">설명</label>
        <textarea id="c-desc" rows={4} value={description} disabled={readOnly} maxLength={10_000} onChange={(e) => setDescription(e.target.value)} onBlur={saveDescription} className={area} />
        <OtherNotes notes={others("DESCRIPTION")} />
      </div>

      <div className="grid gap-2 rounded-2xl bg-[#ebeae4] px-4 py-3 text-sm text-[#55534c]">
        <span className="text-xs font-extrabold text-[#6c6a62]">문서에서 찾은 근거</span>
        {detail.sources.length === 0 ? (
          <p>{detail.is_manual ? "직접 추가한 항목이라 근거 문장이 없어요." : "근거 문장이 없어요."}</p>
        ) : (
          <ul className="grid gap-2">
            {detail.sources.map((s) => (
              <li key={s.id} className="grid gap-0.5">
                <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#6c6a62]">
                  {[s.filename, s.end_location_label ? `${s.location_label.replace(/쪽$/, "")}~${s.end_location_label}` : s.location_label].filter((v, i, a) => a.indexOf(v) === i).join(" · ")}
                  {!s.verified && <Pill tone="orange">위치 확인 필요</Pill>}
                </span>
                <q className="text-[#111]">{s.quote}</q>
              </li>
            ))}
          </ul>
        )}
      </div>

      {detail.ai_question && (
        <div className="grid gap-2 rounded-2xl border-[1.5px] border-[#ff5a14] bg-[#fff3ec] p-4">
          <label htmlFor="c-answer" className="text-sm font-semibold">AI의 질문 · {detail.ai_question}</label>
          <textarea id="c-answer" rows={2} disabled={readOnly} maxLength={5000} placeholder="답을 적고 아래에서 다시 분류하면 반영돼요" value={answer} onChange={(e) => setAnswer(e.target.value)} onBlur={saveAnswer} className={area} />
          <OtherNotes notes={others("ANSWER")} />
        </div>
      )}
      {detail.ai_answer && (
        <p className="rounded-2xl border-[1.5px] border-[#111]/20 px-4 py-3 text-sm"><span className="mb-1 block text-xs font-extrabold text-[#6c6a62]">AI가 정리한 답</span>{detail.ai_answer}</p>
      )}
    </>
  );
}

/** 같은 칸에 다른 멤버가 남긴 입력 (작성자·시각) */
function OtherNotes({ notes }: { notes: ApiNote[] }) {
  if (notes.length === 0) return null;
  return (
    <ul className="grid gap-1 text-xs text-[#55534c]">
      {notes.map((n) => (
        <li key={n.id} className="flex items-baseline gap-2">
          <span className="shrink-0 font-semibold">{n.author_name} · {fmtTime(n.updated_at)}</span>
          <span className="flex-1">{n.text}</span>
          {n.applied && <Pill className="shrink-0">반영됨</Pill>}
        </li>
      ))}
    </ul>
  );
}

export { FIELD_LABEL };
