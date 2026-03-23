import logging
from functools import lru_cache

from fastapi import Depends, HTTPException, Security
from fastapi.security import OAuth2PasswordBearer
from keycloak.keycloak_openid import KeycloakOpenID
from starlette import status

from app.core.config import settings
from app.schemas import UserPayload

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=settings.keycloak_token_url)

keycloak_openid = KeycloakOpenID(
    client_id=settings.KC_CLIENT_ID,
    realm_name=settings.KC_REALM_NAME,
    server_url=settings.KC_SERVER_URL,
    verify=True,
)


@lru_cache(maxsize=1)
def get_public_key() -> str:
    return (
        "-----BEGIN PUBLIC KEY-----\n"
        f"{keycloak_openid.public_key()}\n"
        "-----END PUBLIC KEY-----"
    )


async def get_payload(token: str = Security(oauth2_scheme)) -> dict:
    try:
        # Letting KeycloakOpenID fetch its own JWKS certs is more reliable than
        # passing a manually constructed public key, which can skip jwcrypto logic.
        return keycloak_openid.decode_token(token)
    except Exception as exc:
        logger.warning("Token validation failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_user_info(payload: dict = Depends(get_payload)) -> UserPayload:
    try:
        return UserPayload(**payload)
    except Exception as exc:
        logger.warning("UserPayload validation error: %s | payload: %s", exc, payload)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        )
