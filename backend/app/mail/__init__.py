"""메일 발송 공통 모듈. 어디서든 send_mail 하나만 불러 씁니다.

    from app.mail import send_mail
    background_tasks.add_task(send_mail, user.email, "password_reset", {"name": ..., "link": ...})

발송 방법은 .env 의 MAIL_BACKEND 로 고릅니다: console(로컬) / smtp / fake(테스트).
새 메일 종류는 templates.py 에 템플릿을 추가합니다.
"""

from app.mail.service import send_mail

__all__ = ["send_mail"]
