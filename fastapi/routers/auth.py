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
    try:
        # Many issues arise from passing 'key' manually as it skips some jwcrypto logic.
        # Letting KeycloakOpenID fetch its own certs is more reliable.
        return keycloak_openid.decode_token(
            token,
            # If audience check fails, you may need to add audience=settings.client_id
        )
    except Exception as e:
        print(f"Token validation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_user_info(payload: dict = Depends(get_payload)) -> UserPayload:
    try:
        # Add original payload to UserPayload if needed for debugging or raw access
        return UserPayload(**payload)
    except Exception as e:
        print(f"UserPayload validation error: {str(e)}")
        print(f"Payload was: {payload}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},

        )
