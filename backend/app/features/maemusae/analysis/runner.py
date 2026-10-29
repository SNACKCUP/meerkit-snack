"""뒤에서 돌리는 AI 분석 (BackgroundTasks). 요청과 다른 DB 세션을 직접 열고, 오류를 밖으로 던지지 않습니다.

1. 묶음마다 prompts/extract.md 로 후보를 뽑고 done_steps +1 (commit 해서 화면 진행률·멈춤 판단에 씀)
2. 묶음이 여럿이면 prompts/dedupe.md 로 같은 후보를 묶어 하나로 (근거는 모두 남김)
3. 근거 문장을 서버가 쪽 본문에서 찾아 verified·끝 쪽을 정함. 없는 쪽 번호를 댄 근거는 버림
4. 문서를 잠그고, 분석 요청이 아직 RUNNING 일 때만 한 트랜잭션으로 저장 (멈춤 정리와 겹치면 저장하지 않음)
어느 단계든 실패하면 반쯤 만든 결과는 저장하지 않고 run FAILED + 오류 코드 (킷 LLM 오류 코드 그대로).

로그에는 id·묶음 수·후보 수·걸린 시간·오류 코드만. 문서 본문·후보 내용·지시문은 남기지 않습니다.
"""

import logging
import time
from collections.abc import Iterator
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.codes import list_codes
from app.core.database import SessionLocal
from app.core.exceptions import AppError
from app.features.maemusae.analysis import repository
from app.features.maemusae.analysis.batching import PageRef, locate, tag_of
from app.features.maemusae.analysis.models import (
    RUNNING,
    SUCCEEDED,
    AnalysisRun,
    Requirement,
    RequirementSource,
)
from app.features.maemusae.analysis.schemas import (
    DedupeResult,
    ExtractedRequirement,
    ExtractResult,
)
from app.features.maemusae.analysis.service import (
    AnalysisPlan,
    choose_plan,
    end_failed,
    load_pages,
)
from app.features.maemusae.documents.models import READY
from app.llm import invoke_structured, load_prompt
from app.llm.config import llm_settings

logger = logging.getLogger(__name__)

PROMPTS = Path(__file__).parent / "prompts"
KIND_GROUP = "MMS_REQ_KIND"
PRIORITY_GROUP = "MMS_PRIORITY"
DEFAULT_PRIORITY = "MEDIUM"
NO_INSTRUCTIONS = "(없음)"
FAILED_CODE = "ANALYSIS_FAILED"  # 킷 오류 코드가 없는 예외 (내용은 로그에 남기지 않음)

NAME_MAX = 200
QUOTE_MAX = 1000
DEDUPE_DESCRIPTION_CHARS = 80
DEDUPE_HEADROOM = 2000  # 합치기 프롬프트 지시문 몫으로 킷 입력 상한에서 빼 두는 글자 수


@contextmanager
def _new_session() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


open_session = _new_session  # 테스트가 테스트 세션으로 바꿔 끼웁니다


@dataclass
class Candidate:
    name: str
    description: str
    kind: str
    priority: str
    question: str | None
    evidence: list[tuple[str, str]] = field(default_factory=list)  # (쪽 번호표, 문장)


def run_analysis(run_id: int) -> None:
    try:
        with open_session() as db:
            _run(db, run_id)
    except Exception as e:  # noqa: BLE001 — 실패 처리까지 실패한 경우 (DB 끊김 등). 멈춘 분석은 진행률을 읽을 때 정리됨
        logger.error("AI 분석 실패 처리 못함 run_id=%s error_type=%s", run_id, type(e).__name__)


def _run(db: Session, run_id: int) -> None:
    started = time.monotonic()
    run = repository.get_run(db, run_id)
    if run is None or run.status != RUNNING:
        return
    document_id = run.document_id
    try:
        plan = choose_plan(load_pages(db, document_id))
        candidates = _extract_all(db, run, plan)
        if plan.dedupe and len(candidates) > 1:
            candidates = _dedupe(candidates)
        count = _save(db, run_id, document_id, candidates, plan.by_tag)
    except Exception as e:  # noqa: BLE001 — 어느 단계 오류든 run 을 FAILED 로 남겨야 화면이 멈추지 않음
        db.rollback()
        code = e.code if isinstance(e, AppError) else FAILED_CODE
        _fail(db, run_id, document_id, code)
        logger.warning(
            "AI 분석 실패 run_id=%s document_id=%s code=%s error_type=%s ms=%d",
            run_id, document_id, code, type(e).__name__, (time.monotonic() - started) * 1000,
        )
        return
    if count is not None:
        logger.info(
            "AI 분석 끝 run_id=%s document_id=%s batches=%s requirements=%s ms=%d",
            run_id, document_id, len(plan.batches), count, (time.monotonic() - started) * 1000,
        )


def _code_text(db: Session, group: str) -> tuple[str, list[str]]:
    codes = list_codes(db, group)
    return ", ".join(f"{c.code}({c.label})" for c in codes), [c.code for c in codes]


def _extract_all(db: Session, run: AnalysisRun, plan: AnalysisPlan) -> list[Candidate]:
    kinds_text, kinds = _code_text(db, KIND_GROUP)
    priorities_text, priorities = _code_text(db, PRIORITY_GROUP)
    prompt = load_prompt(PROMPTS / "extract.md")
    candidates: list[Candidate] = []
    for batch in plan.batches:
        result = invoke_structured(
            prompt,
            ExtractResult,
            {
                "kinds": kinds_text,
                "priorities": priorities_text,
                "instructions": run.prompt or NO_INSTRUCTIONS,
                "document": batch.text,
            },
        )
        candidates += [c for item in result.requirements if (c := _candidate(item, set(batch.tags), kinds, priorities))]
        run.done_steps += 1
        db.commit()  # 진행률. updated_at 이 바뀌어 멈춘 분석으로 보지 않음
    return candidates


