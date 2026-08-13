# Sentinel Asset Command

Military asset management dashboard for tracking purchases, transfers, assignments, expenditure, role-based access, and audit history across bases.

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The UI is loaded with safe demonstration data. Sign in with `admin_user` / `AdminPass123!`, `commander_alpha` / `CommandPass123!`, or `logistics_officer` / `LogisticsPass123!`.

The Express API runs at `http://localhost:4000` and exposes `/api/health`, `/api/auth/login`, `/api/dashboard`, and `/api/audit-logs`. It uses an in-memory dataset for the demo, while `backend/prisma/schema.prisma` provides the production PostgreSQL schema.

## Deployment

1. Create a PostgreSQL database and set `DATABASE_URL` and `JWT_SECRET` for the backend.
2. Deploy `backend` to Render/Railway as a Node service (`npm install && npm start`).
3. Set `VITE_API_BASE_URL` in the frontend environment to the API URL and deploy `frontend` to Vercel/Netlify (`npm run build`).


## Inventory model

`Closing = Opening + Purchases + Transfers In − Transfers Out − Assigned − Expended`

The application is a teaching/demo system: do not use its sample data or client-side demo mode for real operational inventory.
