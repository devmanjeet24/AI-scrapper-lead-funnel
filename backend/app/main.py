from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.health import router as health_router
from app.api.scrape_jobs import router as scrape_jobs_router
from app.api.signals import router as signals_router

app = FastAPI(
    title="AI Scraper Lead Funnel",
    description="Backend API for scraping, campaigns, agents, and lead management.",
    version="0.1.0",
)

app.include_router(health_router)
app.include_router(auth_router)
app.include_router(scrape_jobs_router)
app.include_router(signals_router)


@app.get("/")
def read_root():
    return {
        "message": "AI Scraper Lead Funnel API",
        "docs": "/docs",
        "health": "/health",
        "health_db": "/health/db",
        "health_tables": "/health/tables",
        "auth_register": "/auth/register",
        "auth_login": "/auth/login",
        "auth_me": "/auth/me",
        "scrape_jobs": "/scrape-jobs",
        "signals": "/signals",
    }
