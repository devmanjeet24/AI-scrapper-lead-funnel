from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import UserLoginRequest, UserRegisterRequest


class EmailAlreadyRegisteredError(Exception):
    pass


class InvalidCredentialsError(Exception):
    pass


class InactiveUserError(Exception):
    pass


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.scalar(select(User).where(User.email == email))


def register_user(db: Session, payload: UserRegisterRequest) -> User:
    existing_user = get_user_by_email(db, payload.email)
    if existing_user is not None:
        raise EmailAlreadyRegisteredError

    organization = Organization(
        name=payload.organization_name,
        website=payload.website,
    )
    user = User(
        organization=organization,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_active=True,
    )

    db.add(organization)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: UserLoginRequest) -> User:
    user = get_user_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise InvalidCredentialsError

    if not user.is_active:
        raise InactiveUserError

    return user
