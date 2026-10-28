<div align="center">

<img src="docs/banner.svg" alt="Startup Valuation Platform" width="100%" />

### Know what your startup is worth, and exactly why.

A full-stack founder workspace for model-based valuation, financial planning, runway, fundraising, and execution roadmaps.

<p>
  <img src="https://img.shields.io/badge/React-18-149ECA?style=for-the-badge&logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python 3.10+" />
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy 2.0" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
</p>

<p>
  <a href="https://github.com/priyanshu-king/startup-valuation-platform/actions"><img src="https://github.com/priyanshu-king/startup-valuation-platform/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <img src="https://img.shields.io/github/last-commit/priyanshu-king/startup-valuation-platform?color=7c3aed" alt="Last commit" />
  <img src="https://img.shields.io/github/repo-size/priyanshu-king/startup-valuation-platform?color=0891b2" alt="Repo size" />
</p>

<p>
  <a href="#-features">Features</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-api-at-a-glance">API</a> ·
  <a href="#-security">Security</a> ·
  <a href="#-tests">Tests</a>
</p>

</div>

> **Important:** Valuations and financial projections are estimates based on user-provided inputs and disclosed model assumptions. They are not certified appraisals, investment advice, or guarantees.

---

## ✨ Features

| | Module | What you get |
| :-: | --- | --- |
| 📊 | **Valuation engine** | Guided profile, financials, business and market intake, then a deterministic estimate with method breakdown, assumptions and low/base/high scenarios. |
| 💸 | **Financial planner and runway** | Editable monthly forecasts: revenue, costs, net cash flow and closing cash. |
| 🤝 | **Fundraising and cap table** | Priced-round dilution and ownership calculations. |
| ✅ | **Investor readiness** | A founder checklist to see how prepared you are. |
| 📄 | **Reports and PDF** | Owner-scoped report history with on-demand PDF downloads. |
| 🗺️ | **Startup roadmaps** | Editable plans tailored to business type and stage (template-based drafts, not an AI service). |
| ⚙️ | **Workspace and settings** | Account-backed reports alongside clearly marked browser-only preferences. |

**Why it's different:** every number is traceable. The engine does not invent comparable-company data, and every assumption is shown next to the result.

## 🖼️ Product tour

The app ships in a dark theme by default, with light text on deep surfaces. Sensitive data such as your email address is browser-only and never fabricated.

<div align="center">
  <table>
    <tr>
      <td><b>Founder workspace</b></td>
      <td><b>Valuation calculator</b></td>
    </tr>
    <tr>
      <td><img src="docs/screenshots/workspace.png" alt="Founder workspace" width="100%" /></td>
      <td><img src="docs/screenshots/valuation.png" alt="Valuation calculator" width="100%" /></td>
    </tr>
    <tr>
      <td><b>Settings</b></td>
      <td><b>About</b></td>
    </tr>
    <tr>
      <td><img src="docs/screenshots/settings.png" alt="Settings" width="100%" /></td>
      <td><img src="docs/screenshots/about.png" alt="About" width="100%" /></td>
    </tr>
  </table>
</div>

> **Privacy note:** blur or crop your email address (`vampirerj2@gmail.com`) in any screenshots you add to `docs/screenshots/` before committing, since this repository is public.

## 🧠 How the valuation works

```mermaid
flowchart LR
    A[Founder inputs] --> B[Revenue multiple by stage]
    A --> C[Growth-adjusted multiple]
    A --> D[Berkus-inspired, pre-revenue]
    B --> E[Average of applicable methods]
    C --> E
    D --> E
    A --> F[Market ceiling: 25% of SOM]
    E --> G[Base value]
    G --> H[Low 75% / High 135%]
    F -. sanity cap .-> G
```

## 🏗️ Architecture

```mermaid
flowchart LR
    Founder[Founder] --> UI[React + Vite workspace]
    UI -->|JSON API and session cookie| API[FastAPI]
    API --> Engine[Valuation and financial services]
    API --> DB[(SQLite by default)]
    UI --> Local[Browser-only preferences and drafts]
```

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, React Hook Form + Zod, Recharts, Framer Motion, Three.js |
| Backend | FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, SlowAPI rate limiting, ReportLab PDFs |
| Security | Argon2 hashing, revocable DB-backed sessions, CSRF protection |
| Delivery | GitHub Actions CI for backend tests, frontend tests and build |

