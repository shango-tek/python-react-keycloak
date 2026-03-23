<#
.SYNOPSIS
    Windows PowerShell equivalent of the project Makefile.

.DESCRIPTION
    Run this script from the project root.  On Linux/macOS use the Makefile
    instead.  On Windows you can also use WSL2 or Git Bash to run `make`
    directly — this script is purely for native PowerShell users.

.EXAMPLE
    .\make.ps1 up
    .\make.ps1 logs-api
    .\make.ps1 help
#>

param(
    [Parameter(Position = 0)]
    [string]$Target = "help"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$COMPOSE     = "docker compose -f infra/docker-compose.yml"
$FASTAPI_CTR = "fastapi"
$OLLAMA_CTR  = "ollama"
$REACT_DIR   = "react"
$OLLAMA_MODEL = "llama3.2:3b"

function Invoke-Compose { param([string]$Args) Invoke-Expression "$COMPOSE $Args" }

switch ($Target) {

    "up" {
        Write-Host "Starting all containers..." -ForegroundColor Cyan
        Invoke-Compose "up -d"
    }

    "down" {
        Write-Host "Stopping containers..." -ForegroundColor Cyan
        Invoke-Compose "down"
    }

    "build" {
        Write-Host "Rebuilding images..." -ForegroundColor Cyan
        Invoke-Compose "build"
    }

    "restart" {
        Write-Host "Rebuilding and restarting..." -ForegroundColor Cyan
        Invoke-Compose "build"
        Invoke-Compose "up -d"
    }

    "clean" {
        Write-Warning "This will delete all Docker volumes (database data)."
        $confirm = Read-Host "Are you sure? [y/N]"
        if ($confirm -match "^[Yy]$") {
            Invoke-Compose "down -v"
        } else {
            Write-Host "Cancelled." -ForegroundColor Yellow
        }
    }

    "seed" {
        Write-Host "Re-seeding the books catalogue..." -ForegroundColor Cyan
        docker exec $FASTAPI_CTR python seed_db.py
    }

    "pull-model" {
        Write-Host "Pulling Ollama model '$OLLAMA_MODEL'..." -ForegroundColor Cyan
        docker exec $OLLAMA_CTR ollama pull $OLLAMA_MODEL
    }

    "list-models" {
        docker exec $OLLAMA_CTR ollama list
    }

    "logs" {
        Invoke-Compose "logs -f"
    }

    "logs-api" {
        Invoke-Compose "logs -f $FASTAPI_CTR"
    }

    "logs-react" {
        Invoke-Compose "logs -f react"
    }

    "logs-db" {
        Invoke-Compose "logs -f postgres"
    }

    "logs-ollama" {
        Invoke-Compose "logs -f $OLLAMA_CTR"
    }

    "ps" {
        Invoke-Compose "ps"
    }

    "health" {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/health"
        $response | ConvertTo-Json
    }

    "install" {
        Set-Location $REACT_DIR
        npm install
        Set-Location ..
    }

    "dev" {
        Set-Location $REACT_DIR
        npm run dev
    }

    "help" {
        Write-Host ""
        Write-Host "  python-react-keycloak — available targets" -ForegroundColor White
        Write-Host ""
        $targets = @(
            @{ Name = "up";          Desc = "Start all containers in the background" },
            @{ Name = "down";        Desc = "Stop containers (volumes are preserved)" },
            @{ Name = "build";       Desc = "Rebuild Docker images" },
            @{ Name = "restart";     Desc = "Rebuild and restart all containers" },
            @{ Name = "clean";       Desc = "Stop containers AND delete all volumes (wipes DB)" },
            @{ Name = "seed";        Desc = "Re-seed the books catalogue (destructive)" },
            @{ Name = "pull-model";  Desc = "Force re-pull the Ollama model" },
            @{ Name = "list-models"; Desc = "List models in the Ollama container" },
            @{ Name = "logs";        Desc = "Tail logs from all containers" },
            @{ Name = "logs-api";    Desc = "Tail FastAPI logs" },
            @{ Name = "logs-react";  Desc = "Tail React (nginx) logs" },
            @{ Name = "logs-db";     Desc = "Tail PostgreSQL logs" },
            @{ Name = "logs-ollama"; Desc = "Tail Ollama logs" },
            @{ Name = "ps";          Desc = "Show running containers" },
            @{ Name = "health";      Desc = "Quick health check on FastAPI" },
            @{ Name = "install";     Desc = "Install React / Node dependencies" },
            @{ Name = "dev";         Desc = "Start the Vite dev server with HMR" }
        )
        foreach ($t in $targets) {
            Write-Host ("  {0,-18} {1}" -f $t.Name, $t.Desc) -ForegroundColor Cyan
        }
        Write-Host ""
        Write-Host "  Usage: .\make.ps1 <target>" -ForegroundColor Gray
        Write-Host ""
    }

    default {
        Write-Error "Unknown target '$Target'. Run '.\make.ps1 help' to see available targets."
    }
}