def _tag(value: str) -> str:
    value = value.strip().upper().strip("[]")
    return value if value.startswith("P") else f"P{value}"


def _candidate(item: ExtractedRequirement, tags: set[str], kinds: list[str], priorities: list[str]) -> Candidate | None:
    name = item.name.strip()[:NAME_MAX]
    if not name:
        return None
    # AI 가 목록에 없는 코드를 대면 첫 구분 / 보통으로 (사람이 검토 화면에서 고침)
    kind = item.kind if item.kind in kinds else kinds[0]
    fallback = DEFAULT_PRIORITY if DEFAULT_PRIORITY in priorities else priorities[0]
    priority = item.priority if item.priority in priorities else fallback
    evidence = []
    for ev in item.evidence:
        tag, quote = _tag(ev.page), ev.quote.strip()[:QUOTE_MAX]
        if tag in tags and quote and (tag, quote) not in evidence:  # 이 묶음에 없는 쪽 번호는 버림
            evidence.append((tag, quote))
    question = (item.question or "").strip() or None
    return Candidate(name, item.description.strip(), kind, priority, question, evidence)


def _dedupe_lines(candidates: list[Candidate], with_description: bool) -> str:
    lines = []
    for i, c in enumerate(candidates, 1):
        desc = c.description[:DEDUPE_DESCRIPTION_CHARS] if with_description else ""
        lines.append(f"{i}. {c.name}" + (f" - {desc}" if desc else ""))
    return "\n".join(lines)


def _dedupe(candidates: list[Candidate]) -> list[Candidate]:
    """이름·짧은 설명만 보내 같은 후보 묶음을 받음. 길면 이름만, 그래도 길면 합치기를 건너뜀"""
    budget = llm_settings.llm_max_input_chars - DEDUPE_HEADROOM
    text = _dedupe_lines(candidates, with_description=True)
    if len(text) > budget:
        text = _dedupe_lines(candidates, with_description=False)
    if len(text) > budget:
        logger.info("AI 분석 합치기 건너뜀 candidates=%s", len(candidates))
        return candidates
    result = invoke_structured(load_prompt(PROMPTS / "dedupe.md"), DedupeResult, {"candidates": text})

    merged_into: dict[int, int] = {}  # 후보 번호(0부터) → 남길 후보 번호
    for group in result.groups:
        ids = [i - 1 for i in dict.fromkeys(group) if 1 <= i <= len(candidates) and i - 1 not in merged_into]
        for i in ids[1:]:
            merged_into[i] = ids[0]
    kept = [c for i, c in enumerate(candidates) if i not in merged_into]
    for i, target in merged_into.items():
        # 앞 후보의 이름·설명·구분을 남기고 근거는 합침. 질문은 앞 후보에 없으면 가져옴
        keep, other = candidates[target], candidates[i]
        keep.evidence += [ev for ev in other.evidence if ev not in keep.evidence]
        keep.question = keep.question or other.question
    return kept


def _save(
    db: Session, run_id: int, document_id: int, candidates: list[Candidate], by_tag: dict[str, PageRef]
) -> int | None:
    document = repository.lock_document(db, document_id)
    run = repository.get_run(db, run_id)
    if run is None or run.status != RUNNING:  # 그사이 멈춤 정리됨 → 저장하지 않음
        db.rollback()
        logger.warning("AI 분석 결과 버림 (이미 끝난 요청) run_id=%s", run_id)
        return None

    now = datetime.now(UTC)
    seq = repository.max_seq(db, document_id)  # 지우기 전에 읽어 번호를 다시 쓰지 않음
    repository.soft_delete_ai_requirements(db, document_id, now)  # 처음 분석이면 지울 것이 없음
    index = {tag: i for i, tag in enumerate(by_tag, 1)}
    for c in candidates:
        seq += 1
        requirement = Requirement(
            document_id=document_id,
            seq=seq,
            name=c.name,
            kind=c.kind,
            priority=c.priority,
            description=c.description,
            ai_question=c.question,
        )
        repository.add(db, requirement)
        sources = []
        for order, (tag, quote) in enumerate(c.evidence, 1):
            page = by_tag[tag]
            found, end_page = locate(quote, page, by_tag.get(tag_of(index[tag] + 1)))
            sources.append(
                RequirementSource(
                    requirement_id=requirement.id,
                    source_page_id=page.id,
                    end_source_page_id=end_page.id if end_page else None,
                    quote=quote,
                    verified=found,
                    sort_order=order,
                )
            )
        repository.add_all(db, sources)
    repository.mark_sources_analyzed(db, document_id, run_id)
    run.status = SUCCEEDED
    run.done_steps = run.total_steps
    run.finished_at = now
    document.status = READY
    db.commit()
    return len(candidates)


def _fail(db: Session, run_id: int, document_id: int, code: str) -> None:
    document = repository.lock_document(db, document_id)
    run = repository.get_run(db, run_id)
    if run is None or run.status != RUNNING or document is None:
        db.rollback()
        return
    end_failed(db, run, document, code)
    db.commit()
