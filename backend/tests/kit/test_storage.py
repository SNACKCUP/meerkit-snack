"""저장소 공통 모듈: 설정에 따른 선택과 운영 설정 검사"""

import pytest

from app.core.config import settings
from app.storage import get_storage
from app.storage.backends import MemoryStorage
from app.storage.config import production_problems, storage_settings
from app.storage.errors import StorageNotConfiguredError


def test_empty_backend_is_not_configured(monkeypatch):
    monkeypatch.setattr(storage_settings, "storage_backend", "")
    with pytest.raises(StorageNotConfiguredError):
        get_storage()


def test_s3_without_keys_is_not_configured(monkeypatch):
    monkeypatch.setattr(storage_settings, "storage_backend", "s3")
    monkeypatch.setattr(storage_settings, "storage_s3_endpoint_url", "")
    with pytest.raises(StorageNotConfiguredError):
        get_storage()


def test_memory_backend_roundtrip(monkeypatch):
    monkeypatch.setattr(storage_settings, "storage_backend", "memory")
    storage = get_storage()
    assert isinstance(storage, MemoryStorage)
    storage.put("a/b.txt", b"hi", "text/plain")
    assert storage.public_url("a/b.txt").endswith("/a/b.txt")
    storage.delete("a/b.txt")
    storage.delete("a/b.txt")  # 없는 파일 삭제도 오류 없음
    assert "a/b.txt" not in storage.objects


def test_production_blocks_memory_and_localhost_url(monkeypatch):
    monkeypatch.setattr(settings, "app_env", "production")
    monkeypatch.setattr(storage_settings, "storage_backend", "memory")
    assert any("STORAGE_BACKEND" in p for p in production_problems())

    monkeypatch.setattr(storage_settings, "storage_backend", "s3")
    monkeypatch.setattr(storage_settings, "storage_public_base_url", "http://127.0.0.1:54321/x")
    assert any("STORAGE_PUBLIC_BASE_URL" in p for p in production_problems())

    monkeypatch.setattr(storage_settings, "storage_backend", "")
    assert production_problems() == []  # 비어 있으면 서버는 뜨고 저장 기능만 503


def _s3(monkeypatch):
    from app.storage.backends import S3Storage

    for name, value in {
        "storage_s3_endpoint_url": "http://127.0.0.1:54321/storage/v1/s3",
        "storage_s3_access_key_id": "test-key",
        "storage_s3_secret_access_key": "test-secret",
        "storage_bucket": "meerkit-public",
        "storage_public_base_url": "http://127.0.0.1:54321/storage/v1/object/public/meerkit-public/",
    }.items():
        monkeypatch.setattr(storage_settings, name, value)
    return S3Storage()


def test_s3_put_sends_content_type_and_long_cache(monkeypatch):
    from botocore.stub import Stubber

    storage = _s3(monkeypatch)
    with Stubber(storage.client) as stub:
        stub.add_response(
            "put_object",
            {},
            {
                "Bucket": "meerkit-public",
                "Key": "avatars/a.webp",
                "Body": b"img",
                "ContentType": "image/webp",
                "CacheControl": "public, max-age=31536000, immutable",
            },
        )
        storage.put("avatars/a.webp", b"img", "image/webp")
        stub.assert_no_pending_responses()
    assert storage.public_url("avatars/a.webp") == (
        "http://127.0.0.1:54321/storage/v1/object/public/meerkit-public/avatars/a.webp"
    )


def test_s3_errors_become_storage_unavailable(monkeypatch):
    from botocore.stub import Stubber

    from app.storage.errors import StorageError

    storage = _s3(monkeypatch)
    with Stubber(storage.client) as stub:
        stub.add_client_error("delete_object", service_error_code="AccessDenied", http_status_code=403)
        with pytest.raises(StorageError) as caught:
            storage.delete("avatars/a.webp")
    assert caught.value.code == "STORAGE_UNAVAILABLE"
