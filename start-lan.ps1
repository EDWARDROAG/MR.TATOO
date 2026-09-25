# Mr. Tatoo - Docker/LAN (Docker Desktop, puerto 5519)
#
# Uso (PowerShell, desde esta carpeta):
#   .\start-lan.cmd              ← recomendado (bypass ExecutionPolicy + build)
#   .\start-lan.ps1 -Build       ← rebuild (si ExecutionPolicy lo permite)
#   powershell -ExecutionPolicy Bypass -File .\start-lan.ps1 -Build
#   .\start-lan.ps1              ← solo up (sin rebuild)
#
param(
    [switch]$Build
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$EnvLan = Join-Path $ProjectRoot "backend\.env.lan"
$ComposeFiles = "--env-file", $EnvLan, "-f", "docker-compose.yml", "-f", "docker-compose.lan.yml"

function Get-LanIp {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.254.*' } |
        Select-Object -First 1).IPAddress
    if ($ip) { return $ip }
    return "192.168.0.50"
}

function Invoke-MrTatooCompose {
    param([Parameter(Mandatory = $true)][string[]]$ComposeArgs)
    Push-Location $ProjectRoot
    try {
        & docker compose @ComposeFiles @ComposeArgs
        if ($LASTEXITCODE -ne 0) { throw "docker compose fallo (exit $LASTEXITCODE)" }
    } finally {
        Pop-Location
    }
}

if (-not (Test-Path $EnvLan)) {
    Write-Host "Falta backend\.env.lan" -ForegroundColor Red
    Write-Host "Copia: copy backend\.env.lan.example backend\.env.lan" -ForegroundColor Yellow
    exit 1
}

$lanIp = Get-LanIp
$publicPort = if ($env:PUBLIC_PORT) { $env:PUBLIC_PORT } else { "5519" }

Write-Host "========================================"
if ($Build) {
    Write-Host "MR. TATOO - Docker/LAN (build + up)"
} else {
    Write-Host "MR. TATOO - Docker/LAN (up)"
}
Write-Host "========================================"

if ($Build) {
    $docsBuild = Join-Path $ProjectRoot "scripts\docs-build.ps1"
    if (Test-Path $docsBuild) {
        Write-Host "HU-065: generando MkDocs → frontend/public/docs ..." -ForegroundColor Cyan
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $docsBuild
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Aviso: docs-build fallo; /docs/ puede faltar en la imagen." -ForegroundColor Yellow
        }
    }
    Invoke-MrTatooCompose -ComposeArgs @("down")
    Invoke-MrTatooCompose -ComposeArgs @("build", "--no-cache")
}
Invoke-MrTatooCompose -ComposeArgs @("up", "-d")

Start-Sleep -Seconds 8
Invoke-MrTatooCompose -ComposeArgs @("ps")

Write-Host ""
Write-Host "Sitio:    http://localhost:${publicPort}"
Write-Host "LAN:      http://${lanIp}:${publicPort}"
Write-Host "API:      http://localhost:${publicPort}/api/health"
Write-Host "Admin:    http://localhost:${publicPort}/login"
Write-Host ""
Write-Host "Primera vez (BD vacia): seed admin" -ForegroundColor Cyan
Write-Host "  docker compose --env-file backend\.env.lan -f docker-compose.yml -f docker-compose.lan.yml exec -T backend npm run seed:prod"
Write-Host ""

try {
    $r = Invoke-WebRequest -Uri "http://localhost:${publicPort}/api/health" -UseBasicParsing -TimeoutSec 15
    if ($r.StatusCode -eq 200) {
        Write-Host "Healthcheck OK" -ForegroundColor Green
    }
} catch {
    Write-Host "Healthcheck pendiente - docker compose logs backend" -ForegroundColor Yellow
}
