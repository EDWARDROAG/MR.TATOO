# MR. TATOO â€” Bootstrap LAN (seed admin, sin datos demo)
#
# Uso (PowerShell, desde esta carpeta):
#   .\bootstrap-lan.ps1
#   .\bootstrap-lan.ps1 -ResetAdmin
#   .\bootstrap-lan.cmd
#
param([switch]$ResetAdmin)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$EnvLan = Join-Path $ProjectRoot "backend\.env.lan"
$ComposeFiles = "--env-file", $EnvLan, "-f", "docker-compose.yml", "-f", "docker-compose.lan.yml"

if (-not (Test-Path $EnvLan)) {
    Write-Host "Falta backend\.env.lan" -ForegroundColor Red
    exit 1
}

Push-Location $ProjectRoot
try {
    Write-Host "========================================"
    if ($ResetAdmin) {
        Write-Host "MR. TATOO - Reset password admin (LAN)"
        & docker compose @ComposeFiles exec -T backend npm run seed:reset-admin
    } else {
        Write-Host "MR. TATOO - Bootstrap LAN (seed admin)"
        & docker compose @ComposeFiles exec -T backend npm run seed:prod
    }
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
    Pop-Location
}

$email = (Select-String -Path $EnvLan -Pattern '^ADMIN_EMAIL=' | Select-Object -First 1).Line -replace '^ADMIN_EMAIL=', ''
$pass = (Select-String -Path $EnvLan -Pattern '^ADMIN_PASSWORD=' | Select-Object -First 1).Line -replace '^ADMIN_PASSWORD=', ''

Write-Host "========================================"
Write-Host ""
Write-Host "Listo."
Write-Host "Login:  $email"
Write-Host "Clave:  $pass"
Write-Host "URL:    http://localhost:5519/login"
Write-Host ""
