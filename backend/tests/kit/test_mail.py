import logging

from app.core.config import settings
from app.mail import send_mail


def test_send_mail_renders_template_into_outbox(mail_outbox):
    assert send_mail("a@example.com", "email_code", {"code": "123456", "expire_minutes": 10})
    [message] = mail_outbox
    assert message.to == "a@example.com"
    assert "인증번호" in message.subject
    assert "123456" in message.text and "123456" in message.html


def test_html_escapes_values(mail_outbox):
    send_mail(
        "a@example.com",
        "password_reset",
        {"name": "<b>x</b>", "link": "http://localhost/reset?token=t", "expire_minutes": 30},
    )
    assert "<b>x</b>" not in mail_outbox[0].html


def test_failure_returns_false_and_logs_without_data(mail_outbox, caplog, monkeypatch):
    monkeypatch.setattr(settings, "mail_backend", "smtp")
    monkeypatch.setattr(settings, "mail_smtp_host", "127.0.0.1")
    monkeypatch.setattr(settings, "mail_smtp_port", 1)  # 아무도 듣지 않는 포트
    with caplog.at_level(logging.ERROR, logger="app.mail"):
        ok = send_mail("a@example.com", "email_code", {"code": "987654", "expire_minutes": 10})
    assert ok is False
    assert "메일 발송 실패" in caplog.text
    assert "987654" not in caplog.text


def test_unknown_template_is_reported_not_raised(mail_outbox):
    assert send_mail("a@example.com", "nope", {}) is False
    assert mail_outbox == []


def test_console_backend_hides_body_outside_local(caplog, monkeypatch):
    monkeypatch.setattr(settings, "mail_backend", "console")
    monkeypatch.setattr(settings, "app_env", "production")
    with caplog.at_level(logging.INFO, logger="app.mail"):
        send_mail("a@example.com", "email_code", {"code": "555111", "expire_minutes": 10})
    assert "a@example.com" in caplog.text
    assert "555111" not in caplog.text
