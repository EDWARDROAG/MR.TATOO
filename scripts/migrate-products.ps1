# Aplica migraciones de productos v2 y subcategorÃ­as en PostgreSQL (Docker LAN)
param(
    [string[]]$ComposeFiles = @(
        '--env-file', 'backend/.env.lan',
        '-f', 'docker-compose.yml',
        '-f', 'docker-compose.lan.yml'
    )
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$migrations = @(
    'database/migrations/002-productos-v2.sql',
    'database/migrations/003-subcategorias.sql'
)

foreach ($file in $migrations) {
    if (-not (Test-Path $file)) {
        Write-Warning "No encontrado: $file"
        continue
    }
    Write-Host "Aplicando $file ..."
    Get-Content $file -Raw | docker compose @ComposeFiles exec -T postgres psql -U mr_tatoo_user -d mr_tatoo_db
}

Write-Host "Listo."
