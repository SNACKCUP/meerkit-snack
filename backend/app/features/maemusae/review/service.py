"""요구사항 후보 검토 업무 규칙 (M3-2). 권한 검사(보기)는 access.py 가 끝낸 뒤에 불립니다.

- 읽기(목록·상세·입력 목록)는 멤버와 보기 전용 MASTER. 쓰기는 멤버만이고 MASTER 는 403 (10/29 분석 결정과 같게)
- 분석·확정 중인 문서는 409 DOCUMENT_BUSY, 확정된 문서는 409 DOCUMENT_CONFIRMED
- 고칠 때는 version 이 같아야 함 (낙관적 잠금, JPA @Version 과 같은 방식). 다르면 409 REQUIREMENT_CHANGED
- 구분·우선순위를 사람이 정하면 기본값 표시(kind_defaulted·priority_defaulted)를 풉니다 (10/29 결정 B)
- 입력은 사람마다 칸마다 한 건 (10/28 결정 5). 고치면 다시 분류 반영 표시를 비움

로그에는 id·바꾼 칸 이름만 남기고 내용은 남기지 않습니다.
"""

import logging
import re
from datetime import UTC, datetime

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.codes import require_code
from app.features.maemusae.access import ProjectAccess
from app.features.maemusae.analysis import repository as analysis_repository
from app.features.maemusae.analysis.models import Requirement
from app.features.maemusae.documents import repository as documents_repository
from app.features.maemusae.documents.models import (
    BUSY_STATUSES,
    CONFIRMED,
    EMPTY,
    READY,
    Document,
)
from app.features.maemusae.documents.models import FAILED as DOCUMENT_FAILED
from app.features.maemusae.errors import (
    DocumentBusyError,
    DocumentConfirmedError,
    DocumentNotFoundError,
    NoteNotFoundError,
    ProjectMemberRequiredError,
    RequirementChangedError,
    RequirementNotDeletableError,
    RequirementNotFoundError,
)
from app.features.maemusae.review import repository
from app.features.maemusae.review.models import RequirementNote
from app.features.maemusae.review.repository import RequirementFilter
from app.features.maemusae.review.schemas import (
    EvidenceRead,
    NoteRead,
    RequirementBulkUpdate,
    RequirementCreate,
    RequirementDetail,
    RequirementListItem,
    RequirementPage,
    RequirementUpdate,
    SaveRead,
)

logger = logging.getLogger(__name__)

KIND_GROUP = "MMS_REQ_KIND"
PRIORITY_GROUP = "MMS_PRIORITY"
TEXT_SOURCE_NAME = "직접 입력"
_CODE = re.compile(r"^\s*REQ-?(\d+)\s*$", re.IGNORECASE)


def code_of(seq: int) -> str:
    return f"REQ-{seq:03d}"


def _search(q: str | None) -> tuple[int | None, str | None]:
    """REQ-012 / req12 는 번호로, 그 밖은 이름으로 찾기"""
    if not q or not q.strip():
        return None, None
    match = _CODE.match(q)
    return (int(match.group(1)), None) if match else (None, q.strip())


def _document(db: Session, access: ProjectAccess, document_id: int) -> Document:
    document = documents_repository.get_document(db, access.project.id, document_id)
    if document is None:
        raise DocumentNotFoundError()
    return document


def _editable(db: Session, access: ProjectAccess, document_id: int, *, exclusive: bool = False) -> Document:
    if access.member is None:  # 보기 전용 MASTER
        raise ProjectMemberRequiredError()
    document = repository.lock_document(db, access.project.id, document_id, exclusive=exclusive)
    if document is None:
        raise DocumentNotFoundError()
    if document.status == CONFIRMED:
        raise DocumentConfirmedError()
    if document.status in BUSY_STATUSES:
        raise DocumentBusyError()
    return document


def _item(row: tuple[Requirement, bool, bool]) -> RequirementListItem:
    r, needs_answer, verified_all = row
    return RequirementListItem(
        id=r.id,
        code=code_of(r.seq),
        name=r.name,
        kind=r.kind,
        priority=r.priority,
        is_included=r.is_included,
        is_manual=r.is_manual,
        needs_answer=needs_answer,
        verified_all=verified_all,
        kind_defaulted=r.kind_defaulted,
        priority_defaulted=r.priority_defaulted,
        version=r.version,
    )


def _items(db: Session, document_id: int, ids: list[int]) -> list[RequirementListItem]:
    return [_item(row) for row in repository.list_requirements(db, document_id, RequirementFilter(ids=tuple(ids)))]


def _note_read(note: RequirementNote, requirement: Requirement, author_name: str, actor_id: int) -> NoteRead:
    return NoteRead(
        id=note.id,
        requirement_id=requirement.id,
        requirement_code=code_of(requirement.seq),
        requirement_name=requirement.name,
        field=note.field,
        text=note.text,
        author_name=author_name,
        mine=note.author_id == actor_id,
        applied=note.applied_run_id is not None,
        created_at=note.created_at,
        updated_at=note.updated_at,
    )


