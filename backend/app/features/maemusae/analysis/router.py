"""매무새 AI 분석 API: /api/mms/projects/{project_id}/documents/{document_id}

| 경로                | 누가                    |
| POST /analyze       | 멤버 (202, 분석은 뒤에서) |
| GET  /analysis      | 멤버, 또는 MASTER 보기만  |

분석은 쓰기라 멤버만 합니다. 보기 전용 MASTER 는 멤버가 아니라서 404 입니다 (project_member 규칙 그대로).
"""

from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.features.maemusae.access import ProjectAccess, project_member, project_viewer
from app.features.maemusae.analysis import runner, service
from app.features.maemusae.analysis.schemas import (
    AnalysisRunRead,
    AnalysisStarted,
    AnalyzeRequest,
)

router = APIRouter(prefix="/projects/{project_id}/documents/{document_id}", tags=["mms-analysis"])


@router.post(
    "/analyze",
    response_model=AnalysisStarted,
    status_code=status.HTTP_202_ACCEPTED,
    summary="AI 분석 시작 (멤버, 응답 뒤 분석은 뒤에서)",
    description=(
        "분석 요청을 만들고 바로 202 를 돌려줍니다. 진행률은 GET /analysis 로 읽습니다. "
        "이미 AI 후보가 있으면 restart=true 일 때만 처음부터 다시 분석합니다 (직접 추가한 후보는 남김). "
        "오류: 400 ANALYSIS_NO_SOURCES, 409 DOCUMENT_BUSY·DOCUMENT_CONFIRMED·ANALYSIS_RESTART_REQUIRED, "
        "422 DOCUMENT_TOO_LARGE_TO_ANALYZE"
    ),
)
def analyze(
    document_id: int,
    body: AnalyzeRequest,
    tasks: BackgroundTasks,
    access: ProjectAccess = Depends(project_member),
    db: Session = Depends(get_db),
):
    started = service.start_analysis(db, access, document_id, body)
    tasks.add_task(runner.run_analysis, started.run_id)
    return started


@router.get(
    "/analysis",
    response_model=AnalysisRunRead | None,
    summary="마지막 분석 진행률 (멤버, 또는 MASTER 보기만). 분석한 적 없으면 null",
)
def get_analysis(document_id: int, access: ProjectAccess = Depends(project_viewer), db: Session = Depends(get_db)):
    return service.get_latest_run(db, access, document_id)
