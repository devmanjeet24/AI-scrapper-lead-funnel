from fastapi import FastAPI

app = FastAPI(
    title="AI Scraper Lead Funnel",
    description="Backend API for scraping, campaigns, agents, and lead management.",
    version="0.1.0",
)


@app.get("/")
def read_root():
    return {
        "message": "AI Scraper Lead Funnel API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}
