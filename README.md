# SkillSync

SkillSync is a two-sided marketplace for local services. **Customers** browse freelancers by category, then either book a specific time slot or send a quick "call me back" inquiry. **Freelancers** get those requests in an inbox and accept, decline, or wait to be cancelled — with both sides seeing an in-app notification whenever the status changes.

Categories covered out of the box: repairs, tutoring, food, beauty, garden, cleaning, photography, pet care, and other.

## How it works

- **One account, two roles.** Signing up as a customer or a freelancer creates a row in the same `users` table — freelancer-only fields (category, hourly rate, skills, location, bio) just stay empty on a customer account.
- **Two ways to request a freelancer.** An *appointment* books a specific date/time; an *inquiry* just asks the freelancer to call back — no time slot needed.
- **A booking moves through one pipeline.** `pending` → `accepted` or `declined` by the freelancer, or cancelled by the customer at any point before it's closed.
- **Notifications are pull, not push.** Every status change writes a notification row for the other side. There's no websocket or polling — the unread dot and the notification list are fetched fresh whenever that part of the app is opened.
- **Auth is a plain JWT.** Login/signup returns a 7-day token that the frontend keeps in `localStorage` and sends as `Authorization: Bearer <token>` on every request after that.

## Tech stack

| | |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router, Tailwind CSS |
| **Backend** | NestJS 10, TypeORM, PostgreSQL, JWT auth (bcrypt-hashed passwords), Multer (avatar uploads) |

The frontend talks to the backend over plain `fetch` calls — no GraphQL or client-side cache library, each page just fetches what it needs in a `useEffect`.

## Project structure

```
SkillSync/
├── src/                     # Frontend (Vite root)
│   ├── Pages/               # Route-level pages (Auth, Customer, Freelancer, Settings...)
│   ├── components/          # Shared UI (Navbar, SideRail, modals, cards...)
│   ├── context/              # AuthContext, ThemeContext
│   ├── hooks/                # useUnreadNotifications
│   ├── lib/                  # api.ts (backend client), bookingDisplay.ts
│   └── data/                  # Service category definitions
└── backend/                 # NestJS API
    └── src/
        ├── auth/             # Signup/login, JWT guard
        ├── users/             # Profile + public freelancer directory
        ├── bookings/          # Create/accept/decline/cancel bookings
        └── notifications/     # Per-user notification inbox
```

## Running it locally

You'll need Node.js and a local PostgreSQL database.

**Backend**

```bash
cd backend
npm install
```

Create `backend/.env`:

```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<your postgres user>
DB_PASSWORD=<your postgres password>
DB_NAME=skillsync
JWT_SECRET=<any random string>
```

```bash
npm run start:dev
```

The API starts on `http://localhost:3000`. In development (`NODE_ENV` ≠ `production`), TypeORM auto-creates the tables from the entities — no manual migrations needed.

**Frontend**

```bash
npm install
```

Create a `.env` at the project root:

```
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

The app starts on `http://localhost:5173`.

## API overview

All routes are prefixed with the API origin. Everything except signup, login, and the freelancer directory requires a `Bearer` token.

| Route | Auth | What it does |
|---|---|---|
| `POST /auth/signup` | public | Create an account, returns a token |
| `POST /auth/login` | public | Verify credentials, returns a token |
| `GET /freelancers` | public | Freelancer directory |
| `GET /users/me` / `PATCH /users/me` | JWT | View/edit your own profile (avatar upload included) |
| `POST /bookings` | JWT, customer | Request an appointment or inquiry |
| `GET /bookings/mine` | JWT, customer | Your own requests |
| `GET /bookings/me` | JWT, freelancer | Requests addressed to you |
| `PATCH /bookings/:id/status` | JWT, freelancer | Accept or decline a request |
| `PATCH /bookings/:id/cancel` | JWT, customer | Cancel your own request |
| `GET /notifications` | JWT | Your notification inbox |
| `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` | JWT | Mark notifications read |

## Deployment

This project is set up to deploy as two separate services:

- **Frontend → Vercel.** Zero-config Vite build; `vercel.json` adds the SPA rewrite so client-side routes don't 404 on refresh. Set `VITE_API_URL` to the backend's public URL in the Vercel project's environment variables.
- **Backend → Railway (or Render).** Runs as a normal long-running Node process, so local-disk avatar uploads keep working as-is (no serverless filesystem issues). Needs a Postgres instance and the same environment variables as local dev, plus `NODE_ENV=production` (which also turns off TypeORM's auto-sync, so the schema needs to be created once — see `backend/`).
