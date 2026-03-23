from typing import Optional

from pydantic import BaseModel


class RealmAccess(BaseModel):
    roles: list[str] = []


class UserPayload(BaseModel):
    sub: Optional[str] = None
    preferred_username: Optional[str] = None
    email: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    realm_access: Optional[RealmAccess] = None
    resource_access: Optional[dict] = None

    # Pydantic v2: use model_config instead of inner class Config
    model_config = {"extra": "ignore"}

    @property
    def realm_roles(self) -> list[str]:
        return self.realm_access.roles if self.realm_access else []
