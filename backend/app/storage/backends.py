"""저장 방법(백엔드). 새 업체를 붙이려면 Storage 를 따르는 클래스를 하나 더 만들고 get_storage 에 등록합니다."""

import logging
from functools import lru_cache
from typing import Protocol

from app.storage import errors
from app.storage.config import storage_settings

logger = logging.getLogger(__name__)

# 파일 key 에 무작위 값을 넣고 바뀔 때마다 새 key 를 쓰므로, 브라우저·CDN 이 오래 캐시해도 됩니다.
IMMUTABLE_CACHE = "public, max-age=31536000, immutable"


class Storage(Protocol):
    def put(self, key: str, data: bytes, content_type: str) -> None: ...

    def delete(self, key: str) -> None: ...

    def public_url(self, key: str) -> str: ...


class MemoryStorage:
    """테스트용. 프로세스 메모리에만 둡니다. objects 로 저장된 내용을 확인할 수 있습니다."""

    def __init__(self, base_url: str = "https://storage.test/public"):
        self.base_url = base_url
        self.objects: dict[str, tuple[bytes, str]] = {}

    def put(self, key: str, data: bytes, content_type: str) -> None:
        self.objects[key] = (data, content_type)

    def delete(self, key: str) -> None:
        self.objects.pop(key, None)

    def public_url(self, key: str) -> str:
        return f"{self.base_url}/{key}"


class S3Storage:
    """S3 호환 저장소 (Supabase Storage, AWS S3, Cloudflare R2, MinIO). 버킷은 미리 만들어 둡니다."""

    def __init__(self):
        import boto3
        from botocore.config import Config

        s = storage_settings
        if not (s.storage_s3_endpoint_url and s.storage_s3_access_key_id and s.storage_s3_secret_access_key):
            raise errors.not_configured()
        self.bucket = s.storage_bucket
        self.base_url = s.storage_public_base_url.rstrip("/")
        self.client = boto3.client(
            "s3",
            endpoint_url=s.storage_s3_endpoint_url,
            region_name=s.storage_s3_region,
            aws_access_key_id=s.storage_s3_access_key_id,
            aws_secret_access_key=s.storage_s3_secret_access_key,
            config=Config(
                s3={"addressing_style": "path"},  # Supabase 는 버킷을 주소 경로에 둡니다
                connect_timeout=s.storage_timeout_seconds,
                read_timeout=s.storage_timeout_seconds,
                retries={"max_attempts": 2},
            ),
        )

    def _call(self, action: str, key: str, **kwargs) -> None:
        from botocore.exceptions import BotoCoreError, ClientError

        try:
            getattr(self.client, action)(Bucket=self.bucket, Key=key, **kwargs)
        except (BotoCoreError, ClientError) as e:
            logger.error("저장소 %s 실패 key=%s error=%s", action, key, type(e).__name__)
            raise errors.unavailable() from e

    def put(self, key: str, data: bytes, content_type: str) -> None:
        self._call("put_object", key, Body=data, ContentType=content_type, CacheControl=IMMUTABLE_CACHE)

    def delete(self, key: str) -> None:
        self._call("delete_object", key)

    def public_url(self, key: str) -> str:
        return f"{self.base_url}/{key}"


_override: Storage | None = None


@lru_cache
def _memory() -> MemoryStorage:
    return MemoryStorage()


@lru_cache
def _s3() -> S3Storage:
    return S3Storage()


def get_storage() -> Storage:
    """설정에 맞는 저장소. 설정이 비어 있으면 StorageNotConfiguredError(503)."""
    if _override is not None:
        return _override
    backend = storage_settings.storage_backend
    if backend == "s3":
        return _s3()
    if backend == "memory":
        return _memory()
    raise errors.not_configured()


def override_storage(storage: Storage | None) -> None:
    """테스트에서 저장소를 바꿔 끼웁니다. None 이면 원래대로."""
    global _override
    _override = storage
