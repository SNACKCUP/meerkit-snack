"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ProjectGuard } from "../../../../_components/ProjectGuard";
import { RequirementTable, downloadExcel, tableRows } from "../../../../_components/Viewer";
import { Btn, PageHead, Pill, card, fmtDate } from "../../../../_components/ui";
import { revisionLabel } from "../../../../_lib/labels";
import { usePriorities, useReqKinds } from "../../../../_lib/queries";
import { useMaemusae } from "../../../../_lib/store";

// 확정한 문서를 그 시점 모습 그대로 미리 보는 화면
export default function DocViewPage() {
  const { id, docId } = useParams<{ id: string; docId: string }>();
  const doc = useMaemusae((s) => s.history[id]?.find((d) => d.id === docId));
  const kinds = useReqKinds();
  const priorities = usePriorities();

  return (
    <ProjectGuard projectId={id}>
      {({ project }) =>
        !doc ? (
          <div className={`${card} mx-auto max-w-lg text-center`} role="alert">
            <h1 className="text-2xl font-extrabold tracking-tight">문서를 찾을 수 없어요</h1>
            <Btn href={`/maemusae/projects/${id}`} variant="dark" className="mt-6">프로젝트로 돌아가기</Btn>
          </div>
        ) : (
          <div className="grid gap-6">
            <PageHead eyebrow={project.name} title={doc.title}>
              <Btn size="sm" onClick={() => downloadExcel(`${project.name}_${doc.title}_v${doc.revision}`, tableRows(doc.items), kinds.label, priorities.label)}>Excel 받기</Btn>
              <Btn size="sm" onClick={() => window.print()}>PDF로 저장</Btn>
            </PageHead>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm" data-rise>
              <div className="grid gap-1"><dt className="text-xs font-extrabold text-[#6c6a62]">종류</dt><dd><Pill>{doc.kind}</Pill></dd></div>
              <div className="grid gap-1"><dt className="text-xs font-extrabold text-[#6c6a62]">구분</dt><dd><Pill tone={doc.revision > 1 ? "yellow" : "plain"}>{revisionLabel(doc.revision)}</Pill></dd></div>
              <div className="grid gap-1"><dt className="text-xs font-extrabold text-[#6c6a62]">확정일</dt><dd className="font-semibold">{fmtDate(doc.confirmedAt)}</dd></div>
              <div className="grid gap-1"><dt className="text-xs font-extrabold text-[#6c6a62]">최종 확정인</dt><dd className="font-semibold">{doc.confirmedBy}</dd></div>
              <div className="grid gap-1"><dt className="text-xs font-extrabold text-[#6c6a62]">요구사항</dt><dd className="font-semibold">{doc.items.length}개</dd></div>
            </dl>
            <RequirementTable items={tableRows(doc.items)} />
            <Link href={`/maemusae/projects/${id}`} className="text-sm underline">프로젝트로 돌아가기</Link>
          </div>
        )
      }
    </ProjectGuard>
  );
}
