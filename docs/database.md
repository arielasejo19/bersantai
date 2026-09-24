# Database

The MySQL schema includes the original foundation tables plus the villa management model:

- `roles`: supported account roles (`guest`, `admin`, `host`, `receptionist`).
- `villas`: property details, pricing, capacity, ownership, and lifecycle/availability status.
- `villa_amenities` and `villa_photos`: normalized property content.
- `villa_receptionist_assignments`: explicit receptionist-to-villa access.
- `reservations`: guest, stay dates, booking status, and check-in/check-out timestamps.
- `system_settings`: global configuration such as the `operating_mode` (`airbnb` or `hotel`).
- `menu_categories`: reusable food categories such as breakfast, lunch, dinner, drinks, and snacks.
- `menu_items`: food content, images, prices, availability, and publication state.
- `packages`: villa and food offer content, package price, availability, and publication state.
- `package_villas` and `package_menu_items`: composite-key relationships between packages and their included inventory.

Run `npm run migrate` after pulling the villa management migration. Villa access is enforced by the API repository queries in addition to route-level role checks.

The current application architecture uses Supabase Authentication for social login and MySQL through the backend for application data. Therefore these tables use the repository's Knex foreign keys and API role checks rather than Supabase Postgres RLS policies; migrating application storage to Supabase would require replacing the configured Knex database layer and adding a server-side Supabase service-role integration.
# Database

Bersantai uses MySQL as the primary database. The backend uses `mysql2` through Knex for query execution, migrations, seeds, and future transaction support.

## Environment

Backend database values are read from environment variables:

```text
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=bersantai
DB_USER=bersantai
DB_PASSWORD=bersantai_dev_password
```

These values belong in `backend/.env`, never in frontend configuration.

## Tables

- `users`: email, password hash, role, account status, last login timestamp, and timestamps.
- `profiles`: one profile per user, including display name, bio, avatar URL, and timestamps.
- `places`: early place entity for future property/discovery work.

Each table includes `created_at` and `updated_at`.

## Authentication And Profiles

The `users.password_hash` field stores a bcrypt hash. Password hashes are never returned through API responses.

`profiles.user_id` has a foreign key to `users.id` and a unique constraint, enforcing one profile per user. Profile updates are scoped to the authenticated user ID derived from the JWT, not a client-supplied user ID.

## Commands

```bash
npm run migrate
npm run seed
```
