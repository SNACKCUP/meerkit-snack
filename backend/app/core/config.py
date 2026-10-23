from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "local"
    database_url: str
    test_database_url: str = ""  # pytest 전용 DB 주소, 비우면 DATABASE_URL 사용
    jwt_secret_key: str
    jwt_expire_minutes: int = 30  # 액세스 토큰 유효 시간(분)
    refresh_token_expire_days: int = 14  # 리프레시 토큰(httpOnly 쿠키) 유효 기간(일)
    cookie_secure: bool = False  # 배포(https)에서는 true
    cors_origins: str = "http://localhost:3000"  # 여러 개면 쉼표로 구분
    llm_provider: str = "openai"
    llm_model: str = "gpt-4o-mini"
    openai_api_key: str = ""

    # 로컬 테스트용 관리자 시드 계정 (uv run python -m app.users.seed)
    seed_admin_email: str = "admin@example.com"
    seed_admin_password: str = ""
    seed_admin_name: str = "관리자"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip(' "\'[]') for o in self.cors_origins.split(",") if o.strip(' "\'[]')]


settings = Settings()
