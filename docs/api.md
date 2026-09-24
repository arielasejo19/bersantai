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

## Villa Management

### Guest Booking

The public landing page submits booking requests without requiring an account:

```http
POST /api/v1/villas/bookings
```

```json
{
  "villaId": 1,
  "guestName": "Guest Name",
  "guestEmail": "guest@example.com",
  "checkIn": "2026-10-12",
  "checkOut": "2026-10-16",
  "guests": 2
}
```

The API checks that the villa is active and available, validates capacity, rejects overlapping pending/confirmed/check-in stays, and creates a `pending` reservation for host/receptionist follow-up.

### Operating Mode

The management workspace supports two operating modes stored in `system_settings`:

```http
GET   /api/v1/villas/config       # authenticated users
PATCH /api/v1/villas/config       # admin only
```

```json
{ "operatingMode": "hotel" }
```

Supported values are `airbnb` and `hotel`. Airbnb mode uses property/host language and hotel mode uses rooms/suites and centralized operations language. The default is `airbnb`.

Villa management uses the authenticated user's `role` and database-enforced access predicates:

- `admin`: all villas, staff invitations, ownership, and receptionist assignments.
- `host`: villas where `owner_user_id` matches the authenticated user.
- `receptionist`: villas explicitly assigned through `villa_receptionist_assignments`.

All endpoints below require authentication. The backend returns `403` for role violations and `404` when a villa is outside the current user's scope.

```http
GET    /api/v1/villas
GET    /api/v1/villas/:villaId
POST   /api/v1/villas                         # admin
PUT    /api/v1/villas/:villaId                 # admin or host
POST   /api/v1/villas/:villaId/amenities       # admin or host
POST   /api/v1/villas/:villaId/photos          # admin or host
POST   /api/v1/villas/:villaId/receptionists   # admin
GET    /api/v1/villas/:villaId/reservations   # admin, host, receptionist
PATCH  /api/v1/villas/:villaId/reservations/:reservationId/status
POST   /api/v1/villas/staff                    # admin
```

`POST /villas/staff` creates a host or receptionist account. If no password is supplied, the response contains a temporary password for out-of-band delivery. This is a local foundation for a future email invitation flow.

## Menu And Package Management

Public menu items and offers are available without authentication:

```http
GET /api/v1/menu-items/public
GET /api/v1/packages/public
```

The admin-only menu API supports categories and food items:

```http
GET    /api/v1/menu-items
GET    /api/v1/menu-items/categories
POST   /api/v1/menu-items/categories
PUT    /api/v1/menu-items/categories/:categoryId
DELETE /api/v1/menu-items/categories/:categoryId
POST   /api/v1/menu-items
PUT    /api/v1/menu-items/:menuItemId
DELETE /api/v1/menu-items/:menuItemId
```

Package CRUD is also admin-only. A package payload includes `villaIds`, `menuItems` (with `menuItemId` and `quantity`), `price`, `isAvailable`, and `isActive`. Package responses include the computed `originalPrice`, `savings`, and `discountPercent` values used by the public offers section.

```http
GET    /api/v1/packages
POST   /api/v1/packages
PUT    /api/v1/packages/:packageId
DELETE /api/v1/packages/:packageId
```

Each managed content type accepts the same authenticated multipart upload format used by villa media. Send one image or video in the `media` field; supported types are JPG, PNG, WEBP, GIF, MP4, WEBM, and MOV up to 50 MB:

```http
POST /api/v1/villa-types/:villaTypeId/media
POST /api/v1/services/:serviceId/media
POST /api/v1/menu-items/:menuItemId/media
POST /api/v1/packages/:packageId/media
```

## Reservations And Flexible Pricing

The management reservation feed is role-scoped:

```http
GET /api/v1/villas/reservations
```

Admins and receptionists receive the operational reservation calendar. Hosts receive reservations for villas they own. Flexible villa pricing is managed by admins and hosts:

```http
GET    /api/v1/villas/pricing-rules
POST   /api/v1/villas/pricing-rules
PUT    /api/v1/villas/pricing-rules/:ruleId
DELETE /api/v1/villas/pricing-rules/:ruleId
```

Pricing rules support `weekday`, `weekend`, and `holiday` types. Holiday date ranges take precedence, followed by weekday/weekend rules, followed by the villa's base nightly price. The server applies the resolved rate when creating a reservation; `GET /api/v1/villas/pricing` provides the public booking estimate.

The first administrator must be promoted by an operator after registration, for example:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```
