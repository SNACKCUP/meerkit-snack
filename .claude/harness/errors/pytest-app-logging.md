# pytest로 app 로그 검사하기

> 대상: `backend/tests/` (pytest 9, `caplog`). S1(오류·접근 로그)과 S2(LLM 로그) 테스트에서 같은 문제가 반복되어 정리함.

## 왜 caplog가 비어 있나

- `app/core/logging.py`의 `setup_logging()`은 `app` 로거에 `propagate = False`를 건다. 운영에서 같은 줄이 루트 로거로 한 번 더 찍히는 것을 막기 위해서다.
- pytest의 `caplog`는 루트 로거에 붙은 핸들러로 로그를 받는다. 그래서 `app.*` 로그는 `caplog.at_level(...)`을 써도 `caplog.records`가 비어 있고, 테스트는 "로그가 안 남는다"로 실패한다.

## 규칙

- Always: `app.*` 로그를 `caplog`로 검사할 때는 테스트 동안만 `logging.getLogger("app").propagate = True`로 켜고, `try/finally`(또는 fixture의 `yield` 뒤)에서 반드시 `False`로 되돌린다. (이유: 되돌리지 않으면 뒤 테스트의 로그가 두 번 찍히고, 실행 순서에 따라 결과가 달라진다)
- Always: 로거 이름을 좁혀서 잡는다. 예: `caplog.at_level(logging.ERROR, logger="app.error")`, `logger="app.llm"`. (이유: 접근 로그 등 다른 줄이 섞이면 검사가 흔들린다)
- Always: 한 파일의 여러 테스트가 로그를 검사하면 그 파일에 `autouse` fixture로 한 번만 둔다. 예시는 `tests/kit/test_llm.py`의 `_llm_logs_visible`.
- Never: 테스트를 통과시키려고 `app/core/logging.py`의 `propagate = False`를 지우거나 바꾸지 않는다. (이유: 운영 로그가 중복된다)
- Always: 비밀값이 로그에 없는지도 같이 검사한다 (`caplog.text`에 비밀번호·토큰·인증번호·API 키·프롬프트 원문이 없어야 함). 로그 검사 테스트를 쓰는 김에 함께 확인한다.

## 예시

```python
import logging

import pytest


@pytest.fixture(autouse=True)
def _app_logs_visible():
    # app 로거는 propagate=False 라서 caplog 가 받도록 테스트 동안만 켭니다
    logger = logging.getLogger("app")
    logger.propagate = True
    yield
    logger.propagate = False


def test_logs_only_safe_fields(caplog):
    with caplog.at_level(logging.INFO, logger="app.llm"):
        ...  # 로그를 남기는 코드 실행
    assert "LLM 호출" in caplog.text
    assert "sk-" not in caplog.text  # API 키가 섞이지 않음
```

한 테스트에서만 필요하면 fixture 대신 `try/finally`로 감싼다 (`tests/kit/test_errors.py`의 500 오류 로그 테스트 참고).
