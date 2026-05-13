# VoteFlow Backend

Express, Socket.IO, Prisma, and PostgreSQL backend for the real-time election polling assignment.

## Features

- Seeded admin user and five default nominees.
- One vote per browser session by storing a unique session id with each vote.
- JWT-protected admin results endpoint.
- Socket.IO broadcasts live result updates after every accepted vote.
- Docker Compose setup for PostgreSQL, backend, and the sibling Next.js frontend.

## Default Admin

- Email: `admin@voteflow.local`
- Password: `admin123`

Change these values in `.env` or `docker-compose.yml` before sharing a production deployment.

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment file and adjust values if needed:

   ```bash
   cp .env.example .env
   ```

3. Start PostgreSQL locally, then sync and seed the database:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Start the API:

   ```bash
   npm run dev
   ```

The API runs on `http://localhost:5000`.

## API Routes

- `POST /api/auth/login` authenticates the default admin.
- `GET /api/nominees` returns the public nominee list.
- `POST /api/votes` records a vote for `{ nomineeId, sessionId }`.
- `GET /api/results` returns live totals and requires `Authorization: Bearer <token>`.

## Docker Setup

From this backend repository, run:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on `localhost:5432`
- Backend API on `localhost:5000`
- Frontend app from `../election-monitor` on `localhost:3000`

The backend container runs `prisma db push` and the seed script before starting the API.

## Scripts

- `npm run dev` starts the TypeScript development server.
- `npm run build` compiles TypeScript to `dist`.
- `npm start` runs the compiled server.
- `npm run db:push` syncs the Prisma schema to the database.
- `npm run db:seed` creates the default admin and nominees.
- `npm test` type-checks the backend.
