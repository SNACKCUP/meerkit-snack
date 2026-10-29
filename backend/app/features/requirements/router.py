"""요구사항 정리 도우미 API.

흐름: 문서 업로드 → AI 분석(요구사항 추출·분류·정제) → 관리자 검토/수정 → 확정
     → 기능정의서 생성 → Excel 다운로드

관리자 전용 표시가 있는 API는 매무새 M1 에서 권한 검사(app.core.principal)를 붙입니다.
"""

from pathlib import Path

from fastapi import APIRouter, HTTPException, Response, UploadFile, status

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

router = APIRouter(prefix="/requirements", tags=["requirements"])

XLSX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _not_found(error: service.NotFoundError) -> HTTPException:
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))


@router.post(
    "/documents",
    response_model=DocumentRead,
    status_code=status.HTTP_201_CREATED,
    summary="고객 문서 업로드 (txt, md, docx, pdf)",
)
async def upload_document(file: UploadFile):
    filename = file.filename or ""
    if Path(filename).suffix.lower() not in service.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="지원하지 않는 파일 형식입니다. txt, md, docx, pdf 파일만 올릴 수 있습니다.",
        )
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
    try:
        return service.get_document(document_id)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.post(
    "/documents/{document_id}/analyze",
    response_model=list[RequirementRead],
    summary="AI 분석: 요구사항 추출·분류·정제",
)
def analyze_document(document_id: int):
    try:
        return service.analyze_document(document_id)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.get(
    "/documents/{document_id}/requirements",
    response_model=list[RequirementRead],
    summary="문서의 요구사항 목록",
)
def list_requirements(document_id: int):
    try:
        return service.list_requirements(document_id)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.patch(
    "/documents/{document_id}/requirements/{requirement_id}",
    response_model=RequirementRead,
    summary="요구사항 수정 (관리자 전용)",
)
def update_requirement(document_id: int, requirement_id: int, body: RequirementUpdate):
    try:
        return service.update_requirement(document_id, requirement_id, body)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.post(
    "/documents/{document_id}/confirm",
    response_model=ConfirmResult,
    summary="요구사항 확정 (관리자 전용)",
)
def confirm_requirements(document_id: int, body: ConfirmRequest):
    try:
        return service.confirm_requirements(document_id, body.requirement_ids)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.post(
    "/documents/{document_id}/spec",
    response_model=FeatureSpecRead,
    summary="확정된 요구사항으로 기능정의서 생성",
)
def generate_spec(document_id: int):
    try:
        return service.generate_spec(document_id)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.get(
    "/documents/{document_id}/spec",
    response_model=FeatureSpecRead,
    summary="기능정의서 조회",
)
def get_spec(document_id: int):
    try:
        return service.get_spec(document_id)
    except service.NotFoundError as e:
        raise _not_found(e) from e


@router.get(
    "/documents/{document_id}/spec/export",
    summary="기능정의서 Excel 다운로드",
    response_class=Response,
    responses={200: {"content": {XLSX_MEDIA_TYPE: {}}}},
)
def export_spec(document_id: int):
    try:
        spec = service.get_spec(document_id)
    except service.NotFoundError as e:
        raise _not_found(e) from e
    return Response(
        content=build_feature_spec_xlsx(spec),
        media_type=XLSX_MEDIA_TYPE,
        headers={
            "Content-Disposition": f'attachment; filename="feature_spec_{document_id}.xlsx"'
        },
    )
