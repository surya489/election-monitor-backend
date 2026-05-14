# VoteFlow Backend

Express, Socket.IO, Mongoose, and MongoDB backend for the VoteFlow real-time election polling system.

## Features

- Seeded admin user and five default Tamil Nadu party nominees: DMK, ADMK, TVK, NTK, and PMK.
- Voter signup/login with one vote enforced per user account.
- JWT-protected admin results endpoint.
- Socket.IO broadcasts live result updates after every accepted vote.
- Docker Compose setup for MongoDB, backend, and the sibling Next.js frontend.

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

3. Start MongoDB locally, then seed the database:

   ```bash
   npm run db:seed
   ```

   The seed creates the default admin, resets existing votes, and loads five nominees.

4. Start the API:

   ```bash
   npm run dev
   ```

The API runs on `http://localhost:5000`.

## API Routes

- `POST /api/auth/login` authenticates the default admin.
- `POST /api/auth/signup` creates a voter account.
- `POST /api/auth/user-login` authenticates a voter account.
- `GET /api/auth/me` returns the current voter.
- `GET /api/nominees` returns the party ballot list.
- `POST /api/votes` records one authenticated user vote for `{ nomineeId }`.
- `GET /api/votes/me` returns the current user's vote.
- `GET /api/results` returns live totals and requires `Authorization: Bearer <token>`.

## Project Coverage

- Audience users can sign up, sign in, and vote for one nominee.
- The `Vote.userId` unique index enforces one accepted vote per voter account.
- The admin user is seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Admin results are protected by JWT auth.
- Socket.IO emits `results:update` after every accepted vote and sends a result snapshot when the admin dashboard connects.
- The nominee seed contains five default nominees for a focused ballot.

## Docker Setup

From this backend repository, run:

```bash
docker compose up --build
```

This starts:

- MongoDB on `localhost:27017`
- Backend API on `localhost:5000`
- Frontend app from `../election-monitor` on `localhost:3000`

The backend container runs the MongoDB seed script before starting the API.

## Scripts

- `npm run dev` starts the TypeScript development server.
- `npm run build` compiles TypeScript to `dist`.
- `npm start` runs the compiled server.
- `npm run db:seed` creates the default admin and party ballot data.
- `npm test` type-checks the backend.