# ---- 읽기 ----


def list_requirements(
    db: Session,
    access: ProjectAccess,
    document_id: int,
    *,
    kind: str | None,
    priority: str | None,
    included: bool | None,
    needs_check: bool,
    q: str | None,
    cursor: int | None,
    limit: int,
) -> RequirementPage:
    document = _document(db, access, document_id)
    seq, name = _search(q)
    f = RequirementFilter(kind=kind, priority=priority, included=included, needs_check=needs_check, seq=seq, name=name)
    rows = repository.list_requirements(db, document.id, f, after_seq=cursor, limit=limit + 1)
    more = len(rows) > limit
    rows = rows[:limit]
    return RequirementPage(items=[_item(r) for r in rows], next_cursor=rows[-1][0].seq if more else None)


def get_requirement(db: Session, access: ProjectAccess, document_id: int, requirement_id: int) -> RequirementDetail:
    document = _document(db, access, document_id)
    rows = repository.list_requirements(db, document.id, RequirementFilter(ids=(requirement_id,)))
    if not rows:
        raise RequirementNotFoundError()
    r = rows[0][0]
    sources = [
        EvidenceRead(
            id=s.id,
            source_file_id=f.id,
            filename=f.filename or TEXT_SOURCE_NAME,
            location_label=page.location_label,
            end_location_label=end_label,
            source_page_id=page.id,
            quote=s.quote,
            verified=s.verified,
        )
        for s, page, f, end_label in repository.list_sources(db, r.id)
    ]
    actor_id = access.principal.user_id
    notes = [
        _note_read(note, req, author, actor_id)
        for note, req, author in repository.list_notes(db, document.id, requirement_id=r.id, newest_first=False)
    ]
    return RequirementDetail(
        **_item(rows[0]).model_dump(),
        description=r.description,
        ai_question=r.ai_question,
        ai_answer=r.ai_answer,
        sources=sources,
        notes=notes,
        created_at=r.created_at,
        updated_at=r.updated_at,
    )


def list_document_notes(
    db: Session,
    access: ProjectAccess,
    document_id: int,
    *,
    author_id: int | None,
    q: str | None,
    newest_first: bool,
    limit: int,
) -> list[NoteRead]:
    document = _document(db, access, document_id)
    seq, name = _search(q)
    actor_id = access.principal.user_id
    rows = repository.list_notes(
        db, document.id, author_id=author_id, seq=seq, name=name, newest_first=newest_first, limit=limit
    )
    return [_note_read(note, req, author, actor_id) for note, req, author in rows]


# ---- 고치기 ----


def _apply(db: Session, requirement: Requirement, changes: RequirementUpdate, actor_id: int) -> list[str]:
    """바꾼 칸 이름 목록. version 확인은 부른 쪽이 먼저 함"""
    values = {k: v for k, v in changes.model_dump(exclude_unset=True, exclude={"id", "version"}).items() if v is not None}
    if "kind" in values:
        require_code(db, KIND_GROUP, values["kind"])
        requirement.kind_defaulted = False
    if "priority" in values:
        require_code(db, PRIORITY_GROUP, values["priority"])
        requirement.priority_defaulted = False
    for key, value in values.items():
        setattr(requirement, key, value)
    if values:
        requirement.version += 1
        requirement.updated_by = actor_id
    return sorted(values)


def update_requirement(
    db: Session, access: ProjectAccess, document_id: int, requirement_id: int, body: RequirementUpdate
) -> RequirementListItem:
    document = _editable(db, access, document_id)
    requirement = repository.get_requirement(db, document.id, requirement_id, for_update=True)
    if requirement is None:
        raise RequirementNotFoundError()
    if requirement.version != body.version:
        raise RequirementChangedError([code_of(requirement.seq)])
    fields = _apply(db, requirement, body, access.principal.user_id)
    db.commit()
    logger.info(
        "요구사항 수정 document_id=%s requirement_id=%s fields=%s actor_id=%s",
        document.id, requirement.id, ",".join(fields) or "-", access.principal.user_id,
    )
    return _items(db, document.id, [requirement.id])[0]


def update_requirements(
    db: Session, access: ProjectAccess, document_id: int, body: RequirementBulkUpdate
) -> list[RequirementListItem]:
    """일괄 수정. 하나라도 없거나 version 이 다르면 아무것도 바꾸지 않음 (전부 아니면 전무)"""
    document = _editable(db, access, document_id)
    ids = [item.id for item in body.items]
    rows = {r.id: r for r in repository.lock_requirements(db, document.id, ids)}
    if len(rows) != len(ids):
        db.rollback()
        raise RequirementNotFoundError()
    changed = [code_of(rows[i.id].seq) for i in body.items if rows[i.id].version != i.version]
    if changed:
        db.rollback()
        raise RequirementChangedError(changed)
    for item in body.items:
        _apply(db, rows[item.id], item, access.principal.user_id)
    db.commit()
    logger.info(
        "요구사항 일괄 수정 document_id=%s count=%s actor_id=%s", document.id, len(ids), access.principal.user_id
    )
    return _items(db, document.id, ids)


