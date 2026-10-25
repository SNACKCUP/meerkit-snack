from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "local"
    log_level: str = "INFO"
    database_url: str
    test_database_url: str = ""  # pytest 전용 DB 주소, 비우면 DATABASE_URL 사용
    jwt_secret_key: str
    jwt_expire_minutes: int = 30  # 액세스 토큰 유효 시간(분)
    refresh_token_expire_days: int = 14  # 리프레시 토큰(httpOnly 쿠키) 유효 기간(일)
    cookie_secure: bool = False  # 배포(https)에서는 true
    cors_origins: str = "http://localhost:3000"  # 여러 개면 쉼표로 구분
    # 로그인 잠금: 연속 N회 실패하면 M분 잠금 (프론트 meerkit.config.ts의 login과 같은 값). 0이면 끔
    login_lock_max_attempts: int = 5
    login_lock_minutes: int = 5

    # 가입 이메일 인증: true면 인증번호 확인을 마쳐야 가입 가능 (프론트 signup.emailVerification도 true로)
    signup_email_verification_required: bool = True
    email_code_expire_minutes: int = 10
    email_code_max_attempts: int = 5
    email_verification_token_expire_minutes: int = 30  # 인증을 마친 뒤 가입을 끝내야 하는 시간

    # 메일 안의 링크가 여는 프론트 주소 (예: 비밀번호 재설정 화면)
    frontend_base_url: str = "http://localhost:3000"

    # 메일 발송: console(로컬, 로그로만) / smtp(Mailpit 또는 메일 업체) / fake(테스트)
    mail_backend: str = "console"
    mail_from: str = "MeerKit <no-reply@localhost>"
    mail_smtp_host: str = "localhost"
    mail_smtp_port: int = 1025  # Mailpit 기본 포트
    mail_smtp_username: str = ""
    mail_smtp_password: str = ""
    mail_smtp_starttls: bool = False  # 587 포트 업체는 보통 true
    mail_smtp_ssl: bool = False  # 465 포트 업체는 true
    mail_smtp_timeout: int = 10  # 초
    # 같은 이메일로 보내는 인증·재설정 메일 제한
    mail_cooldown_seconds: int = 60
    mail_daily_limit: int = 10

    llm_provider: str = "openai"
    llm_model: str = "gpt-4o-mini"
    openai_api_key: str = ""

    # 로컬 테스트용 관리자 시드 계정 (uv run python -m app.users.seed)
    seed_admin_user_id: str = "admin"
    seed_admin_email: str = "admin@example.com"
    seed_admin_password: str = ""
    seed_admin_name: str = "관리자"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip(' "\'[]') for o in self.cors_origins.split(",") if o.strip(' "\'[]')]


settings = Settings()
