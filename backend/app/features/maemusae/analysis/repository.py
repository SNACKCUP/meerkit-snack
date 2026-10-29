"""분석 요청·요구사항 후보·근거 테이블 접근. SQL 은 이 파일에만 둡니다. commit 은 service·runner 가 합니다."""


from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from app.features.maemusae.analysis.models import (
    RUNNING,
    AnalysisRun,
    Requirement,
    RequirementSource,
)
from app.features.maemusae.documents.models import Document, SourceFile, SourcePage


def lock_document(db: Session, document_id: int) -> Document | None:
    return db.scalar(select(Document).where(Document.id == document_id).with_for_update())


def get_run(db: Session, run_id: int) -> AnalysisRun | None:
    return db.get(AnalysisRun, run_id, populate_existing=True)


def get_running_run(db: Session, document_id: int) -> AnalysisRun | None:
    return db.scalar(select(AnalysisRun).where(AnalysisRun.document_id == document_id, AnalysisRun.status == RUNNING))


def get_latest_run(db: Session, document_id: int) -> AnalysisRun | None:
    return db.scalar(
        select(AnalysisRun).where(AnalysisRun.document_id == document_id).order_by(AnalysisRun.id.desc()).limit(1)
    )


def list_document_pages(db: Session, document_id: int) -> list[tuple[SourcePage, SourceFile]]:
    """문서에 올린 모든 쪽. 파일은 올린 순, 파일 안은 seq 순 (묶음 나누기가 이 순서를 그대로 씀)"""
    rows = db.execute(
        select(SourcePage, SourceFile)
        .join(SourceFile, SourceFile.id == SourcePage.source_file_id)
        .where(SourceFile.document_id == document_id)
        .order_by(SourceFile.created_at, SourceFile.id, SourcePage.seq)
    )
    return [(page, source) for page, source in rows]


def _live(document_id: int):
    return (Requirement.document_id == document_id, Requirement.deleted_at.is_(None))


def has_live_requirements(db: Session, document_id: int) -> bool:
    return db.scalar(select(Requirement.id).where(*_live(document_id)).limit(1)) is not None


def max_seq(db: Session, document_id: int) -> int:
    """지운 후보까지 포함한 마지막 번호 (번호를 다시 쓰지 않으려고)"""
    return db.scalar(select(func.coalesce(func.max(Requirement.seq), 0)).where(Requirement.document_id == document_id))


def delete_requirements(db: Session, document_id: int) -> int:
    """다시 분석할 때 문서의 후보를 모두 지움 (AI·직접 추가·지운 표시 행 모두). 근거·입력은 FK CASCADE 로 같이 지워짐.
    남겨야 할 내용은 사람이 버전 추가·저장으로 mms_document_versions 에 남겼습니다 (10/29 결정)"""
    result = db.execute(
        delete(Requirement).where(Requirement.document_id == document_id).execution_options(synchronize_session=False)
    )
    return result.rowcount


def mark_sources_analyzed(db: Session, document_id: int, run_id: int) -> None:
    db.execute(
        update(SourceFile)
        .where(SourceFile.document_id == document_id)
        .values(analysis_run_id=run_id)
        .execution_options(synchronize_session=False)
    )


def add(db: Session, row: AnalysisRun | Requirement) -> None:
    db.add(row)
    db.flush()


def add_all(db: Session, rows: list[RequirementSource]) -> None:
    db.add_all(rows)
    db.flush()
