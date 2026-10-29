from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

# ---- AI 응답 모양 (invoke_structured 가 이 모양으로 받음) ----


class ExtractedEvidence(BaseModel):
    page: str = Field(description="근거가 있는 쪽의 번호표. 쪽 앞 [P3 · …] 의 P3")
    quote: str = Field(description="그 쪽 본문에서 고치지 않고 그대로 옮긴 문장")


class ExtractedRequirement(BaseModel):
    name: str = Field(description="짧은 이름 (예: 이메일 회원가입)")
    description: str = Field(default="", description="무엇을 해야 하는지 한두 문장")
    kind: str = Field(description="구분 코드")
    priority: str = Field(description="우선순위 코드")
    question: str | None = Field(default=None, description="모호하거나 서로 다르면 고객에게 물을 질문 한 문장, 아니면 null")
    evidence: list[ExtractedEvidence] = Field(default_factory=list)


class ExtractResult(BaseModel):
    requirements: list[ExtractedRequirement] = Field(default_factory=list)


class DedupeResult(BaseModel):
    groups: list[list[int]] = Field(default_factory=list, description="같은 요구사항끼리 묶은 후보 번호 (묶음마다 2개 이상)")


# ---- API ----


class AnalyzeRequest(BaseModel):
    prompt: str | None = Field(
        default=None, max_length=2000, description="AI 에게 덧붙일 지시 (예: 관리자 기능 위주로)", examples=["결제 관련 내용을 꼼꼼히 봐 줘"]
    )
    restart: bool = Field(
        default=False, description="이미 분석한 문서를 처음부터 다시 분석 (AI 후보를 새로 만들고 직접 추가한 후보는 남김)"
    )


class AnalysisStarted(BaseModel):
    run_id: int = Field(examples=[3])


class AnalysisRunRead(BaseModel):
    """마지막 분석 요청. 화면은 RUNNING 동안 2~3초마다 읽어 "3/10 분석 중"을 보여 줍니다."""

    run_id: int = Field(examples=[3])
    run_type: Literal["ANALYZE", "REFINE"] = Field(examples=["ANALYZE"])
    status: Literal["RUNNING", "SUCCEEDED", "FAILED"] = Field(examples=["RUNNING"])
    done_steps: int = Field(examples=[3])
    total_steps: int = Field(description="묶음 수 (+ 묶음이 여럿이면 합치기 1)", examples=[10])
    error_code: str | None = Field(default=None, description="실패 이유 (예: LLM_TIMEOUT, ANALYSIS_INTERRUPTED)")
    started_at: datetime
    finished_at: datetime | None = None
