"""
System endpoints — /system

Provides operational endpoints:
- /health  — simple liveness probe for load balancers / orchestrators.
- /system-data — authenticated endpoint returning server + session metadata.
"""

import platform
import uuid
from datetime import datetime, timezone
from typing import Any, Dict

import psutil
from fastapi import APIRouter, Depends

from app.core.auth import get_user_info
from app.schemas import UserPayload

router = APIRouter()


@router.get(
    "/health",
    summary="Liveness probe (versioned)",
    tags=["health"],
)
async def health_check() -> Dict[str, str]:
    """
    Versioned health check at /api/v1/system/health.

    A root-level /health endpoint also exists in main.py for container
    orchestrators that don't know the API prefix.
    """
    return {"status": "ok", "timestamp": datetime.now(tz=timezone.utc).isoformat()}


@router.get(
    "/system-data",
    summary="Authenticated server telemetry",
    dependencies=[],  # auth applied via the Depends below
)
async def get_system_data(
    user: UserPayload = Depends(get_user_info),
) -> Dict[str, Any]:
    """
    Returns server system metrics and session metadata.

    Requires a valid Keycloak JWT.  The response shape is consumed directly
    by the SecurePanel component on the frontend:

    ```json
    {
      "message": "Welcome, alice!",
      "server_time": "2025-01-01T12:00:00+00:00",
      "environment": "docker",
      "user_stats": {
        "request_id": "a1b2c3d4-...",
        "access_tier": "admin"
      }
    }
    ```
    """
    # Determine the access tier from realm roles
    is_admin = "admin" in (user.realm_roles or [])
    access_tier = "admin" if is_admin else "standard"

    return {
        # -- Frontend SecurePanel fields ----------------------------------------
        "message": f"Welcome, {user.preferred_username or user.sub}!",
        "server_time": datetime.now(tz=timezone.utc).isoformat(),
        "environment": "production" if platform.system() == "Linux" else "local",
        "user_stats": {
            "request_id": str(uuid.uuid4()),
            "access_tier": access_tier,
        },
        # -- Extended system metrics (available for future use) -----------------
        "system": {
            "platform": platform.system(),
            "release": platform.release(),
            "cpu_count": psutil.cpu_count(),
            "memory_total_gb": round(psutil.virtual_memory().total / 1e9, 2),
            "memory_used_pct": psutil.virtual_memory().percent,
            "disk_used_pct": psutil.disk_usage("/").percent,
        },
    }
