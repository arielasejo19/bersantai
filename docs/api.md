# API

The backend API is namespaced under `/api/v1`.

## Health

```http
GET /api/v1/health
```

Example response:

```json
{
  "status": "ok",
  "service": "bersantai-api",
  "timestamp": "2026-09-14T00:00:00.000Z",
  "database": {
    "status": "up"
  }
}
```

If database environment variables are not present, `database.status` is `not_configured`. If MySQL is configured but unreachable, it is `unavailable`.

## Authentication

Authentication uses an HttpOnly cookie set by the backend. Successful registration and login responses include safe user data but do not include password hashes or the raw token in JSON.

### Register

```http
POST /api/v1/auth/register
```

```json
{
  "email": "guest@example.com",
  "password": "Password1",
  "displayName": "Guest User"
}
```

Responses:

- `201`: account and profile created.
- `400`: validation failed.
- `409`: an account with the email already exists.

### Login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "guest@example.com",
  "password": "Password1"
}
```

Responses:

- `200`: authenticated.
- `400`: validation failed.
- `401`: invalid email or password.
- `403`: account is not active.

### Current User

```http
GET /api/v1/auth/me
```

Requires authentication. Returns:

```json
{
  "user": {
    "id": "1",
    "email": "guest@example.com",
    "role": "guest",
    "displayName": "Guest User",
    "bio": null,
    "avatarUrl": null
  }
}
```

### Logout

```http
POST /api/v1/auth/logout
```

Clears the auth cookie and returns `{ "status": "ok" }`.

## Profile

### Get Profile

```http
GET /api/v1/profile
```

Requires authentication and returns the authenticated user's profile.

### Update Profile

```http
PUT /api/v1/profile
```

```json
{
  "displayName": "Guest User",
  "bio": "A short intro.",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

Only the authenticated user's own profile can be updated. `bio` and `avatarUrl` may be empty or `null`.