def create_requirement(
    db: Session, access: ProjectAccess, document_id: int, body: RequirementCreate
) -> RequirementListItem:
    """직접 추가. 번호는 지운 후보까지 포함한 마지막 번호 + 1 (다시 쓰지 않음)"""
    document = _editable(db, access, document_id, exclusive=True)
    require_code(db, KIND_GROUP, body.kind)
    require_code(db, PRIORITY_GROUP, body.priority)
    actor_id = access.principal.user_id
    requirement = Requirement(
        document_id=document.id,
        seq=analysis_repository.max_seq(db, document.id) + 1,
        name=body.name,
        description=body.description,
        kind=body.kind,
        priority=body.priority,
        is_manual=True,
        created_by=actor_id,
        updated_by=actor_id,
    )
    repository.add(db, requirement)
    if document.status in (EMPTY, DOCUMENT_FAILED):  # AI 분석 없이 직접 쓰기 시작해도 검토·확정할 수 있게
        document.status = READY
    db.commit()
    logger.info("요구사항 직접 추가 document_id=%s requirement_id=%s actor_id=%s", document.id, requirement.id, actor_id)
    return _items(db, document.id, [requirement.id])[0]


def delete_requirement(db: Session, access: ProjectAccess, document_id: int, requirement_id: int) -> None:
    """직접 추가한 후보만. 행은 남기고 deleted_at 만 채워 번호를 다시 쓰지 않음"""
    document = _editable(db, access, document_id)
    requirement = repository.get_requirement(db, document.id, requirement_id, for_update=True)
    if requirement is None:
        raise RequirementNotFoundError()
    if not requirement.is_manual:
        raise RequirementNotDeletableError()
    requirement.deleted_at = datetime.now(UTC)
    requirement.updated_by = access.principal.user_id
    db.commit()
    logger.info(
        "요구사항 삭제 document_id=%s requirement_id=%s actor_id=%s", document.id, requirement_id, access.principal.user_id
    )


# ---- 입력 ----


def write_note(
    db: Session, access: ProjectAccess, document_id: int, requirement_id: int, field: str, text: str
) -> NoteRead:
    """내 입력 남기기·고치기 (사람마다 칸마다 한 건). 고치면 다시 분류에 새로 반영되도록 반영 표시를 비움"""
    document = _editable(db, access, document_id)
    requirement = repository.get_requirement(db, document.id, requirement_id)
    if requirement is None:
        raise RequirementNotFoundError()
    actor_id = access.principal.user_id
    note = repository.get_my_note(db, requirement.id, field, actor_id)
    if note is None:
        note = RequirementNote(requirement_id=requirement.id, field=field, text=text, author_id=actor_id)
        try:
            repository.add(db, note)
        except IntegrityError:  # 같은 사람이 동시에 두 번 눌러 먼저 들어간 행이 있음 → 그 행을 고침
            db.rollback()
            document = _editable(db, access, document_id)
            note = repository.get_my_note(db, requirement.id, field, actor_id)
    note.text = text
    note.applied_run_id = None
    db.commit()
    db.refresh(note)
    logger.info(
        "요구사항 입력 남김 document_id=%s requirement_id=%s field=%s actor_id=%s", document.id, requirement.id, field, actor_id
    )
    return _note_read(note, requirement, repository.get_user_name(db, actor_id), actor_id)


def delete_note(db: Session, access: ProjectAccess, document_id: int, requirement_id: int, field: str) -> None:
    document = _editable(db, access, document_id)
    requirement = repository.get_requirement(db, document.id, requirement_id)
    if requirement is None:
        raise RequirementNotFoundError()
    note = repository.get_my_note(db, requirement.id, field, access.principal.user_id)
    if note is None:
        raise NoteNotFoundError()
    repository.delete(db, note)
    db.commit()
    logger.info(
        "요구사항 입력 삭제 document_id=%s requirement_id=%s field=%s actor_id=%s",
        document.id, requirement.id, field, access.principal.user_id,
    )


def save_document(db: Session, access: ProjectAccess, document_id: int) -> SaveRead:
    """임시 저장 시각. 고친 내용은 이미 저장돼 있고, 화면의 '임시 저장됨 16:32' 표시용"""
    document = _editable(db, access, document_id, exclusive=True)
    document.saved_at = datetime.now(UTC)
    document.saved_by = access.principal.user_id
    db.commit()
    return SaveRead(saved_at=document.saved_at)
