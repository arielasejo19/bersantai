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
