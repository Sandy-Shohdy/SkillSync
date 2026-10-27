# SkillSync

SkillSync is a two-sided marketplace for local services. **Customers** browse freelancers by category, then either book a specific time slot or send a quick "call me back" inquiry. **Freelancers** get those requests in an inbox and accept, decline, or wait to be cancelled. Once a booking is accepted, the customer pays up front; the money is held in escrow until the job is done, then released to the freelancer. Both sides see an in-app notification whenever anything changes.

Categories covered out of the box: repairs, tutoring, food, beauty, garden, cleaning, photography, pet care, and other.

## How it works

- **One account, two roles.** Signing up as a customer or a freelancer creates a row in the same `users` table — freelancer-only fields (category, hourly rate, skills, location, bio) just stay empty on a customer account.
- **Two ways to request a freelancer.** An *appointment* books a specific date/time; an *inquiry* just asks the freelancer to call back — no time slot needed.
- **A booking moves through one pipeline.** `pending` → `accepted` or `declined` by the freelancer → `completed` once the job is done and paid out. The customer can cancel at any point before it's closed (a held payment is refunded automatically).
- **Payments are held in escrow.** After a booking is accepted, the customer pays by card. SkillSync keeps a platform fee (`PLATFORM_FEE_PERCENT`, default 10%) and holds the rest. When the freelancer marks the job done, the customer can release the payment or report a problem; if they do nothing, it's released automatically after `PAYMENT_REVIEW_DAYS` (default 3). A reported problem gives the freelancer `PAYMENT_DISPUTE_DAYS` (default 14) to refund before the payment is released. Freelancers see their totals on the **Earnings** page. Amounts are in SEK.
- **Payments are simulated.** The backend ships with a `MockPaymentProvider` — no real money moves. Use card `4242 4242 4242 4242` (any future expiry, any CVC) to succeed; `4000 0000 0000 0002` is declined and `4000 0000 0000 9995` fails with insufficient funds. To go live, bind a real provider (Stripe, Paymob, Klarna…) to the `PaymentProvider` token in `PaymentsModule`.
- **Notifications are polled, not pushed.** Every status change writes a notification row for the other side. There's no websocket — the notification bell in the navbar refetches every 30 seconds and whenever the browser tab regains focus.
- **Auth is a plain JWT.** Login/signup returns a 7-day token that the frontend keeps in `localStorage` and sends as `Authorization: Bearer <token>` on every request after that.

## Tech stack

| | |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, React Router, Tailwind CSS |
| **Backend** | NestJS 10, TypeORM, PostgreSQL, JWT auth (bcrypt-hashed passwords), Multer (avatar uploads) |
| **Hosting** | Vercel (frontend + backend), Neon (PostgreSQL) |

The frontend talks to the backend over plain `fetch` calls — no GraphQL or client-side cache library, each page just fetches what it needs in a `useEffect`.

## Project structure

```
SkillSync/
├── src/                     # Frontend (Vite root)
│   ├── Pages/               # Route-level pages
│   │   ├── Auth/            # Login, Signup
│   │   ├── Customer/        # Dashboard, BrowseFreelancers, MyBookings, Profile
│   │   ├── Freelancer/      # BookingRequests, Earnings
│   │   └── EditProfile.tsx, Settings.tsx
│   ├── components/          # Shared UI (Navbar, SideRail, NotificationBell, PaymentModal, cards, modals...)
│   ├── context/             # AuthContext, NotificationsContext, ThemeContext
│   ├── hooks/               # useNotifications, useUnreadNotifications
│   ├── lib/                 # api.ts (backend client), bookingDisplay.ts
│   └── data/                # Service category definitions
└── backend/                 # NestJS API
    └── src/
        ├── auth/            # Signup/login, JWT guard
        ├── users/           # Profile, avatars, public freelancer directory
        ├── bookings/        # Create/accept/decline/complete/cancel bookings
        ├── payments/        # Escrow payments, refunds, earnings, auto-release cron
        └── notifications/   # Per-user notification inbox
```

### Frontend routes

| Path | Who | Page |
|---|---|---|
| `/` | everyone | Dashboard |
| `/services` | everyone | Browse freelancers by category |
| `/login`, `/signup` | guests | Auth |
| `/bookings` | customer | My bookings, payments, release/report a problem |
| `/freelancer/bookings` | freelancer | Incoming booking requests |
| `/freelancer/earnings` | freelancer | Held, released, and refunded earnings |
| `/profile`, `/profile/edit` | signed in | View/edit your profile |
| `/settings` | signed in | Settings and theme |

## Running it locally

You'll need Node.js and a local PostgreSQL database.

**Backend**

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env` and fill it in:

```
NODE_ENV=development
DATABASE_URL=                 # optional, overrides DB_* (e.g. Neon)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=<your postgres user>
DB_PASSWORD=<your postgres password>
DB_NAME=skillsync
JWT_SECRET=<any random string>

