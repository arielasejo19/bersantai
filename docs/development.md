# Development

## Prerequisites

- Node.js LTS
- npm
- MySQL 8.4 or Docker

## Setup

```bash
npm install
```

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

## MySQL With Docker

```bash
docker compose up -d mysql
npm run migrate
npm run seed
```

The Docker service exposes MySQL on port `3306` and stores data in the `bersantai_mysql_data` volume.

If Docker is not available, create a local MySQL database and user matching `backend/.env`, then run:

```bash
npm run migrate
```

## Run

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:3000/api/v1/health`

Auth screens:

- `http://localhost:5173/register`
- `http://localhost:5173/login`
- `http://localhost:5173/profile`

## Test And Build

```bash
npm test
npm run build
```

## Authentication Checks

1. Start MySQL and run migrations.
2. Set `JWT_SECRET` in `backend/.env`.
3. Run `npm run dev`.
4. Register at `/register`.
5. Confirm you land on `/profile`.
6. Refresh the browser and confirm the profile remains authenticated.
7. Log out and confirm `/profile` redirects to `/login`.
