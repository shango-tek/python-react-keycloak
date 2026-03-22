from typing import Optional

from pydantic import BaseModel


class RealmAccess(BaseModel):
    roles: list[str] = []


class UserPayload(BaseModel):
    sub: str
    preferred_username: str
    email: Optional[str] = None
    given_name: Optional[str] = None
    family_name: Optional[str] = None
    realm_access: Optional[RealmAccess] = None
    resource_access: Optional[dict] = None

    # Convenience properties
    @property
    def realm_roles(self) -> list[str]:
        return self.realm_access.roles if self.realm_access else []
