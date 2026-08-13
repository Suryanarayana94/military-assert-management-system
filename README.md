# Sentinel Asset Command

Sentinel is a full-stack Military Asset Management System for auditable control of vehicles, weapons, and ammunition across multiple military bases.

It implements the inventory model:

`Closing balance = Opening balance + Purchases + Transfers in − Transfers out − Assigned − Expended`

## Included architecture

| Area | Implementation |
| --- | --- |
| Frontend | React + Vite, Tailwind CSS, Lucide, Recharts, Axios, protected routes |
| Backend | Express ES modules, Helmet, CORS, JWT and Bcrypt |
| Database | PostgreSQL with Prisma schema, relational constraints, compound indexes and a seed script |
| Integrity | Serializable cross-base transfer transaction, stock checks, central audit-log service |
| RBAC | Admin (global), Base Commander (forced base scope), Logistics Officer (purchases/transfers) |
| Deployment | Vercel frontend configuration and a Render Blueprint for the API + PostgreSQL |

The deployed Vercel preview is intentionally browser-demo capable when `VITE_API_BASE_URL` is unset. Configure the API URL to use the production PostgreSQL service instead of demo state.

## Run locally

1. Install workspace packages:

   ```bash
   npm install
   ```

2. Start PostgreSQL (Docker is optional):

   ```bash
   docker compose up -d postgres
   ```

3. Copy environment files and set secure values:

   ```bash
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```

4. Create the schema and demonstration accounts:

   ```bash
   npm run prisma:push -w backend
   npm run prisma:seed -w backend
   ```

5. Run the API and React application:

   ```bash
   npm run dev
   ```

Open `http://localhost:5173`; the API health endpoint is `http://localhost:4000/api/health`.

## Sample accounts

| Role | Username | Password | Scope |
| --- | --- | --- | --- |
| Administrator | `admin_user` | `AdminPass123!` | All bases |
| Base Commander | `commander_alpha` | `CommandPass123!` | Fort Alpha |
| Logistics Officer | `logistics_officer` | `LogisticsPass123!` | Purchases and transfers |

## API endpoints

All endpoints other than health and login require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Permission |
| --- | --- | --- |
| `GET` | `/api/health` | Public |
| `POST` | `/api/auth/login` | Public |
| `GET` | `/api/auth/me` | Authenticated |
| `GET` | `/api/reference`, `/api/dashboard`, `/api/assets` | Authenticated and base-scoped |
| `GET/POST` | `/api/purchases` | Admin, Commander (own base), Logistics |
| `GET/POST` | `/api/transfers` | Read scoped; write Admin / Logistics |
| `GET/POST` | `/api/assignments`, `/api/expenditures` | Admin, Commander (own base) |
| `GET` | `/api/audit-logs` | Admin |

## Deploy the production stack

### API and database — Render

1. In Render, create a Blueprint from this repository; it reads [`render.yaml`](render.yaml).
2. Render provisions PostgreSQL, injects `DATABASE_URL`, runs Prisma `db push`, and starts the Express API.
3. Set `CORS_ORIGIN` to the Vercel frontend URL and retain the generated `JWT_SECRET`.
4. Run `npm run prisma:seed -w backend` once from a Render Shell to load the sample accounts.

### Frontend — Vercel

1. Import the repository (or use the included [`vercel.json`](vercel.json)).
2. Set `VITE_API_BASE_URL` to `https://<your-render-api>/api` in Vercel Production environment variables.
3. Redeploy. The frontend then uses Axios against the live API and PostgreSQL instead of demo mode.

## Project map

```text
backend/
  config/              Prisma client
  controllers/         Authentication, balances, mutations and history
  middlewares/         JWT, RBAC/base scope and errors
  routes/              REST endpoint modules
  services/            Central audit writer
  prisma/              PostgreSQL schema and sample-data seed
frontend/
  src/components/      Shared app shell, forms, tables and modal
  src/pages/           Login, dashboard, purchases, transfers, operations, audit
  src/context/         Authentication session state
  src/services/        Axios client with demo fallback
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the ER model, authorization matrix, and walkthrough outline.
