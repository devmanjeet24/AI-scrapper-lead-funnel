from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.settings import SettingsStatusResponse
from app.services.settings_status_service import get_settings_status

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/status", response_model=SettingsStatusResponse)
def settings_status_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_settings_status(db, current_user.organization_id)
