# 새 기능 추가하기

MeerKit을 Fork 해서 내 서비스를 만들 때 따라 하는 순서입니다.
예시로 `meetings`(회의록 요약) 기능을 추가한다고 가정합니다.

## 0. 서브 서비스가 필요 없다면 먼저 지우기

```bash
rm -rf backend/app/features/maemusae backend/tests/features/maemusae
rm -rf "frontend/src/app/(sub)/maemusae"
```

그리고 아래 두 파일에서 `maemusae` 관련 줄을 지웁니다.

- `backend/app/api.py`
- `backend/alembic/env.py`

서브 서비스 테이블(`mms_` 로 시작) 마이그레이션이 이미 있다면, 새 마이그레이션으로 테이블을 지우거나 새 프로젝트라면 `alembic/versions/`를 비우고 다시 생성합니다.

## 1. 백엔드 기능 폴더 만들기

```text
backend/app/features/meetings/
├── __init__.py
├── router.py
├── service.py
├── schemas.py
├── models.py
├── chains.py      # LLM을 쓴다면
└── prompts/       # 프롬프트를 쓴다면
```

`maemusae/projects` 폴더(router·service·repository·schemas·models)를 복사해 이름을 바꾸고 내용을 고치는 것이 가장 빠릅니다.

### router.py 예시

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.auth.deps import get_current_user
from app.features.meetings import service
from app.features.meetings.schemas import MeetingCreate, MeetingRead

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.post("", response_model=MeetingRead)
def create_meeting(
    body: MeetingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return service.create_meeting(db, user, body)
```

### 오류는 service에서 AppError로 던지기

router에서 try/except로 `HTTPException`을 만들 필요가 없습니다. service가 `app.core.exceptions`의 예외를 던지면 전역 핸들러가 `{"detail", "code", "request_id"}` 형식과 상태 코드를 정합니다.

```python
from app.core.exceptions import ConflictError, NotFoundError


def get_meeting(db, meeting_id: int):
    meeting = repository.get(db, meeting_id)
    if meeting is None:
        raise NotFoundError("MEETING_NOT_FOUND", "회의를 찾을 수 없습니다.")  # → 404
    return meeting
```

- 상태별 예외: `BadRequestError` 400, `UnauthorizedError` 401, `ForbiddenError` 403, `NotFoundError` 404, `ConflictError` 409, `ValidationError` 422, `RateLimitedError` 429(`retry_after=초`).
- `code`는 영문 대문자 상수(예: `MEETING_NOT_FOUND`)로, 프론트와 로그에서 오류를 구분하는 값입니다. `detail`은 사용자에게 그대로 보여 줄 문장입니다.
- 지금 있는 `HTTPException`도 같은 형식으로 감싸지므로 급하게 바꿀 필요는 없습니다.

### models.py 예시

```python
from sqlalchemy import ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.models import TimestampMixin


class Meeting(TimestampMixin, Base):
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    content: Mapped[str] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
```

## 2. 등록하기 (세 곳)

`backend/app/api.py`

```python
from app.features.meetings.router import router as meetings_router

api_router.include_router(meetings_router)
```

`backend/alembic/env.py`

```python
import app.features.meetings.models  # noqa: F401
```

## 3. 마이그레이션

```bash
cd backend
uv run alembic revision --autogenerate -m "add meetings"
uv run alembic upgrade head
```

생성된 파일(`alembic/versions/...`)을 열어 의도한 테이블만 들어 있는지 확인한 뒤 커밋합니다.

## 4. LLM을 쓴다면

공통 `llm` 모듈의 `load_prompt`와 `invoke_structured`만 씁니다. 기능 코드에서 공급자 패키지(openai 등)를 직접 import 하지 않습니다.

**1) 프롬프트 파일** `backend/app/features/meetings/prompts/summarize.md`

```markdown
## system
너는 회의록을 정리하는 비서다. 회의록에 없는 내용은 지어내지 않는다.

## user
다음 회의록을 3문장 이내로 요약하고, 할 일(담당자·내용·기한)을 뽑아 줘.

{notes}
```

변수는 `{이름}`, 중괄호 자체를 쓰려면 `{{ }}`입니다.

**2) 응답 스키마와 service**

```python
# backend/app/features/meetings/service.py
from pathlib import Path

from pydantic import BaseModel

from app.llm import invoke_structured, load_prompt

PROMPT = Path(__file__).parent / "prompts" / "summarize.md"


class ActionItem(BaseModel):
    owner: str
    task: str
    due: str | None = None


class MeetingSummary(BaseModel):
    summary: str
    action_items: list[ActionItem]


def summarize(notes: str) -> MeetingSummary:
    # 형식이 틀리면 1번 다시 묻고, 실패·시간 초과·키 없음 등은 LLMError(AppError)로 올라가
    # 전역 핸들러가 {"detail", "code", "request_id"}로 응답합니다. router 에 try/except 가 필요 없습니다.
    return invoke_structured(load_prompt(PROMPT), MeetingSummary, {"notes": notes})
```

**3) 테스트** — `fake_llm` 픽스처로 키 없이 돌립니다.

```python
def test_summarize(fake_llm):
    fake_llm.responses.append(
        {"summary": "배포 일정을 논의했다.", "action_items": [{"owner": "김미어", "task": "시안", "due": "금요일"}]}
    )
    result = summarize("10/24 회의 ...")
    assert result.action_items[0].owner == "김미어"
    assert "10/24 회의" in fake_llm.calls[0][-1].content  # 모델에 들어간 메시지 확인
```

- 로컬에서 키 없이 화면을 만들 때는 `.env`에 `LLM_PROVIDER=fake` (스키마 모양의 예시 값을 돌려줌, 운영에서는 시작이 막힘).
- 실제 호출: `.env`에 `OPENAI_API_KEY`를 넣으면 같은 코드가 OpenAI로 호출됩니다.
- 긴 입력은 `LLM_MAX_INPUT_CHARS`(기본 20,000자)를 넘으면 413 `LLM_INPUT_TOO_LONG`으로 막힙니다. 긴 문서는 나눠서 부르세요.

## 5. 테스트

```text
backend/tests/features/meetings/test_router.py
```

- `conftest.py`의 인증 토큰 fixture와 TestClient를 그대로 씁니다.
- LLM은 Fake 모델로 바꿔 끼워 실제 API를 호출하지 않습니다.

```bash
uv run pytest tests/features/meetings
```

## 6. 프론트엔드 화면

서비스 화면은 `src/app/(service)/` 아래에 만듭니다. `(service)`는 URL에 나타나지 않습니다.

```text
frontend/src/app/(service)/meetings/
├── page.tsx           →  /meetings
├── [id]/page.tsx      →  /meetings/123
└── _components/       # 이 화면에서만 쓰는 부품 (밑줄 폴더는 URL이 되지 않음)
    ├── api.ts
    ├── types.ts
    └── MeetingList.tsx
```

킷 기능은 **`@/meerkit`(공개 API)에서만** import 합니다. 킷 내부 파일(`@/meerkit/api/...`)을 직접 import 하면 ESLint가 막습니다.

```ts
// _components/api.ts
import { api } from "@/meerkit";
import type { Meeting, MeetingCreate } from "./types";

export const createMeeting = (body: MeetingCreate) =>
  api.post<Meeting>("/meetings", body).then((r) => r.data);
```

로그인이 필요한 화면은 가드로 감쌉니다. 화면에서 `useState`, `useQuery`, 클릭 이벤트 등을 쓰면 해당 파일 맨 위에 `"use client";`를 적습니다.

```tsx
// page.tsx
import { RequireAuth } from "@/meerkit";
import { MeetingList } from "./_components/MeetingList";

export default function Page() {
  return (
    <RequireAuth>
      <MeetingList />
    </RequireAuth>
  );
}
```

관리자만 쓰는 화면은 `<RequireRole role="MASTER">`, 백엔드 API는 `Depends(require_admin)`(`app.core.principal`, 관리자 역할은 `MASTER`)를, 로그인만 확인할 때는 `Depends(require_login)`을 씁니다. 회원 정보가 필요하면 `get_current_user`(`app.auth.deps`)를 함께 받습니다.

UI 부품은 `@/components/ui`(shadcn)를, 스타일은 Tailwind utility를 씁니다.

## 7. 체크리스트

- [ ] 공통 기반(`core`, `users`, `auth`, `permissions`, `account`, `llm`, `mail`, `storage`, `codes`, `src/meerkit`)에서 새 기능을 import 하지 않았다
- [ ] 수정한 공통 위치는 `api.py`, `alembic/env.py`, `src/app/(service)/<기능>/` 세 곳뿐이다
- [ ] 새 환경 변수가 있다면 `.env.example`과 README 환경 변수 표에 추가했다
- [ ] 테스트가 실제 LLM API를 호출하지 않는다
- [ ] `uv run pytest`, `uv run ruff check .`, `npm run lint`, `npm run build`가 통과한다
