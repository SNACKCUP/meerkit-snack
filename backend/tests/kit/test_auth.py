def test_signup_then_login_and_me(client, login):
    response = client.post(
        "/api/auth/signup",
        json={
            "user_id": "Writer01",
            "email": "New@Example.com",
            "password": "password123",
            "name": "소영",
            "nickname": "미어캣",
        },
    )
    assert response.status_code == 201, response.text
    body = response.json()
    assert body["user_id"] == "writer01"
    assert body["email"] == "new@example.com"
    assert body["nickname"] == "미어캣"
    assert body["roles"] == [{"id": 3, "name": "VIEWER"}]
    assert "hashed_password" not in body

    headers = login("writer01")
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["name"] == "소영"


def test_signup_rejects_duplicate_login_id_and_email(client, make_user):
    make_user("dupuser")
    base = {"password": "password123", "name": "x"}
    same_id = client.post(
        "/api/auth/signup", json={**base, "user_id": "dupuser", "email": "other@example.com"}
    )
    assert same_id.status_code == 409
    same_email = client.post(
        "/api/auth/signup", json={**base, "user_id": "other01", "email": "dupuser@example.com"}
    )
    assert same_email.status_code == 409


def test_signup_validates_fields(client):
    base = {"user_id": "user01", "email": "a@example.com", "password": "password123", "name": "x"}
    assert client.post("/api/auth/signup", json={**base, "password": "short"}).status_code == 422
    assert client.post("/api/auth/signup", json={**base, "user_id": "ab"}).status_code == 422
    assert client.post("/api/auth/signup", json={**base, "user_id": "한글아이디"}).status_code == 422


def test_login_wrong_password(client, make_user):
    make_user("user01")
    response = client.post(
        "/api/auth/login", json={"user_id": "user01", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401
    bad = client.get("/api/auth/me", headers={"Authorization": "Bearer nope"})
    assert bad.status_code == 401


def test_login_sets_httponly_refresh_cookie_and_refresh_works(client, make_user):
    make_user("user01")
    response = client.post("/api/auth/login", json={"user_id": "user01", "password": "password123"})
    set_cookie = response.headers["set-cookie"]
    assert "meerkit_refresh=" in set_cookie
    assert "HttpOnly" in set_cookie
    assert "Path=/api/auth" in set_cookie

    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 200
    token = refreshed.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200


def test_refresh_without_cookie_fails(client):
    assert client.post("/api/auth/refresh").status_code == 401


def test_logout_clears_refresh_cookie(client, make_user, login):
    make_user("user01")
    login("user01")
    assert client.post("/api/auth/logout").status_code == 204
    assert client.post("/api/auth/refresh").status_code == 401


def test_access_token_cannot_be_used_as_refresh(client, make_user, login):
    make_user("user01")
    headers = login("user01")
    client.cookies.clear()
    access = headers["Authorization"].removeprefix("Bearer ")
    client.cookies.set("meerkit_refresh", access, path="/api/auth")
    assert client.post("/api/auth/refresh").status_code == 401
