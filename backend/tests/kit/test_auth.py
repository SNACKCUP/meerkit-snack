def test_signup_then_login_and_me(client, login):
    response = client.post(
        "/api/auth/signup",
        json={"email": "New@Example.com", "password": "password123", "name": "소영"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new@example.com"
    assert body["roles"] == ["USER"]
    assert "hashed_password" not in body

    headers = login("new@example.com")
    me = client.get("/api/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["name"] == "소영"


def test_signup_rejects_duplicate_email(client, make_user):
    make_user("dup@example.com")
    response = client.post(
        "/api/auth/signup",
        json={"email": "dup@example.com", "password": "password123", "name": "x"},
    )
    assert response.status_code == 409


def test_signup_rejects_short_password(client):
    response = client.post(
        "/api/auth/signup", json={"email": "a@example.com", "password": "short", "name": "x"}
    )
    assert response.status_code == 422


def test_login_wrong_password(client, make_user):
    make_user("a@example.com")
    response = client.post(
        "/api/auth/login", json={"email": "a@example.com", "password": "wrong-password"}
    )
    assert response.status_code == 401


def test_me_requires_token(client):
    assert client.get("/api/auth/me").status_code == 401
    bad = client.get("/api/auth/me", headers={"Authorization": "Bearer nope"})
    assert bad.status_code == 401


def test_login_sets_httponly_refresh_cookie_and_refresh_works(client, make_user):
    make_user("a@example.com")
    response = client.post(
        "/api/auth/login", json={"email": "a@example.com", "password": "password123"}
    )
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
    make_user("a@example.com")
    login("a@example.com")
    assert client.post("/api/auth/logout").status_code == 204
    assert client.post("/api/auth/refresh").status_code == 401


def test_access_token_cannot_be_used_as_refresh(client, make_user, login):
    make_user("a@example.com")
    headers = login("a@example.com")
    client.cookies.clear()
    access = headers["Authorization"].removeprefix("Bearer ")
    client.cookies.set("meerkit_refresh", access, path="/api/auth")
    assert client.post("/api/auth/refresh").status_code == 401
