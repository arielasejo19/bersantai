# Architecture

Bersantai now uses a traditional full-stack architecture:

- `frontend/`: Vue 3, Vite, Vue Router, Pinia, and PWA support.
- `backend/`: Node.js, Express, REST routes, middleware, controllers, services, and repositories.
- `database/`: MySQL migrations and seeds.

The frontend talks to the backend through `/api/v1`. The frontend never connects directly to MySQL. Database access belongs in backend repositories, with business logic in services and HTTP concerns in controllers.

## Authentication

Bersantai uses backend-issued JWTs stored in an HttpOnly cookie named `bersantai_session` by default. Vue does not store the token in local storage or session storage. On startup, the frontend calls `GET /api/v1/auth/me`; if the cookie is valid, the auth store is populated with the current safe user.

Protected backend routes use `requireAuth`, which validates the JWT, loads the user from MySQL, and attaches the safe user context to `request.user`. Protected frontend routes use Vue Router guards and redirect unauthenticated users to `/login`.

Logout clears the auth cookie and resets frontend auth/profile state.

## Request Flow

```text
Vue view or store
  -> frontend service API client
  -> Express route
  -> controller
  -> service
  -> repository
  -> MySQL
```

## Current Milestone

The current milestone adds registration, login, authenticated session restoration, profile viewing, profile editing, logout, and protected routing.
