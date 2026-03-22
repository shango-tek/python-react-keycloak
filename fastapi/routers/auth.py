from functools import lru_cache

from fastapi import Security, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from keycloak.keycloak_openid import KeycloakOpenID
from starlette import status

from config import settings
from schemas import UserPayload

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=settings.token_url)

keycloak_openid = KeycloakOpenID(
    client_id=settings.client_id,
    realm_name=settings.realm_name,
    server_url=settings.server_url,
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
    print(f"TOKEN: {token[:50]}...")   # ← ersten 50 Zeichen loggen
    print(f"KEY: {get_public_key()}")  # ← Public Key loggen
    try:
        return keycloak_openid.decode_token(
            token,
            key=get_public_key(),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_user_info(payload: dict = Depends(get_payload)) -> UserPayload:
    try:
        return UserPayload(**payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},

        )
