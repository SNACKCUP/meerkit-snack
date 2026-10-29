"""매무새 설정. 매무새 모듈만 읽습니다 (킷은 이 설정을 모름). 환경 변수 이름은 MMS_ 로 시작합니다."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class MaemusaeSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mms_source_max_bytes: int = 10 * 1024 * 1024  # 올리는 파일 하나의 크기. 넘으면 413 FILE_TOO_LARGE
    mms_sources_per_document: int = 20  # 문서 하나에 올릴 수 있는 파일·직접 쓴 글 수
    mms_source_max_chars: int = 200_000  # 파일 하나에서 뽑은 본문 글자 수. 넘으면 422 DOCUMENT_TOO_LONG
    mms_page_max_chars: int = 4000  # 쪽 정보가 없는 형식(docx·txt·md·시트)을 글자 수로 나눌 때 한 조각의 크기


mms_settings = MaemusaeSettings()