## 🗂️ Project structure

```text
├── backend/
│   ├── api/          # routers and endpoints (auth, valuation, reports, health)
│   ├── core/         # config, security, rate limiting
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # valuation and report logic
│   ├── alembic/      # database migrations
│   └── tests/        # pytest suite
├── frontend/src/
│   ├── components/   # landing, valuation wizard, workspace tools, UI kit
│   ├── pages/        # routes
│   └── services/     # API client and financial calculations
└── .github/workflows # CI
```

The valuation engine uses founder-entered figures and illustrative stage revenue multiples; it does not fetch or invent comparable-company data. Forecasts are scenario estimates, not verified actuals. The roadmap builder creates an editable draft in the current page session and does not persist roadmaps.

## 🚀 Quick start

### Requirements

- Python 3.10 or later
- Node.js 18 or later

### 1. Install backend dependencies

Run these commands from the repository root in PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Prepare the database

Back up any existing database before applying migrations. Then run:

```powershell
Set-Location .\backend
..\.venv\Scripts\python.exe -m alembic -c ..\alembic.ini upgrade head
```

For a fresh database, this creates the schema. Existing valuation rows are intentionally left unowned; ownership is never guessed or backfilled.

### 3. Start the API

In a PowerShell window:

```powershell
Set-Location .\backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API health check and interactive docs are available at `http://localhost:8000/api/health` and `http://localhost:8000/api/docs`.

### 4. Start the frontend

In a second PowerShell window:

```powershell
Set-Location .\frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to `http://127.0.0.1:8000`. Set `VITE_API_PROXY_TARGET` to use a different backend; `VITE_API_BASE_URL` can configure a direct API base URL.

## Environment configuration

The backend reads environment variables (or a local `.env` file) from its working directory. Copy `.env.example` to `backend/.env` only if you need to customize local settings. Never commit `.env` files or real credentials. The valuation calculation and roadmap templates do not require an LLM API key.

For production, set `ENVIRONMENT=production`, `DEBUG=false`, and explicit HTTPS-only `CORS_ORIGINS`. Configure secret management, TLS, database access controls, backups, tested restoration, retention, monitoring, and shared rate limiting before accepting real customer data.

## 🔌 API at a glance

| Area | Route |
| --- | --- |
| Public site | `/` |
| Valuation | `/valuation` |
| Roadmap landing and intake | `/roadmap`, `/roadmap/new` |
| Founder workspace | `/app` |
| Financial planner and runway | `/app/financial-planner`, `/app/runway` |
| Reports and settings | `/app/reports`, `/app/settings` |

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Backend health |
| `POST` | `/api/auth/register` | Register and start a session |
| `POST` | `/api/auth/login` | Authenticate and start a session |
| `GET` | `/api/auth/me` | Read the current user and CSRF token |
| `POST` | `/api/auth/logout` | Revoke the current session |
| `POST` | `/api/valuation/calculate` | Calculate and save an owned valuation |
| `GET` | `/api/valuation/{id}` | Retrieve an owned saved valuation |
| `GET` | `/api/reports` | List the signed-in user's reports |
| `GET` | `/api/reports/{id}` | Read an owned report and its assumptions |
| `GET` | `/api/reports/{id}/pdf` | Generate an owned PDF on demand |
| `DELETE` | `/api/reports/{id}` | Delete an owned report and valuation |

Valuation requests contain `profile`, `financials`, `business`, and `market` objects. `stage` must be one of `idea`, `pre_seed`, `seed`, `series_a`, `series_b`, or `series_c_plus`; `business_model` must be one of `saas`, `marketplace`, `ecommerce`, `fintech`, `edtech`, `healthtech`, or `other`. Market sizes are entered in INR crore and must satisfy `TAM >= SAM >= SOM`.

## Valuation and forecast assumptions

Revenue methods use annual revenue (or monthly revenue × 12 when annual revenue is absent) and an illustrative stage multiple. A growth-adjusted method applies a configured premium; a Berkus-inspired estimate is used for pre-revenue startups. The base is the simple average of applicable methods, excluding the market-ceiling method, which is a sanity cap of 25% of submitted SOM. Low and high scenarios are 75% and 135% of base.

