# Aplica migraciones 002 + 003 en PostgreSQL LOCAL (Windows, sin Docker)
# Uso (desde raÃ­z MR. TATOO):
#   powershell -ExecutionPolicy Bypass -File scripts/migrate-local.ps1
#
# Requiere: psql en PATH o PostgreSQL en Program Files; backend/.env con DB_*

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Find-Psql {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    foreach ($v in 18, 17, 16, 15, 14) {
        $path = "C:\Program Files\PostgreSQL\$v\bin\psql.exe"
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Read-DotEnv($filePath) {
    $map = @{}
    if (-not (Test-Path $filePath)) { return $map }
    foreach ($line in Get-Content $filePath) {
        if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
        $parts = $line.Split('=', 2)
        $map[$parts[0].Trim()] = $parts[1].Trim()
    }
    return $map
}

$psql = Find-Psql
if (-not $psql) {
    Write-Host "psql no encontrado. Instala PostgreSQL o agrega bin al PATH." -ForegroundColor Red
    exit 1
}

$envMap = Read-DotEnv (Join-Path $root "backend\.env")
$hostName = if ($envMap['DB_HOST']) { $envMap['DB_HOST'] } else { 'localhost' }
$port = if ($envMap['DB_PORT']) { $envMap['DB_PORT'] } else { '5432' }
$db = if ($envMap['DB_NAME']) { $envMap['DB_NAME'] } else { 'mr_tatoo_db' }
$user = if ($envMap['DB_USER']) { $envMap['DB_USER'] } else { 'mr_tatoo_user' }
$env:PGPASSWORD = $envMap['DB_PASSWORD']

$migrations = @(
    'database\migrations\002-productos-v2.sql',
    'database\migrations\003-subcategorias.sql',
    'database\migrations\004-module-settings.sql',
    'database\migrations\005-equipment-docs.sql',
    'database\migrations\006-super-admin-role.sql',
    'database\migrations\007-reception-complement.sql'
)

foreach ($file in $migrations) {
    $full = Join-Path $root $file
    if (-not (Test-Path $full)) {
        Write-Warning "No encontrado: $file"
        continue
    }
    Write-Host "Aplicando $file ..." -ForegroundColor Cyan
    & $psql -h $hostName -p $port -U $user -d $db -f $full
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Migraciones locales OK. Tabla subcategories debe existir." -ForegroundColor Green
