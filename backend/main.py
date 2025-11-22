"""FastAPI entrypoint for the Human Design SaaS backend."""
from __future__ import annotations

from fastapi import FastAPI

from backend.routers import design

app = FastAPI(title="Human Design SaaS", version="0.1.0")
app.include_router(design.router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}

