import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.enums import DeploymentPackageStatus
from app.models.user import User
from app.schemas.deployment import (
    DeploymentAnalyzeRequest,
    DeploymentExecuteRequest,
    DeploymentPackageCreate,
    DeploymentPackageResponse,
    MonitoringAnalysisResponse,
    MonitoringSnapshotCreate,
    MonitoringSnapshotResponse,
    PaginatedDeploymentPackagesResponse,
    PaginatedMonitoringSnapshotsResponse,
)
from app.services.deployment_monitoring_service import (
    DeploymentAnalysisError,
    analyze_deployment_package,
    list_monitoring_snapshots,
    record_monitoring_snapshot,
    run_monitoring_analysis,
    simulate_monitoring_snapshot,
)
from app.services.deployment_package_service import (
    DeploymentPackageNotFoundError,
    InvalidDeploymentPackageError,
    execute_deployment_package,
    get_deployment_package,
    list_deployment_packages,
    prepare_deployment_package,
)

router = APIRouter(tags=["deployment"])


@router.post(
    "/creative-sets/{creative_set_id}/deployment-package",
    response_model=DeploymentPackageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_deployment_package_endpoint(
    creative_set_id: uuid.UUID,
    payload: DeploymentPackageCreate | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return prepare_deployment_package(
            db,
            current_user.organization_id,
            creative_set_id,
            current_user.id,
            payload or DeploymentPackageCreate(),
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Creative set not found",
        ) from None
    except InvalidDeploymentPackageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.get("/deployment-packages", response_model=PaginatedDeploymentPackagesResponse)
def list_deployment_packages_endpoint(
    lead_id: uuid.UUID | None = Query(default=None),
    status_filter: DeploymentPackageStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_deployment_packages(
        db,
        current_user.organization_id,
        lead_id=lead_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return PaginatedDeploymentPackagesResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get(
    "/leads/{lead_id}/deployment-packages",
    response_model=PaginatedDeploymentPackagesResponse,
)
def list_lead_deployment_packages_endpoint(
    lead_id: uuid.UUID,
    status_filter: DeploymentPackageStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items, total = list_deployment_packages(
        db,
        current_user.organization_id,
        lead_id=lead_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    return PaginatedDeploymentPackagesResponse(
        items=items,
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/deployment-packages/{package_id}", response_model=DeploymentPackageResponse)
def get_deployment_package_endpoint(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    package = get_deployment_package(db, current_user.organization_id, package_id)
    if package is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        )
    return package


@router.post(
    "/deployment-packages/{package_id}/analyze",
    response_model=DeploymentPackageResponse,
)
async def analyze_deployment_package_endpoint(
    package_id: uuid.UUID,
    payload: DeploymentAnalyzeRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await analyze_deployment_package(
            db,
            current_user.organization_id,
            package_id,
            requested_mode=(payload or DeploymentAnalyzeRequest()).mode.value,
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None
    except DeploymentAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None


@router.post(
    "/deployment-packages/{package_id}/execute",
    response_model=DeploymentPackageResponse,
)
async def execute_deployment_package_endpoint(
    package_id: uuid.UUID,
    payload: DeploymentExecuteRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return await execute_deployment_package(
            db,
            current_user.organization_id,
            package_id,
            mode=(payload or DeploymentExecuteRequest()).mode.value,
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None
    except InvalidDeploymentPackageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.get(
    "/deployment-packages/{package_id}/monitoring-snapshots",
    response_model=PaginatedMonitoringSnapshotsResponse,
)
def list_monitoring_snapshots_endpoint(
    package_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        items, total = list_monitoring_snapshots(
            db,
            current_user.organization_id,
            package_id,
            limit=limit,
            offset=offset,
        )
        return PaginatedMonitoringSnapshotsResponse(
            items=items,
            total=total,
            limit=limit,
            offset=offset,
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None


@router.post(
    "/deployment-packages/{package_id}/monitoring-snapshots",
    response_model=MonitoringSnapshotResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_monitoring_snapshot_endpoint(
    package_id: uuid.UUID,
    payload: MonitoringSnapshotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    metrics = {
        "impressions": payload.impressions,
        "clicks": payload.clicks,
        "spend": payload.spend,
        "conversions": payload.conversions,
    }
    if payload.ctr is not None:
        metrics["ctr"] = payload.ctr
    if payload.cpc is not None:
        metrics["cpc"] = payload.cpc
    if payload.extra:
        metrics.update(payload.extra)

    try:
        return record_monitoring_snapshot(
            db,
            current_user.organization_id,
            package_id,
            current_user.id,
            metrics=metrics,
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None
    except InvalidDeploymentPackageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.post(
    "/deployment-packages/{package_id}/monitoring-snapshots/simulate",
    response_model=MonitoringSnapshotResponse,
    status_code=status.HTTP_201_CREATED,
)
def simulate_monitoring_snapshot_endpoint(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return simulate_monitoring_snapshot(
            db,
            current_user.organization_id,
            package_id,
            current_user.id,
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None
    except InvalidDeploymentPackageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None


@router.post(
    "/deployment-packages/{package_id}/monitor",
    response_model=MonitoringAnalysisResponse,
)
async def run_monitoring_analysis_endpoint(
    package_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        package, analysis = await run_monitoring_analysis(
            db,
            current_user.organization_id,
            package_id,
        )
        return MonitoringAnalysisResponse(
            recommendation=analysis.recommendation,
            health_score=analysis.health_score,
            summary=analysis.summary,
            key_findings=analysis.key_findings,
            action_items=analysis.action_items,
            suggested_budget_change=analysis.suggested_budget_change,
            creative_suggestions=analysis.creative_suggestions,
            alert_level=analysis.alert_level,
            package=package,
        )
    except DeploymentPackageNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment package not found",
        ) from None
    except InvalidDeploymentPackageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from None
    except DeploymentAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"message": str(exc), "code": exc.code},
        ) from None