Where inputs allow, the response also includes financial-health, growth, investor-readiness, runway, and LTV/CAC signals. These are model-derived indicators, not independent diligence.

Financial planner and runway inputs, settings, readiness checklists, and roadmap drafts are not persisted to the backend. Currency settings change display formatting only; they do not convert values or change valuation calculations. Forecasts compound entered monthly revenue and total expenses by their respective monthly growth assumptions. Net cash flow is revenue minus operating expenses, payroll, marketing, and other costs; closing cash carries forward. Projections exclude taxes, financing changes, working capital, and seasonality.

## 🔒 Security

- Authentication uses Argon2 password hashes and opaque, revocable database-backed sessions. Session cookies are HttpOnly and SameSite Strict; state-changing authenticated requests require a CSRF token and trusted Origin.
- New valuation reports are owner-scoped. Legacy records without an owner remain unowned and are not exposed in report history.
- Settings and several founder tools are browser-local or session-only. Roadmaps are not persisted and the roadmap workspace does not expose private records.
- Email verification, password recovery, account deletion, organization isolation, production backups, and infrastructure provisioning are not included.
- SQLite is the default local database. Review deployment security and data-retention requirements before using real customer data.

## 🧪 Tests

From the repository root:

```powershell
.\.venv\Scripts\python.exe -m pytest backend\tests -q
Set-Location .\frontend
npm test
npm run build
```

## 🚀 Deploy

**Live:** <https://startup-valuation-platform.vercel.app> ·
[health check](https://startup-valuation-platform.vercel.app/api/health) ·
[API docs](https://startup-valuation-platform.vercel.app/api/docs)

The Vercel project is connected to this GitHub repository (production branch `main`),
so every merge to `main` ships a new production deployment. The database is a hosted
Supabase PostgreSQL project (`us-east-1`) reached through the Supavisor pooler.

This repository is ready to deploy as a **single Vercel project**: Vercel builds the
Vite frontend to static files and runs the FastAPI backend as a Python serverless
function (`api/index.py`). Because both are served from the same origin, the browser
calls `/api` directly — no CORS or `VITE_API_BASE_URL` configuration is required.

Production needs a hosted PostgreSQL database (SQLite is local-only and is not
persisted by serverless functions). Any Postgres provider works — Neon, Supabase,
Vercel Postgres, Railway, etc.

### Vercel project settings

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Root directory | repository root |
| Install command | `npm --prefix frontend ci` |
| Build command | `npm --prefix frontend run build` |
| Output directory | `frontend/dist` |

These values are already committed in [`vercel.json`](vercel.json), together with the
`/api/*` → Python function rewrite and the SPA fallback.

### Environment variables

Set these in **Project → Settings → Environment Variables** (production and preview):

| Variable | Example | Notes |
| --- | --- | --- |
| `ENVIRONMENT` | `production` | Required. Enables secure cookies and HSTS. |
| `DEBUG` | `false` | Required. Production refuses to boot with debug on. |
| `DATABASE_URL` | `postgresql://user:pass@host:5432/postgres` | Hosted Postgres URL. `postgres://` and `postgresql+asyncpg://` are normalised automatically. |
| `CORS_ORIGINS` | `https://your-app.vercel.app` | Comma-separated, explicit HTTPS origins (the production deployment only). |

SQLite remains the default when `DATABASE_URL` is unset, which keeps local
development and the test suite unchanged.

### First deploy

1. Push the repository to GitHub.
2. On [vercel.com](https://vercel.com), click **Add New → Project** and import this repository.
3. Keep the root directory and the detected settings above, add the environment
   variables, and click **Deploy**.
4. Tables are created automatically on the first cold start (`Base.metadata.create_all`),
   so no migration step is required for a fresh database. Alembic remains available for
   schema evolution:

   ```sh
   cd backend && alembic upgrade head
   ```

### Verify the deployment

```sh
curl -i https://your-app.vercel.app/api/health
curl -i https://your-app.vercel.app/api/docs
```

- `GET /api/health` returns `{"status": "ok", ...}` when the function is live.
- Register an account in the UI, run a valuation, and confirm it appears in **Reports** —
  that round trip proves frontend → backend → PostgreSQL are all connected.

## License

No license has been specified. Public repository visibility does not grant permission to reuse, distribute, or modify this project.

