import os

from dotenv import load_dotenv

from schemas import AuthConfig

load_dotenv()

SERVER_URL = os.getenv("KC_SERVER_URL")
REALM_NAME = os.getenv("KC_REALM_NAME")
CLIENT_ID = os.getenv("KC_CLIENT_ID")
CLIENT_SECRET = os.getenv("KC_CLIENT_SECRET")
AUTHORIZATION_URL = os.getenv("KC_AUTHORIZATION_URL")
TOKEN_URL = os.getenv("KC_TOKEN_URL")

if not SERVER_URL or not REALM_NAME or not CLIENT_ID:
    raise ValueError("Keycloak configuration variables are not set in .env file")

settings = AuthConfig(
    server_url=SERVER_URL,
    realm_name=REALM_NAME,
    client_id=CLIENT_ID,
    authorization_url= AUTHORIZATION_URL,
    token_url=TOKEN_URL,
)