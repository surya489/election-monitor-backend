# VoteFlow Backend

Express, Socket.IO, Mongoose, and MongoDB backend for the VoteFlow real-time election polling system.

## What This API Does

- Creates and authenticates audience users.
- Creates a default admin user during database seeding.
- Stores five default nominees: DMK, ADMK, TVK, NTK, and PMK.
- Accepts one vote per authenticated audience user.
- Provides protected live result data for the admin dashboard.
- Broadcasts result updates with Socket.IO after every accepted vote.

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Socket.IO
- JSON Web Tokens
- bcryptjs

## Important Packages

- `express`: HTTP API server.
- `mongoose`: MongoDB models and queries.
- `socket.io`: real-time admin result updates.
- `jsonwebtoken`: user/admin token creation and verification.
- `bcryptjs`: password hashing and password comparison.
- `cors`: allows the frontend origin to call the API.
- `dotenv`: loads local environment variables.
- `tsx`, `typescript`: TypeScript development and builds.

## Required Before Running

- Node.js
- npm
- MongoDB running locally, or Docker Desktop for the Docker setup
- Frontend app running on `http://localhost:3000`

## Clone And Install

```bash
git clone <backend-repo-url>
cd election-monitor-backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Default `.env` values:

```env
MONGODB_URI="mongodb://localhost:27017/election_monitor"
PORT=5000
CLIENT_URL=http://localhost:3000
JWT_SECRET=replace-with-a-long-secret
ADMIN_EMAIL=admin@voteflow.local
ADMIN_PASSWORD=admin123
```

## Admin Credentials

The admin account is created by the seed script.

- Email: `admin@voteflow.local`
- Password: `admin123`

How credentials are stored:

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are read from `.env`.
- The seed script hashes `ADMIN_PASSWORD` with bcrypt.
- The hashed password is stored in MongoDB in the `admins` collection.
- During admin login, the submitted password is compared with the stored bcrypt hash.
- The API returns a JWT when the credentials are valid.

## Seed The Database

Start MongoDB first, then run:

```bash
npm run db:seed
```

The seed script:

- Creates or updates the default admin.
- Deletes existing votes.
- Deletes existing nominees.
- Inserts the five default nominees: DMK, ADMK, TVK, NTK, and PMK.

Because seeding clears votes, run it when preparing a fresh demo or resetting local data.

## Run The API

```bash
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

Health check:

```text
GET /
```

Expected response:

```text
VoteFlow API Running...
```

## Run The Full App Locally

Terminal 1:

```bash
cd election-monitor-backend
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

Terminal 2:

```bash
cd ../election-monitor
npm install
cp .env.local.example .env.local
npm run dev
```

Open:

- Audience page: `http://localhost:3000`
- Admin page: `http://localhost:3000/admin`

## API Routes

### Admin Auth

```text
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@voteflow.local",
  "password": "admin123"
}
```

Returns an admin JWT when credentials are valid.

### Audience Signup

```text
POST /api/auth/signup
```

Body:

```json
{
  "name": "Voter Name",
  "email": "voter@example.com",
  "password": "secret123"
}
```

Creates a user account and returns a user JWT.

### Audience Login

```text
POST /api/auth/user-login
```

Body:

```json
{
  "email": "voter@example.com",
  "password": "secret123"
}
```

Returns a user JWT when credentials are valid.

### Current Audience User

```text
GET /api/auth/me
```

Requires:

```text
Authorization: Bearer <user-token>
```

### Nominee List

```text
GET /api/nominees
```

Returns the five-party ballot.

### Cast Vote

```text
POST /api/votes
```

Requires:

```text
Authorization: Bearer <user-token>
```

Body:

```json
{
  "nomineeId": "<nominee-id>"
}
```

Records one vote for the authenticated user.

### Current User Vote

```text
GET /api/votes/me
```

Requires:

```text
Authorization: Bearer <user-token>
```

Returns the nominee already selected by the current user, or `null`.

### Admin Results

```text
GET /api/results
```

Requires:

```text
Authorization: Bearer <admin-token>
```

Returns total votes and vote counts for each nominee.

## Socket.IO Realtime Flow

The admin dashboard connects to the Socket.IO server with the admin JWT:

```ts
io(API_URL, {
  auth: { token },
  transports: ["websocket", "polling"],
});
```

Socket behavior:

- Invalid tokens are disconnected.
- A valid admin connection receives the current result snapshot immediately.
- After each accepted vote, the server emits `results:update` to connected dashboards.

## Backend Validation

Auth validation:

- Admin login requires email and password.
- Audience signup requires name, email, and password.
- Audience password must be at least 6 characters.
- Audience login requires email and password.
- Protected routes require a valid JWT.
- Admin routes require an admin JWT.
- Audience routes require a user JWT.

Vote validation:

- `nomineeId` is required.
- `nomineeId` must be a valid MongoDB ObjectId.
- The nominee must exist.
- The nominee must be part of the approved five-party ballot.
- Each user can vote only once.

Data protection:

- User and admin passwords are stored as bcrypt hashes.
- JWT payloads include user/admin id, email, and role.
- The `Vote.userId` unique index enforces one accepted vote per user.

## Main Use Cases

Audience vote:

1. User signs up or logs in.
2. Frontend fetches nominees and existing vote status.
3. User selects one nominee.
4. Backend validates the user JWT and nominee.
5. Backend stores the vote if the user has not voted before.
6. Backend returns updated results and emits `results:update`.

Returning audience user:

1. User logs in again.
2. Frontend calls `/api/votes/me`.
3. If a vote exists, frontend disables voting and shows the selected nominee.

Admin live dashboard:

1. Admin logs in.
2. Frontend stores the admin JWT in local storage.
3. Frontend calls `/api/results`.
4. Frontend opens a Socket.IO connection with the admin JWT.
5. Backend sends the current results and future live updates.

## Docker Setup

From this backend repository, run:

```bash
docker compose up --build
```

This starts:

- MongoDB on `localhost:27017`
- Backend API on `localhost:5000`
- Frontend app from `../election-monitor` on `localhost:3000`

The backend container runs the seed script before starting the API.

## Available Scripts

```bash
npm run dev
```

Starts the TypeScript development server.

```bash
npm run build
```

Compiles TypeScript to `dist`.

```bash
npm start
```

Runs the compiled server.

```bash
npm run db:seed
```

Creates the default admin and five-party ballot.

```bash
npm test
```

Runs TypeScript type-checking without emitting files.
