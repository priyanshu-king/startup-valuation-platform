"""
Vercel Python entrypoint
========================
Exposes the existing FastAPI application (``backend/main.py``) as an ASGI
function.  ``vercel.json`` rewrites every ``/api/*`` request to this file, so
the API and the Vite frontend are served from the same origin.

Locally the backend still runs from ``backend/`` via
``uvicorn main:app --reload`` (see the README).
"""

import sys
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parents[1] / "backend"
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from main import app  # noqa: E402,F401  (re-exported for Vercel)

__all__ = ["app"]
