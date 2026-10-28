# Startup Valuation — Frontend

The React and Vite client for the Startup Valuation founder workspace.

## Development

Install dependencies and run the local dev server from this directory:

```sh
npm ci
npm run dev
```

The Vite development server proxies `/api` requests to the FastAPI backend at `http://127.0.0.1:8000`. Configure `VITE_API_PROXY_TARGET` to use another backend. See the [root README](../README.md) for full-stack setup, API, security limitations, and test instructions.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run frontend tests |
| `npm run build` | Create the production bundle in `dist/` |
| `npm run preview` | Preview the production bundle locally |
