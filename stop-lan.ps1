# MR. TATOO â€” Detener Docker/LAN
#
# Uso (PowerShell, desde esta carpeta):
#   .\stop-lan.ps1
#   .\stop-lan.ps1 -Volumes
#   .\stop-lan.cmd
#
param([switch]$Volumes)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$EnvLan = Join-Path $ProjectRoot "backend\.env.lan"
$ComposeFiles = "--env-file", $EnvLan, "-f", "docker-compose.yml", "-f", "docker-compose.lan.yml"

Write-Host "========================================"
Write-Host "MR. TATOO - Detener Docker/LAN"
Write-Host "========================================"

Push-Location $ProjectRoot
try {
    if ($Volumes) {
        Write-Host "Borrando volumenes (BD limpia)..." -ForegroundColor Yellow
        & docker compose @ComposeFiles down -v
    } else {
        & docker compose @ComposeFiles down
    }
    if ($LASTEXITCODE -ne 0) { throw "docker compose down fallÃ³ (exit $LASTEXITCODE)" }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "Stack LAN detenido." -ForegroundColor Green
if (-not $Volumes) {
    Write-Host "Datos Postgres conservados. BD limpia: stop-lan.ps1 -Volumes"
}
