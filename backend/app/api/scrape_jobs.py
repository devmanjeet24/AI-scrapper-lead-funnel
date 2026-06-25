import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import ScrapeJobStatus, ScrapeSourceType
from app.models.user import User
from app.schemas.scrape import (
    PaginatedScrapeJobsResponse,
    PaginatedScrapeResultsResponse,
    ScrapeJobCreate,
    ScrapeJobResponse,
    ScrapeJobUpdate,
    ScrapeResultResponse,
    ScrapeRunResponse,
)
from app.services.scrape_service import (
    ScrapeJobNotFoundError,
    ScrapeJobNotRunnableError,
    ScrapeResultNotFoundError,
    archive_job,
    create_job,
    get_job,
    get_result,
    list_jobs,
    list_results_for_job,
    schedule_job_run,
    update_job,
)
from app.workers.scrape_worker import execute_scrape_run

router = APIRouter(tags=["scraper"])


@router.get("/scrape-jobs", response_model=PaginatedScrapeJobsResponse)
def list_scrape_jobs(
    status_filter: ScrapeJobStatus | None = Query(default=None, alias="status"),
    source_type: ScrapeSourceType | None = Query(default=None),
    is_active: bool | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    jobs, total = list_jobs(
        db,
        current_user.organization_id,
        status=status_filter,
        source_type=source_type,
        is_active=is_active,
        limit=limit,
        offset=offset,
    )
    return PaginatedScrapeJobsResponse(
        items=jobs,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("/scrape-jobs", response_model=ScrapeJobResponse, status_code=status.HTTP_201_CREATED)
def create_scrape_job(
    payload: ScrapeJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_job(db, current_user.organization_id, current_user.id, payload)


@router.get("/scrape-jobs/{job_id}", response_model=ScrapeJobResponse)
def get_scrape_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    job = get_job(db, current_user.organization_id, job_id)
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrape job not found")
    return job


@router.patch("/scrape-jobs/{job_id}", response_model=ScrapeJobResponse)
def update_scrape_job(
    job_id: uuid.UUID,
    payload: ScrapeJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_job(db, current_user.organization_id, job_id, payload)
    except ScrapeJobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrape job not found") from None


@router.delete("/scrape-jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scrape_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        archive_job(db, current_user.organization_id, job_id)
    except ScrapeJobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrape job not found") from None


@router.post(
    "/scrape-jobs/{job_id}/run",
    response_model=ScrapeRunResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def run_scrape_job(
    job_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = schedule_job_run(db, current_user.organization_id, job_id, current_user.id)
    except ScrapeJobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrape job not found") from None
    except ScrapeJobNotRunnableError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scrape job is not runnable",
        ) from None

    background_tasks.add_task(execute_scrape_run, result.id)

    return ScrapeRunResponse(
        result_id=result.id,
        job_id=result.job_id,
        status=result.status,
        message="Scrape run started",
    )


@router.get("/scrape-jobs/{job_id}/results", response_model=PaginatedScrapeResultsResponse)
def list_scrape_job_results(
    job_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        results, total = list_results_for_job(
            db,
            current_user.organization_id,
            job_id,
            limit=limit,
            offset=offset,
        )
    except ScrapeJobNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrape job not found") from None

    return PaginatedScrapeResultsResponse(
        items=results,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/scrape-results/{result_id}", response_model=ScrapeResultResponse)
def get_scrape_result(
    result_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = get_result(db, current_user.organization_id, result_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scrape result not found")
    return result
