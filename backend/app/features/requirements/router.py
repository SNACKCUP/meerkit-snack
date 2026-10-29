"""요구사항 정리 도우미 API.

흐름: 문서 업로드 → AI 분석(요구사항 추출·분류·정제) → 관리자 검토/수정 → 확정
     → 기능정의서 생성 → Excel 다운로드

예전 계약의 스텁입니다. 모든 API는 로그인이 필요합니다. 프로젝트 중심 새 API(/api/mms, 매무새 M2~M4)로
바뀌면 이 폴더는 지웁니다. 확정·수정 권한(프로젝트 관리자)은 새 API 에서 검사합니다.
"""

from fastapi import APIRouter, Depends, Response, UploadFile, status

from app.core.principal import require_login
from app.features.requirements import service
from app.features.requirements.excel import build_feature_spec_xlsx
from app.features.requirements.schemas import (
    ConfirmRequest,
    ConfirmResult,
    DocumentRead,
    FeatureSpecRead,
    RequirementRead,
    RequirementUpdate,
)

# 모든 API 로그인 필요 (토큰이 없거나 틀리면 401)
router = APIRouter(prefix="/requirements", tags=["requirements"], dependencies=[Depends(require_login)])

XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@router.post(
    "/documents",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="고객 문서 업로드 (txt, md, docx, pdf)",
)
async def upload_document(file: UploadFile):
    filename = file.filename or ""
    service.check_file_type(filename)  # 형식이 틀리면 415 (service가 던짐)
    content = await file.read()
    return service.upload_document(
        filename=filename,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )


@router.get(
    "/documents", response_model=list[DocumentRead], summary="업로드한 문서 목록"
)
def list_documents():
    return service.list_documents()


@router.get(
    "/documents/{document_id}", response_model=DocumentRead, summary="문서 상세"
)
def get_document(document_id: int):
    return service.get_document(document_id)


@router.post(
    "/documents/{document_id}/analyze",
    response_model=list[RequirementRead],
    summary="AI 분석: 요구사항 추출·분류·정제",
)
def analyze_document(document_id: int):
    return service.analyze_document(document_id)


@router.get(
    "/documents/{document_id}/requirements",
    response_model=list[RequirementRead],
    summary="문서의 요구사항 목록",
)
def list_requirements(document_id: int):
    return service.list_requirements(document_id)


@router.patch(
    "/documents/{document_id}/requirements/{requirement_id}",
    response_model=RequirementRead,
    summary="요구사항 수정",
)
def update_requirement(document_id: int, requirement_id: int, body: RequirementUpdate):
    return service.update_requirement(document_id, requirement_id, body)


@router.post(
    "/documents/{document_id}/confirm",
    response_model=ConfirmResult,
    summary="요구사항 확정",
)
def confirm_requirements(document_id: int, body: ConfirmRequest):
    return service.confirm_requirements(document_id, body.requirement_ids)


@router.post(
    "/documents/{document_id}/spec",
    response_model=FeatureSpecRead,
    summary="확정된 요구사항으로 기능정의서 생성",
)
def generate_spec(document_id: int):
    return service.generate_spec(document_id)


@router.get(
    "/documents/{document_id}/spec",
    response_model=FeatureSpecRead,
    summary="기능정의서 조회",
)
def get_spec(document_id: int):
    return service.get_spec(document_id)


@router.get(
    "/documents/{document_id}/spec/export",
    summary="기능정의서 Excel 다운로드",
    response_class=Response,
    responses={200: {"content": {XLSX_MEDIA_TYPE: {}}}},
)
def export_spec(document_id: int):
    spec = service.get_spec(document_id)
    return Response(
        content=build_feature_spec_xlsx(spec),
        media_type=XLSX_MEDIA_TYPE,
        headers={
            "Content-Disposition": f'attachment; filename="feature_spec_{document_id}.xlsx"'
        },
    )
