import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

_PASSWORD_UPPERCASE = re.compile(r"[A-Z]")
_PASSWORD_LOWERCASE = re.compile(r"[a-z]")
_PASSWORD_DIGIT = re.compile(r"\d")


def _validate_full_name(value: str) -> str:
    if value != value.strip():
        raise ValueError("must not have leading or trailing spaces")
    if not value.strip():
        raise ValueError("must not be only spaces")
    return value


def _validate_organization_name(value: str) -> str:
    if not value.strip():
        raise ValueError("must not be only spaces")
    return value


def _validate_password(value: str) -> str:
    if value != value.strip():
        raise ValueError("must not have leading or trailing spaces")
    if len(value) < 8:
        raise ValueError("must be at least 8 characters")
    if len(value) > 128:
        raise ValueError("must be at most 128 characters")
    if not _PASSWORD_UPPERCASE.search(value):
        raise ValueError("must contain at least one uppercase letter")
    if not _PASSWORD_LOWERCASE.search(value):
        raise ValueError("must contain at least one lowercase letter")
    if not _PASSWORD_DIGIT.search(value):
        raise ValueError("must contain at least one number")
    return value


class UserRegisterRequest(BaseModel):
    organization_name: str = Field(min_length=2, max_length=255)
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    website: str | None = Field(default=None, max_length=500)

    @field_validator("organization_name")
    @classmethod
    def validate_organization_name(cls, value: str) -> str:
        return _validate_organization_name(value)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        return _validate_full_name(value)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password(value)


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        return _validate_password(value)


class OrganizationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime
    organization: OrganizationSummary


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
