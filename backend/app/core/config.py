from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "local"
    database_url: str
    jwt_secret_key: str
    jwt_expire_minutes: int = 60
    cors_origins: str = "http://localhost:3000"  # 여러 개면 쉼표로 구분
    llm_provider: str = "openai"
    llm_model: str = "gpt-4o-mini"
    openai_api_key: str = ""

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip(' "\'[]') for o in self.cors_origins.split(",") if o.strip(' "\'[]')]


settings = Settings()