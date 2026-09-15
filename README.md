# Bersantai

Bersantai is a hospitality application being rebuilt on a clean full-stack foundation.

This repository previously contained an Expo prototype. The prototype implementation has been replaced with a new architecture:

- Vue 3 + Vite frontend
- Vue Router and Pinia
- Progressive Web App configuration
- Node.js + Express REST API
- MySQL database
- Knex migrations and seeds
- HttpOnly cookie-based JWT authentication

## Structure

```text
frontend/   Vue 3 PWA
backend/    Express API
database/   MySQL migrations and seeds
docs/       Architecture, API, database, and development notes
```

## Prerequisites

- Node.js LTS
- npm
- MySQL 8.4, or Docker for the included local MySQL service

## Installation

```bash
npm install
```

Create local environment files:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

## Local MySQL

Docker is optional but included for convenience:

```bash
docker compose up -d mysql
npm run migrate
npm run seed
```

## Running The App

```bash
npm run dev
```

Frontend: `http://localhost:5173`

Backend health endpoint: `http://localhost:3000/api/v1/health`

Authentication routes:

- `http://localhost:5173/register`
- `http://localhost:5173/login`
- `http://localhost:5173/profile`

## Testing

```bash
npm test
```

## Production Build

```bash
npm run build
```

## Environment

Frontend configuration lives in `frontend/.env` and must only contain public `VITE_` values such as:

```text
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Backend secrets live in `backend/.env`:

```text
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=bersantai
DB_USER=bersantai
DB_PASSWORD=bersantai_dev_password
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
AUTH_COOKIE_NAME=bersantai_session
```

Never expose database credentials or JWT secrets to the Vue app.

For authentication to work locally, `JWT_SECRET` must be set and MySQL must be running with migrations applied:

```bash
npm run migrate
```

## Documentation

- [Architecture](docs/architecture.md)
- [Database](docs/database.md)
- [API](docs/api.md)
- [Development](docs/development.md)
