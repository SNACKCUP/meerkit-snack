"""AI 테스트 API: 로그인 필수, 사용자 키 필수, 오류 변환, 키가 응답·로그에 남지 않음"""

import logging

from langchain_core.messages import AIMessage
from langchain_core.outputs import ChatGeneration, ChatResult

from app.llm import override_chat_model
from app.llm.config import llm_settings
from app.llm.testing import FakeChatModel


class UsageModel(FakeChatModel):
    """토큰 사용량이 붙은 응답을 돌려주는 가짜 모델"""

    def _generate(self, messages, stop=None, run_manager=None, **kwargs):
        message = AIMessage(content="안녕하세요!", usage_metadata={"input_tokens": 12, "output_tokens": 5, "total_tokens": 17})
        return ChatResult(generations=[ChatGeneration(message=message)])


KEY = "sk-test-SECRET-1234567890"


def _post(client, headers, key=KEY, **body):
    h = dict(headers)
    if key:
        h["X-LLM-API-Key"] = key
    return client.post("/api/llm/chat", json={"message": "안녕", **body}, headers=h)


def test_requires_login(client):
    response = client.post("/api/llm/chat", json={"message": "안녕"}, headers={"X-LLM-API-Key": KEY})
    assert response.status_code == 401


def test_returns_reply_and_usage(client, make_user, login, monkeypatch):
    monkeypatch.setattr(llm_settings, "llm_provider", "openai")
    make_user("chat01")
    with override_chat_model(UsageModel()):
        response = _post(client, login("chat01"))
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["reply"] == "안녕하세요!"
    assert body["usage"] == {"input_tokens": 12, "output_tokens": 5, "total_tokens": 17}
    assert KEY not in response.text


def test_key_is_required(client, make_user, login, monkeypatch):
    monkeypatch.setattr(llm_settings, "llm_provider", "openai")
    make_user("chat02")
    response = _post(client, login("chat02"), key=None)
    assert response.status_code == 400
    assert response.json()["code"] == "LLM_KEY_REQUIRED"


def test_unknown_model_is_rejected(client, make_user, login, monkeypatch):
    monkeypatch.setattr(llm_settings, "llm_provider", "openai")
    make_user("chat03")
    response = _post(client, login("chat03"), model="not-a-model")
    assert response.status_code == 422


def test_invalid_key_is_reported_as_key_problem(client, make_user, login, monkeypatch):
    monkeypatch.setattr(llm_settings, "llm_provider", "openai")
    make_user("chat04")

    class AuthenticationError(Exception):
        pass

    with override_chat_model(FakeChatModel(responses=[AuthenticationError("bad key sk-test-SECRET")])):
        response = _post(client, login("chat04"))
    assert response.status_code == 401
    assert response.json()["code"] == "LLM_KEY_INVALID"
    assert "SECRET" not in response.text


def test_key_and_message_never_logged(client, make_user, login, monkeypatch, caplog):
    monkeypatch.setattr(llm_settings, "llm_provider", "openai")
    make_user("chat05")
    headers = login("chat05")
    with caplog.at_level(logging.DEBUG), override_chat_model(UsageModel()):
        _post(client, headers, message="아주비밀스러운질문")
    assert KEY not in caplog.text
    assert "아주비밀스러운질문" not in caplog.text


def test_fake_provider_needs_no_key(client, make_user, login, monkeypatch):
    monkeypatch.setattr(llm_settings, "llm_provider", "fake")
    make_user("chat06")
    response = _post(client, login("chat06"), key=None)
    assert response.status_code == 200
    assert response.json()["reply"]


def test_exhausted_credit_is_reported_as_quota_not_rate_limit(client, make_user, login, monkeypatch):
    monkeypatch.setattr(llm_settings, "llm_provider", "openai")
    make_user("chat07")

    class RateLimitError(Exception):
        code = "credit_balance_exhausted"

    with override_chat_model(FakeChatModel(responses=[RateLimitError("credit exhausted sk-test-SECRET")])):
        response = _post(client, login("chat07"))
    assert response.status_code == 429
    assert response.json()["code"] == "LLM_QUOTA_EXCEEDED"
    assert "SECRET" not in response.text
