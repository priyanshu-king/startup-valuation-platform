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

