from __future__ import annotations

import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


class TokenEncryptionError(Exception):
    pass


def _fernet() -> Fernet:
    key_material = settings.google_oauth_encryption_key
    if key_material:
        try:
            return Fernet(key_material.encode() if isinstance(key_material, str) else key_material)
        except (ValueError, TypeError) as exc:
            raise TokenEncryptionError("Invalid GOOGLE_OAUTH_ENCRYPTION_KEY") from exc

    derived = base64.urlsafe_b64encode(
        hashlib.sha256(settings.secret_key.encode()).digest()
    )
    return Fernet(derived)


def encrypt_token(value: str) -> str:
    return _fernet().encrypt(value.encode()).decode()


def decrypt_token(value: str) -> str:
    try:
        return _fernet().decrypt(value.encode()).decode()
    except InvalidToken as exc:
        raise TokenEncryptionError("Failed to decrypt stored token") from exc
