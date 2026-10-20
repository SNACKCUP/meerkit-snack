"""요구사항 정리 도우미 API의 요청/응답 스키마 (API 계약).

프론트엔드와 백엔드가 이 파일을 기준으로 동시에 작업합니다.
필드를 바꾸면 프론트엔드 타입도 같이 바뀌어야 하므로, 수정 전에 팀에 먼저 알립니다.
"""

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field

# ---------- 공통 상태값 ----------


class DocumentStatus(StrEnum):
    UPLOADED = "uploaded"  # 업로드만 됨
    PARSED = "parsed"  # MarkItDown으로 텍스트 추출 완료
    ANALYZED = "analyzed"  # AI가 요구사항 추출·분류 완료
    CONFIRMED = "confirmed"  # 관리자가 요구사항 확정
    SPEC_GENERATED = "spec_generated"  # 기능정의서 생성 완료
    FAILED = "failed"


class RequirementType(StrEnum):
    FUNCTIONAL = "functional"  # 기능 요구사항
    NON_FUNCTIONAL = "non_functional"  # 비기능 요구사항 (성능, 보안 등)
    CONSTRAINT = "constraint"  # 제약사항 (일정, 기술 스택 등)


class Priority(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RequirementStatus(StrEnum):
    DRAFT = "draft"  # AI가 만든 초안, 관리자 검토 전
    CONFIRMED = "confirmed"  # 관리자가 확정
    REJECTED = "rejected"  # 관리자가 제외


# ---------- 문서 ----------


class DocumentRead(BaseModel):
    id: int
    filename: str
    content_type: str
    size_bytes: int
    status: DocumentStatus
    requirement_count: int = Field(description="이 문서에서 추출된 요구사항 수")
    created_at: datetime


# ---------- 요구사항 ----------


class RequirementRead(BaseModel):
    id: int
    document_id: int
    code: str = Field(examples=["REQ-001"], description="문서 안에서의 표시 번호")
    title: str
    description: str = Field(description="AI가 정제한 요구사항 문장")
    source_text: str = Field(description="고객 문서의 원문 구절")
    type: RequirementType
    priority: Priority
    status: RequirementStatus
    clarification: str | None = Field(
        default=None, description="원문이 모호할 때 AI가 고객에게 확인할 질문"
    )


class RequirementUpdate(BaseModel):
    """관리자가 AI 초안을 수정할 때 보냅니다. 보낸 필드만 바뀝니다."""

    title: str | None = None
    description: str | None = None
    type: RequirementType | None = None
    priority: Priority | None = None


class ConfirmRequest(BaseModel):
    """체크한 요구사항은 confirmed, 나머지는 rejected 가 됩니다."""

    requirement_ids: list[int] = Field(min_length=1)


class ConfirmResult(BaseModel):
    document_id: int
    confirmed_count: int
    rejected_count: int
    status: DocumentStatus


# ---------- 기능정의서 ----------


class FeatureSpecItem(BaseModel):
    feature_id: str = Field(examples=["F-001"])
    menu: str = Field(description="기능을 묶는 메뉴/화면 단위")
    name: str
    description: str
    priority: Priority
    acceptance_criteria: list[str] = Field(description="완료 기준 목록")
    requirement_codes: list[str] = Field(description="근거가 된 요구사항 코드")


class FeatureSpecRead(BaseModel):
    document_id: int
    title: str
    generated_at: datetime
    items: list[FeatureSpecItem]
