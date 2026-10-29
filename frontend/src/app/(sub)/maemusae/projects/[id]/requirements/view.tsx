"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AiPromptInput, ThinkingIndicator } from "@/meerkit";

import { ProjectGuard } from "../../../_components/ProjectGuard";
import { SourcesPanel } from "../../../_components/SourcesPanel";
import { Viewer } from "../../../_components/Viewer";
import { ANALYZING_LABELS, CONFIRMING_LABELS, Workspace } from "../../../_components/Workspace";
import { PageHead, Pill, card } from "../../../_components/ui";
import { apiError } from "../../../_lib/api";
import { DOC_STATUS } from "../../../_lib/labels";
import { useRequirementsDoc, useUploadSource } from "../../../_lib/queries";
import { emptyDoc } from "../../../_lib/seed";
import { useMaemusae } from "../../../_lib/store";

export default function RequirementsPage() {
  const { id } = useParams<{ id: string }>();
  const stored = useMaemusae((s) => s.docs[id]);
  const startAnalysis = useMaemusae((s) => s.startAnalysis);
  const doc = stored ?? emptyDoc();
  const st = DOC_STATUS[doc.status];
  const { data: serverDoc } = useRequirementsDoc(id);
  const upload = useUploadSource(id, serverDoc?.id);
  const [uploading, setUploading] = useState(false);
  const hasSources = (serverDoc?.source_count ?? 0) > 0;

  // 붙인 파일을 서버에 올리고(원본 보관 + 글 뽑기), 하나라도 있으면 분류를 시작한다.
  // 분류(M3)는 아직 목 데이터라 올린 글 대신 예시 후보가 나온다
  const submit = async (msg: string, files: File[]) => {
    setUploading(true);
    let ok = 0;
    for (const file of files) {
      try {
        await upload.mutateAsync({ file });
        ok += 1;
      } catch (e) {
        toast.error(`${file.name}: ${apiError(e, "올리지 못했어요.")}`);
      }
    }
    setUploading(false);
    if (ok > 0 || hasSources) startAnalysis(id, msg, files.map((f) => f.name));
  };

  return (
    <ProjectGuard projectId={id}>
      {({ project, isAdmin, readOnly }) => (
        <div className="grid gap-8">
          <PageHead eyebrow={project.name} title="요구사항정의서">
            <Pill tone={st.tone}>{st.label}</Pill>
            <Link href={`/maemusae/projects/${id}`} className="text-sm underline">프로젝트로</Link>
          </PageHead>

          {doc.status === "empty" && (
            <section className={`${card} mx-auto grid w-full max-w-2xl gap-4`} data-rise>
              <h2 className="text-xl font-extrabold tracking-tight">고객 문서를 올리고 요청을 적어 주세요</h2>
              <p className="text-sm text-[#6c6a62]">문서를 한 개 이상 붙이고 보내면 AI가 요구사항 후보를 가려내요. 글은 비워 두어도 괜찮아요. 파일 하나는 10MB까지예요.</p>
              <AiPromptInput
                placeholder="예: 쇼핑몰 리뉴얼 요청서예요. 결제와 회원 관련 요구사항 위주로 뽑아 주세요"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.md,.ppt,.pptx"
                minFiles={hasSources ? 0 : 1}
                requireText={false}
                submitLabel={uploading ? "올리는 중…" : "분류 시작"}
                disabled={uploading || readOnly || !serverDoc}
                onSubmit={submit}
              />
            </section>
          )}

          {(doc.status === "analyzing" || doc.status === "confirming") && (
            <section className={`${card} mx-auto grid w-full max-w-2xl justify-items-center gap-4 py-16`} role="status" data-rise>
              <ThinkingIndicator size="lg" labels={doc.status === "analyzing" ? ANALYZING_LABELS : CONFIRMING_LABELS} />
              <p className="text-sm text-[#6c6a62]">끝날 때까지 이 화면에서 기다려 주세요. 새로고침해도 이어서 마무리돼요.</p>
            </section>
          )}

          <SourcesPanel projectId={id} docId={serverDoc?.id} canManageAll={isAdmin} readOnly={readOnly} />

          {doc.status === "ready" && <Workspace projectId={id} doc={doc} isAdmin={isAdmin} />}
          {doc.status === "confirmed" && <Viewer project={project} doc={doc} isAdmin={isAdmin} />}
        </div>
      )}
    </ProjectGuard>
  );
}