PLATFORM_FEE_PERCENT=10       # SkillSync's cut of each payment
PAYMENT_REVIEW_DAYS=3         # auto-release after the job is marked done
PAYMENT_DISPUTE_DAYS=14       # auto-release after a reported problem
CRON_SECRET=                  # optional, protects GET /payments/auto-release
```

```bash
npm run start:dev
```

The API starts on `http://localhost:3000`. In development (`NODE_ENV` ≠ `production`), TypeORM auto-creates the tables from the entities — no manual migrations needed.

### Neon database only (no AI integration)

The backend can use Neon as an ordinary PostgreSQL host through its existing
TypeORM and `pg` driver. No Neon CLI, SDK, agent skills, MCP server, AI Gateway,
or Neon Auth is required. The app keeps its own signup/login and JWT authentication.

1. Open your project in the [Neon Console](https://console.neon.tech/) and use
   **Connect** to copy the PostgreSQL connection string for the intended branch
   and database. Keep its SSL parameters, including `sslmode=require`.
2. Copy `backend/.env.example` to `backend/.env` if you do not already have one.
   Set `DATABASE_URL` there privately, or in your backend host's environment
   settings. When nonempty, this overrides the separate `DB_*` connection settings.
3. Set a strong `JWT_SECRET` for the existing app login, then start the backend
   from `backend/` as described above. For local development against a **new,
   empty development database**, the existing TypeORM auto-sync creates the
   tables. Never use development auto-sync on a database containing valuable
   data. Production (`NODE_ENV=production`) still disables auto-sync and requires
   the schema to be provisioned separately before the app is used.

Only the backend should receive `DATABASE_URL`. Do not prefix it with `VITE_`,
put it in frontend code, paste it into chat, or commit the real environment file.
The frontend continues to use `VITE_API_URL` to reach the backend, not the database.
Neon hosts the database, not the NestJS server; the backend still needs its own host.

This configuration does not grant this assistant or an MCP server access to your
database, and makes no AI Gateway requests. PostgreSQL access is still granted to
your running backend through its database credentials. Review any previously
authorized agents or integrations in your Neon account separately; changing app
code does not revoke existing account permissions.

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
| `GET /avatars/:userId` | public | Profile photo image |
| `POST /bookings` | JWT, customer | Request an appointment or inquiry |
| `GET /bookings/mine` | JWT, customer | Your own requests |
| `GET /bookings/me` | JWT, freelancer | Requests addressed to you |
| `PATCH /bookings/:id/status` | JWT, freelancer | Accept or decline a request |
| `PATCH /bookings/:id/complete` | JWT, freelancer | Mark the job done (starts the review window) |
| `PATCH /bookings/:id/cancel` | JWT, customer | Cancel your own request (refunds a held payment) |
| `POST /payments/bookings/:id/pay` | JWT, customer | Pay for an accepted booking (held in escrow) |
| `POST /payments/bookings/:id/release` | JWT, customer | Release the held payment to the freelancer |
| `POST /payments/bookings/:id/dispute` | JWT, customer | Report a problem with the job |
| `POST /payments/bookings/:id/refund` | JWT, freelancer | Refund the customer and cancel the booking |
| `GET /payments/earnings` | JWT, freelancer | Earnings summary and payment history |
| `GET /payments/auto-release` | `CRON_SECRET` | Release overdue payments (for a scheduled job) |
| `GET /notifications` | JWT | Your notification inbox |
| `PATCH /notifications/:id/read`, `PATCH /notifications/read-all` | JWT | Mark notifications read |

## Deployment

This project deploys as two Vercel projects from the same repository, plus a Neon database. All three are on free plans.

- **Frontend → Vercel.** Zero-config Vite build; `vercel.json` adds the SPA rewrite so client-side routes don't 404 on refresh. Set `VITE_API_URL` to the backend's public URL in the Vercel project's environment variables.
- **Backend → Vercel.** Import the same repository as a second Vercel project with **Root Directory** `backend`; Vercel detects NestJS and runs it as a serverless function. Set `DATABASE_URL`, `JWT_SECRET`, and `NODE_ENV=production`. Serverless functions have no persistent disk, so profile photos are stored in Postgres (`users.avatarData`) and served from `GET /avatars/:userId`, capped at 4 MB to stay under Vercel's request size limit.
- **Payment auto-release.** Held payments are released to the freelancer `PAYMENT_REVIEW_DAYS` (default 3) after the job is marked done, or `PAYMENT_DISPUTE_DAYS` (default 14) after the customer reports a problem. Overdue payments are released whenever bookings or earnings are loaded. To also release them when nobody uses the app, set `CRON_SECRET` and add a Vercel Cron Job for `GET /payments/auto-release` (Vercel sends the secret automatically).
- **Database → Neon.** See [Neon database only](#neon-database-only-no-ai-integration) above.

`NODE_ENV=production` turns off TypeORM's auto-sync, so production never alters the schema. After changing an entity, run the backend locally once in development mode against the database to apply the change before deploying.
