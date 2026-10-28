# Data Directory

This directory stores the SQLite database file used in development.

The database file (`startup_valuation.db`) is created automatically
when the FastAPI backend starts for the first time.

## Production

In production, switch to PostgreSQL by updating `DATABASE_URL` in your `.env`:

```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/startup_valuation
```

Then install the asyncpg driver:
```bash
pip install asyncpg
```

The database file is `.gitignore`d — never commit it to version control.
