def test_regular_user_cannot_list_members(client, make_user, login):
    make_user("user@example.com")
    response = client.get("/api/users", headers=login("user@example.com"))
    assert response.status_code == 403


def test_admin_lists_members(client, make_user, login):
    make_user("admin@example.com", admin=True)
    make_user("user@example.com")
    response = client.get("/api/users", headers=login("admin@example.com"))
    assert response.status_code == 200
    emails = [u["email"] for u in response.json()]
    assert {"admin@example.com", "user@example.com"} <= set(emails)


def test_admin_grants_admin_role(client, make_user, login):
    make_user("admin@example.com", admin=True)
    user = make_user("user@example.com")
    admin_headers = login("admin@example.com")

    response = client.put(
        f"/api/users/{user.id}/roles", json={"roles": ["ADMIN"]}, headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["roles"] == ["ADMIN", "USER"]  # USER는 항상 유지

    # 새 역할은 다음 요청부터 바로 적용 (토큰에 역할을 넣지 않고 DB에서 읽기 때문)
    assert client.get("/api/users", headers=login("user@example.com")).status_code == 200


def test_unknown_role_rejected(client, make_user, login):
    make_user("admin@example.com", admin=True)
    user = make_user("user@example.com")
    response = client.put(
        f"/api/users/{user.id}/roles",
        json={"roles": ["SUPERUSER"]},
        headers=login("admin@example.com"),
    )
    assert response.status_code == 422


def test_admin_cannot_change_self(client, make_user, login):
    admin = make_user("admin@example.com", admin=True)
    headers = login("admin@example.com")
    assert client.put(
        f"/api/users/{admin.id}/roles", json={"roles": ["USER"]}, headers=headers
    ).status_code == 400
    assert client.patch(
        f"/api/users/{admin.id}/active", json={"is_active": False}, headers=headers
    ).status_code == 400


def test_deactivated_user_cannot_login_or_use_token(client, make_user, login):
    make_user("admin@example.com", admin=True)
    user = make_user("user@example.com")
    user_headers = login("user@example.com")

    response = client.patch(
        f"/api/users/{user.id}/active",
        json={"is_active": False},
        headers=login("admin@example.com"),
    )
    assert response.status_code == 200
    assert response.json()["is_active"] is False

    assert client.get("/api/auth/me", headers=user_headers).status_code == 401
    blocked = client.post(
        "/api/auth/login", json={"email": "user@example.com", "password": "password123"}
    )
    assert blocked.status_code == 401
