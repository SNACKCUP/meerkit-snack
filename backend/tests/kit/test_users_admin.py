def test_non_master_cannot_list_members(client, make_user, login):
    make_user("user01")
    response = client.get("/api/users", headers=login("user01"))
    assert response.status_code == 403


def test_master_lists_members(client, make_user, login):
    make_user("admin01", admin=True)
    make_user("user01")
    response = client.get("/api/users", headers=login("admin01"))
    assert response.status_code == 200
    login_ids = [u["user_id"] for u in response.json()]
    assert {"admin01", "user01"} <= set(login_ids)


def test_master_grants_multiple_roles(client, make_user, login):
    make_user("admin01", admin=True)
    user = make_user("user01")
    admin_headers = login("admin01")

    response = client.put(
        f"/api/users/{user.id}/roles", json={"roles": ["WRITER", "MASTER"]}, headers=admin_headers
    )
    assert response.status_code == 200
    assert [r["name"] for r in response.json()["roles"]] == ["MASTER", "WRITER"]

    # 새 역할은 다음 요청부터 바로 적용 (토큰에 역할을 넣지 않고 DB에서 읽기 때문)
    assert client.get("/api/users", headers=login("user01")).status_code == 200


def test_unknown_role_rejected(client, make_user, login):
    make_user("admin01", admin=True)
    user = make_user("user01")
    response = client.put(
        f"/api/users/{user.id}/roles",
        json={"roles": ["SUPERUSER"]},
        headers=login("admin01"),
    )
    assert response.status_code == 422


def test_admin_cannot_change_self(client, make_user, login):
    admin = make_user("admin01", admin=True)
    headers = login("admin01")
    assert client.put(
        f"/api/users/{admin.id}/roles", json={"roles": ["VIEWER"]}, headers=headers
    ).status_code == 400
    assert client.patch(
        f"/api/users/{admin.id}/active", json={"is_active": False}, headers=headers
    ).status_code == 400


def test_deactivated_user_cannot_login_or_use_token(client, make_user, login):
    make_user("admin01", admin=True)
    user = make_user("user01")
    user_headers = login("user01")

    response = client.patch(
        f"/api/users/{user.id}/active",
        json={"is_active": False},
        headers=login("admin01"),
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    assert client.get("/api/auth/me", headers=user_headers).status_code == 401
    blocked = client.post("/api/auth/login", json={"user_id": "user01", "password": "password123"})
    assert blocked.status_code == 401
