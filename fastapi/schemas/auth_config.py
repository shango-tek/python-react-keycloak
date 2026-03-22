from pydantic import BaseModel


class AuthConfig(BaseModel):
    server_url: str
    realm_name: str
    client_id: str
    authorization_url: str
    token_url: str