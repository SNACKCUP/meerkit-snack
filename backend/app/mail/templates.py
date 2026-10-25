"""메일 템플릿. 이름 → (제목, 본문) 을 만드는 함수입니다. 본문은 텍스트와 HTML 두 가지를 만듭니다."""

from collections.abc import Callable
from dataclasses import dataclass
from html import escape
from typing import Any

APP_NAME = "MeerKit"


@dataclass(frozen=True)
class Rendered:
    subject: str
    text: str
    html: str


def _html(paragraphs: list[str]) -> str:
    body = "".join(f"<p>{p}</p>" for p in paragraphs)
    return f'<!doctype html><html lang="ko"><body style="font-family:sans-serif">{body}</body></html>'


def _email_code(data: dict[str, Any]) -> Rendered:
    code, minutes = str(data["code"]), int(data["expire_minutes"])
    return Rendered(
        subject=f"[{APP_NAME}] 이메일 인증번호",
        text=(
            f"인증번호: {code}\n\n"
            f"{minutes}분 안에 가입 화면에 입력해 주세요.\n"
            "본인이 요청하지 않았다면 이 메일을 무시하세요."
        ),
        html=_html(
            [
                f"인증번호: <strong style=\"font-size:20px\">{escape(code)}</strong>",
                f"{minutes}분 안에 가입 화면에 입력해 주세요.",
                "본인이 요청하지 않았다면 이 메일을 무시하세요.",
            ]
        ),
    )


def _password_reset(data: dict[str, Any]) -> Rendered:
    name, link, minutes = str(data["name"]), str(data["link"]), int(data["expire_minutes"])
    return Rendered(
        subject=f"[{APP_NAME}] 비밀번호 재설정 안내",
        text=(
            f"{name}님, 아래 링크에서 새 비밀번호를 설정해 주세요.\n\n{link}\n\n"
            f"링크는 {minutes}분 동안 한 번만 쓸 수 있습니다.\n"
            "본인이 요청하지 않았다면 이 메일을 무시하세요. 비밀번호는 바뀌지 않습니다."
        ),
        html=_html(
            [
                f"{escape(name)}님, 아래 링크에서 새 비밀번호를 설정해 주세요.",
                f'<a href="{escape(link)}">비밀번호 재설정하기</a>',
                f"링크는 {minutes}분 동안 한 번만 쓸 수 있습니다.",
                "본인이 요청하지 않았다면 이 메일을 무시하세요. 비밀번호는 바뀌지 않습니다.",
            ]
        ),
    )


TEMPLATES: dict[str, Callable[[dict[str, Any]], Rendered]] = {
    "email_code": _email_code,
    "password_reset": _password_reset,
}


def render(template: str, data: dict[str, Any]) -> Rendered:
    try:
        builder = TEMPLATES[template]
    except KeyError:
        raise ValueError(f"없는 메일 템플릿입니다: {template}") from None
    return builder(data)
