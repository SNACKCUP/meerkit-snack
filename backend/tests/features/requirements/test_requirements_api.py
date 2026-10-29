from io import BytesIO

import pytest
from openpyxl import load_workbook

BASE = "/api/requirements"


@pytest.fixture(autouse=True)
def logged_in(client, make_user, login):
    """매무새 API는 모두 로그인이 필요합니다. 이 파일의 요청은 일반 회원(VIEWER)으로 보냅니다."""
    make_user("viewer01")
    client.headers.update(login("viewer01"))


def test_requirements_need_login(client):
    client.headers.pop("Authorization")
    response = client.get(f"{BASE}/documents")

    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"


def test_upload_document(client):
    files = {"file": ("요청서.docx", b"hello", "application/octet-stream")}
    response = client.post(f"{BASE}/documents", files=files)

    assert response.status_code == 201
    body = response.json()
    assert body["filename"] == "요청서.docx"
    assert body["size_bytes"] == 5
    assert body["status"] == "parsed"


def test_upload_rejects_unsupported_extension(client):
    files = {"file": ("요청서.hwp", b"hello", "application/octet-stream")}
    response = client.post(f"{BASE}/documents", files=files)

    assert response.status_code == 415
    assert response.json()["code"] == "UNSUPPORTED_FILE_TYPE"


def test_list_documents(client):
    response = client.get(f"{BASE}/documents")

    assert response.status_code == 200
    assert response.json()[0]["id"] == 1


def test_get_document(client):
    response = client.get(f"{BASE}/documents/1")

    assert response.status_code == 200
    assert response.json()["status"] == "analyzed"


def test_get_unknown_document_returns_404(client):
    response = client.get(f"{BASE}/documents/999")

    assert response.status_code == 404
    body = response.json()
    assert body["code"] == "DOCUMENT_NOT_FOUND"
    assert body["detail"] == "문서 999를 찾을 수 없습니다."


def test_analyze_document(client):
    response = client.post(f"{BASE}/documents/1/analyze")

    assert response.status_code == 200
    requirements = response.json()
    assert {r["type"] for r in requirements} == {
        "functional",
        "non_functional",
        "constraint",
    }
    assert all(r["status"] == "draft" for r in requirements)


def test_list_requirements(client):
    response = client.get(f"{BASE}/documents/1/requirements")

    assert response.status_code == 200
    first = response.json()[0]
    assert first["code"] == "REQ-001"
    assert set(first) >= {
        "title",
        "description",
        "source_text",
        "priority",
        "clarification",
    }


def test_update_requirement_changes_only_sent_fields(client):
    response = client.patch(
        f"{BASE}/documents/1/requirements/1", json={"priority": "low"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["priority"] == "low"
    assert body["title"] == "소셜 로그인"


def test_update_unknown_requirement_returns_404(client):
    response = client.patch(
        f"{BASE}/documents/1/requirements/999", json={"priority": "low"}
    )

    assert response.status_code == 404
    assert response.json()["code"] == "REQUIREMENT_NOT_FOUND"


def test_confirm_requirements(client):
    response = client.post(
        f"{BASE}/documents/1/confirm", json={"requirement_ids": [1, 3]}
    )

    assert response.status_code == 200
    assert response.json() == {
        "document_id": 1,
        "confirmed_count": 2,
        "rejected_count": 1,
        "status": "confirmed",
    }


def test_confirm_requires_at_least_one_requirement(client):
    response = client.post(f"{BASE}/documents/1/confirm", json={"requirement_ids": []})

    assert response.status_code == 422


def test_generate_spec(client):
    response = client.post(f"{BASE}/documents/1/spec")

    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["feature_id"] == "F-001"
    assert item["requirement_codes"] == ["REQ-001"]


def test_get_spec(client):
    response = client.get(f"{BASE}/documents/1/spec")

    assert response.status_code == 200
    assert response.json()["title"] == "쇼핑몰 리뉴얼 기능정의서"


def test_export_spec_returns_xlsx(client):
    response = client.get(f"{BASE}/documents/1/spec/export")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert "feature_spec_1.xlsx" in response.headers["content-disposition"]
    sheet = load_workbook(BytesIO(response.content)).active
    assert sheet["A2"].value == "기능 ID"
    assert sheet["A3"].value == "F-001"
