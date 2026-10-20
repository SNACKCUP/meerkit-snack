# 새 기능 추가하기

MeerKit을 Fork 해서 내 서비스를 만들 때 따라 하는 순서입니다.
예시로 `meetings`(회의록 요약) 기능을 추가한다고 가정합니다.

## 0. 샘플 서비스가 필요 없다면 먼저 지우기

```bash
rm -rf backend/app/features/requirements backend/tests/features/requirements
rm -rf frontend/src/features/requirements frontend/src/app/requirements
```

그리고 아래 두 파일에서 `requirements` 관련 줄을 지웁니다.

- `backend/app/api.py`
- `backend/alembic/env.py`

샘플 테이블 마이그레이션이 이미 있다면, 새 마이그레이션으로 테이블을 지우거나 새 프로젝트라면 `alembic/versions/`를 비우고 다시 생성합니다.

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

`requirements` 폴더를 복사해 이름을 바꾸고 내용을 고치는 것이 가장 빠릅니다.

### router.py 예시

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
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

공통 `llm` 모듈로 모델을 얻습니다. 기능 코드에서 공급자 패키지를 직접 import 하지 않습니다.

```python
from pydantic import BaseModel

from app.llm.client import get_chat_model
from app.llm.prompts import load_prompt


class MeetingSummary(BaseModel):
    summary: str
    action_items: list[str]


def summarize(text: str) -> MeetingSummary:
    model = get_chat_model().with_structured_output(MeetingSummary)
    prompt = load_prompt("meetings/summarize.md").format(text=text)
    return model.invoke(prompt)
```

## 5. 테스트

```text
backend/tests/features/meetings/test_router.py
```

- `conftest.py`의 인증 토큰 fixture와 TestClient를 그대로 씁니다.
- LLM은 Fake 모델로 바꿔 끼워 실제 API를 호출하지 않습니다.

```bash
uv run pytest tests/features/meetings
```

## 6. 프론트엔드 기능 폴더

```text
frontend/src/features/meetings/
├── api.ts
├── types.ts
├── components/
└── screens/
    └── MeetingListScreen.tsx
```

`api.ts`는 공통 API 클라이언트를 씁니다.

```ts
import { api } from "@/shared/api/client";
import type { Meeting, MeetingCreate } from "./types";

export const createMeeting = (body: MeetingCreate) =>
  api.post<Meeting>("/meetings", body).then((r) => r.data);
```

Next.js는 `src/app/` 아래 폴더 경로가 곧 URL입니다. 화면 로직은 `features/`에 두고, `app/`에는 import만 하는 얇은 페이지를 만듭니다.

```tsx
// frontend/src/app/meetings/page.tsx  →  /meetings
import { MeetingListScreen } from "@/features/meetings/screens/MeetingListScreen";

export default function Page() {
  return <MeetingListScreen />;
}
```

화면에서 `useState`, `useQuery`, 클릭 이벤트 등을 쓰면 해당 파일 맨 위에 `"use client";`를 적습니다.

## 7. 체크리스트

- [ ] 공통 기반(`core`, `auth`, `llm`, `shared`)에서 새 기능을 import 하지 않았다
- [ ] 수정한 공통 위치는 `api.py`, `alembic/env.py`, `src/app/<기능>/` 세 곳뿐이다
- [ ] 새 환경 변수가 있다면 `.env.example`과 README 환경 변수 표에 추가했다
- [ ] 테스트가 실제 LLM API를 호출하지 않는다
- [ ] `uv run pytest`, `uv run ruff check .`, `npm run lint`, `npm run build`가 통과한다
