"""요구사항 정리 도우미의 업무 흐름.

지금은 API 계약을 먼저 고정하기 위한 스텁입니다. 모든 함수가 고정된 예시 데이터를 돌려줍니다.
실제 구현(DB 저장, MarkItDown 파싱, LLM 체인 호출)은 함수 이름과 반환 타입을 그대로 두고
본문만 바꿔 넣으면 됩니다. router.py 는 바꿀 필요가 없습니다.
"""

from datetime import UTC, datetime

from app.features.requirements.schemas import (
    ConfirmResult,
    DocumentRead,
    DocumentStatus,
    FeatureSpecItem,
    FeatureSpecRead,
    Priority,
    RequirementRead,
    RequirementStatus,
    RequirementType,
    RequirementUpdate,
)

ALLOWED_EXTENSIONS = {".txt", ".md", ".docx", ".pdf"}

EXAMPLE_DOCUMENT_ID = 1
_CREATED_AT = datetime(2026, 10, 20, 9, 0, tzinfo=UTC)


class NotFoundError(Exception):
    pass


def _example_document(**overrides) -> DocumentRead:
    data = {
        "id": EXAMPLE_DOCUMENT_ID,
        "filename": "쇼핑몰_리뉴얼_요청서.docx",
        "content_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "size_bytes": 48213,
        "status": DocumentStatus.ANALYZED,
        "requirement_count": 3,
        "created_at": _CREATED_AT,
    }
    data.update(overrides)
    return DocumentRead(**data)


def _example_requirements() -> list[RequirementRead]:
    return [
        RequirementRead(
            id=1,
            document_id=EXAMPLE_DOCUMENT_ID,
            code="REQ-001",
            title="소셜 로그인",
            description="사용자는 카카오 또는 네이버 계정으로 로그인할 수 있어야 한다.",
            source_text="로그인은 카톡이나 네이버로 간편하게 됐으면 좋겠어요.",
            type=RequirementType.FUNCTIONAL,
            priority=Priority.HIGH,
            status=RequirementStatus.DRAFT,
        ),
        RequirementRead(
            id=2,
            document_id=EXAMPLE_DOCUMENT_ID,
            code="REQ-002",
            title="상품 목록 응답 속도",
            description="상품 목록 화면은 3초 이내에 표시되어야 한다.",
            source_text="상품 페이지가 너무 느려요. 빨리 떴으면 합니다.",
            type=RequirementType.NON_FUNCTIONAL,
            priority=Priority.MEDIUM,
            status=RequirementStatus.DRAFT,
            clarification="목표 응답 시간(예: 3초)과 기준 동시 접속자 수를 확인해 주세요.",
        ),
        RequirementRead(
            id=3,
            document_id=EXAMPLE_DOCUMENT_ID,
            code="REQ-003",
            title="오픈 일정",
            description="서비스는 2027년 3월 이전에 오픈해야 한다.",
            source_text="내년 봄 시즌 전에는 꼭 열어야 해요.",
            type=RequirementType.CONSTRAINT,
            priority=Priority.HIGH,
            status=RequirementStatus.DRAFT,
        ),
    ]


def _check_document(document_id: int) -> None:
    if document_id != EXAMPLE_DOCUMENT_ID:
        raise NotFoundError(f"문서 {document_id}를 찾을 수 없습니다.")


def upload_document(filename: str, content_type: str, size_bytes: int) -> DocumentRead:
    return _example_document(
        filename=filename,
        content_type=content_type,
        size_bytes=size_bytes,
        status=DocumentStatus.PARSED,
        requirement_count=0,
    )


def list_documents() -> list[DocumentRead]:
    return [_example_document()]


def get_document(document_id: int) -> DocumentRead:
    _check_document(document_id)
    return _example_document()


def analyze_document(document_id: int) -> list[RequirementRead]:
    _check_document(document_id)
    return _example_requirements()


def list_requirements(document_id: int) -> list[RequirementRead]:
    _check_document(document_id)
    return _example_requirements()


def update_requirement(
    document_id: int, requirement_id: int, body: RequirementUpdate
) -> RequirementRead:
    _check_document(document_id)
    for requirement in _example_requirements():
        if requirement.id == requirement_id:
            return requirement.model_copy(update=body.model_dump(exclude_unset=True))
    raise NotFoundError(f"요구사항 {requirement_id}를 찾을 수 없습니다.")


def confirm_requirements(document_id: int, requirement_ids: list[int]) -> ConfirmResult:
    _check_document(document_id)
    known_ids = {r.id for r in _example_requirements()}
    unknown = set(requirement_ids) - known_ids
    if unknown:
        raise NotFoundError(f"요구사항 {sorted(unknown)}를 찾을 수 없습니다.")
    confirmed = len(set(requirement_ids))
    return ConfirmResult(
        document_id=document_id,
        confirmed_count=confirmed,
        rejected_count=len(known_ids) - confirmed,
        status=DocumentStatus.CONFIRMED,
    )


def _example_spec() -> FeatureSpecRead:
    return FeatureSpecRead(
        document_id=EXAMPLE_DOCUMENT_ID,
        title="쇼핑몰 리뉴얼 기능정의서",
        generated_at=_CREATED_AT,
        items=[
            FeatureSpecItem(
                feature_id="F-001",
                menu="회원",
                name="소셜 로그인",
                description="카카오, 네이버 OAuth 로그인을 제공하고 최초 로그인 시 회원을 자동 생성한다.",
                priority=Priority.HIGH,
                acceptance_criteria=[
                    "카카오 계정으로 로그인할 수 있다.",
                    "네이버 계정으로 로그인할 수 있다.",
                    "최초 로그인 시 회원 정보가 저장된다.",
                ],
                requirement_codes=["REQ-001"],
            ),
            FeatureSpecItem(
                feature_id="F-002",
                menu="상품",
                name="상품 목록 조회",
                description="상품 목록을 페이지 단위로 조회하며 3초 이내에 첫 화면을 표시한다.",
                priority=Priority.MEDIUM,
                acceptance_criteria=[
                    "한 페이지에 20개씩 표시된다.",
                    "첫 화면이 3초 이내에 표시된다.",
                ],
                requirement_codes=["REQ-002"],
            ),
        ],
    )


def generate_spec(document_id: int) -> FeatureSpecRead:
    _check_document(document_id)
    return _example_spec()


def get_spec(document_id: int) -> FeatureSpecRead:
    _check_document(document_id)
    return _example_spec()
