import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ScrapeJobStatus, ScrapeResultStatus, ScrapeSourceType
from app.models.scrape_job import ScrapeJob
from app.models.scrape_result import ScrapeResult
from app.schemas.scrape import ScrapeJobCreate, ScrapeJobUpdate


class ScrapeJobNotFoundError(Exception):
    pass


class ScrapeResultNotFoundError(Exception):
    pass


class ScrapeJobNotRunnableError(Exception):
    pass


def list_jobs(
    db: Session,
    organization_id: uuid.UUID,
    *,
    status: ScrapeJobStatus | None = None,
    source_type: ScrapeSourceType | None = None,
    is_active: bool | None = None,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[ScrapeJob], int]:
    filters = [ScrapeJob.organization_id == organization_id]

    if status is not None:
        filters.append(ScrapeJob.status == status)
    if source_type is not None:
        filters.append(ScrapeJob.source_type == source_type)
    if is_active is not None:
        filters.append(ScrapeJob.is_active == is_active)

    total = db.scalar(select(func.count()).select_from(ScrapeJob).where(*filters)) or 0
    jobs = db.scalars(
        select(ScrapeJob)
        .where(*filters)
        .order_by(ScrapeJob.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()
    return list(jobs), total


def get_job(db: Session, organization_id: uuid.UUID, job_id: uuid.UUID) -> ScrapeJob | None:
    return db.scalar(
        select(ScrapeJob).where(
            ScrapeJob.id == job_id,
            ScrapeJob.organization_id == organization_id,
        )
    )


def create_job(
    db: Session,
    organization_id: uuid.UUID,
    user_id: uuid.UUID,
    payload: ScrapeJobCreate,
) -> ScrapeJob:
    job = ScrapeJob(
        organization_id=organization_id,
        created_by_id=user_id,
        name=payload.name,
        description=payload.description,
        source_type=payload.source_type,
        target_url=str(payload.target_url),
        config=payload.config,
        schedule_cron=payload.schedule_cron,
        is_active=True,
        status=ScrapeJobStatus.active,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def update_job(
    db: Session,
    organization_id: uuid.UUID,
    job_id: uuid.UUID,
    payload: ScrapeJobUpdate,
) -> ScrapeJob:
    job = get_job(db, organization_id, job_id)
    if job is None:
        raise ScrapeJobNotFoundError

    updates = payload.model_dump(exclude_unset=True)
    if "target_url" in updates and updates["target_url"] is not None:
        updates["target_url"] = str(updates["target_url"])

    for field, value in updates.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return job


def archive_job(db: Session, organization_id: uuid.UUID, job_id: uuid.UUID) -> ScrapeJob:
    job = get_job(db, organization_id, job_id)
    if job is None:
        raise ScrapeJobNotFoundError

    job.status = ScrapeJobStatus.archived
    job.is_active = False
    db.commit()
    db.refresh(job)
    return job


def schedule_job_run(
    db: Session,
    organization_id: uuid.UUID,
    job_id: uuid.UUID,
    user_id: uuid.UUID,
) -> ScrapeResult:
    """Create a pending ScrapeResult record for background execution."""
    job = get_job(db, organization_id, job_id)
    if job is None:
        raise ScrapeJobNotFoundError

    if job.status == ScrapeJobStatus.archived or not job.is_active:
        raise ScrapeJobNotRunnableError

    result = ScrapeResult(
        job_id=job.id,
        triggered_by_id=user_id,
        status=ScrapeResultStatus.pending,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


def list_results_for_job(
    db: Session,
    organization_id: uuid.UUID,
    job_id: uuid.UUID,
    *,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[ScrapeResult], int]:
    job = get_job(db, organization_id, job_id)
    if job is None:
        raise ScrapeJobNotFoundError

    query = select(ScrapeResult).where(ScrapeResult.job_id == job_id)
    total = db.scalar(select(func.count()).select_from(ScrapeResult).where(ScrapeResult.job_id == job_id)) or 0
    results = db.scalars(
        query.order_by(ScrapeResult.created_at.desc()).limit(limit).offset(offset)
    ).all()
    return list(results), total


def get_result(db: Session, organization_id: uuid.UUID, result_id: uuid.UUID) -> ScrapeResult | None:
    return db.scalar(
        select(ScrapeResult)
        .join(ScrapeJob, ScrapeResult.job_id == ScrapeJob.id)
        .where(
            ScrapeResult.id == result_id,
            ScrapeJob.organization_id == organization_id,
        )
    )
