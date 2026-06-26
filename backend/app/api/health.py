from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.database import engine
from app.db.dependencies import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/health/db")
def database_health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "database": "disconnected",
                "detail": str(exc),
            },
        )


@router.get("/health/tables")
def tables_health_check(db: Session = Depends(get_db)):
    try:
        inspector = inspect(db.get_bind())
        table_names = set(inspector.get_table_names())

        organizations_ok = "organizations" in table_names
        users_ok = "users" in table_names
        all_ok = organizations_ok and users_ok

        payload = {
            "status": "ok" if all_ok else "error",
            "tables": {
                "organizations": organizations_ok,
                "users": users_ok,
            },
        }

        if not all_ok:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content=payload,
            )

        return payload
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "tables": {
                    "organizations": False,
                    "users": False,
                },
                "detail": str(exc),
            },
        )
