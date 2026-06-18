# Soulflower — Blinkit Sales Dashboard

Analytical dashboard for Soulflower's Blinkit sales. Reproduces three reports —
**Daily**, **SKU wise**, and **City wise** — from the Azure SQL table
`dbo.raw_sales`.

- `backend/` — Node + Express + TypeScript microservice that queries Azure SQL and
  serves report JSON (port **4000**).
- `frontend/` — Next.js (App Router) + Tailwind dashboard (port **3000**).

> Scope note: stock/SOH, Open-PO, target, marketing-budget and impressions columns
> are not present in `raw_sales` and are shown as greyed placeholders. The
> City-report Region comes from a static `city → region` map
> (`backend/src/lib/cityRegion.ts`).

## Prerequisites
- Node 20+ and npm
- Your machine's public IP added to the Azure SQL server firewall
- Azure SQL credentials (server, database, username, password)

## Setup
```powershell
# from the repo root
npm install            # installs both workspaces

# backend env
cd backend
Copy-Item .env.example .env
# edit .env -> DB_NAME, DB_USER, DB_PASSWORD (DB_SERVER defaults to soulflower.database.windows.net)
cd ..

# frontend env
cd frontend
Copy-Item .env.local.example .env.local   # default API base is http://localhost:4000
cd ..
```

## Run (two terminals)
```powershell
# terminal 1 — backend
cd backend ; npm run dev      # http://localhost:4000

# terminal 2 — frontend
cd frontend ; npm run dev     # http://localhost:3000
```

## Verify the backend
```powershell
curl http://localhost:4000/api/health
curl http://localhost:4000/api/schema                       # columns + detected date1 strategy
curl "http://localhost:4000/api/reports/daily?month=2026-06"
curl "http://localhost:4000/api/reports/sku?month=2026-06"
curl "http://localhost:4000/api/reports/city?month=2026-06"
```

## API
| Method | Path | Query |
|---|---|---|
| GET | `/api/health` | — |
| GET | `/api/schema` | — |
| GET | `/api/reports/daily` | `month=YYYY-MM` or `from`/`to` (`YYYY-MM-DD`) |
| GET | `/api/reports/sku` | `month` / `from` / `to` |
| GET | `/api/reports/city` | `month` / `from` / `to` / `limit` |

Default range = current month-to-date.

## How `date1` is interpreted
The backend introspects `dbo.raw_sales` at startup and picks a strategy:
- date/datetime column → used directly
- integer column → treated as an **Excel serial** (`DATEADD(day, date1, '1899-12-30')`)
- string column → `TRY_CONVERT(date, …)`

The resolved strategy is logged, returned by `/api/schema`, and shown in the
dashboard header so any misdetection is visible.
