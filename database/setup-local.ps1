# CoreX — Levantar base de datos PostgreSQL LOCAL (sin Docker)
# Uso: desde la raíz del proyecto
#   powershell -ExecutionPolicy Bypass -File database/setup-local.ps1
#
# Opcional: $env:POSTGRES_PASSWORD = "clave_del_usuario_postgres"

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $ProjectRoot "backend\.env"

function Find-Psql {
    $cmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    foreach ($v in 18, 17, 16, 15, 14) {
        $path = "C:\Program Files\PostgreSQL\$v\bin\psql.exe"
        if (Test-Path $path) { return $path }
    }
    return $null
}

function Read-DotEnvValue($filePath, $key) {
    if (-not (Test-Path $filePath)) { return $null }
    foreach ($line in Get-Content $filePath) {
        if ($line -match "^\s*$key\s*=\s*(.+)\s*$") {
            return $matches[1].Trim()
        }
    }
    return $null
}

$psql = Find-Psql
if (-not $psql) {
    Write-Host "PostgreSQL no encontrado. Instálalo desde https://www.postgresql.org/download/windows/" -ForegroundColor Red
    exit 1
}

$dbPassword = Read-DotEnvValue $EnvFile "DB_PASSWORD"
if (-not $dbPassword) {
    Write-Host "No se encontró DB_PASSWORD en backend\.env" -ForegroundColor Red
    exit 1
}

$postgresPassword = $env:POSTGRES_PASSWORD
if (-not $postgresPassword) {
    $secure = Read-Host "Contraseña del superusuario POSTGRES" -AsSecureString
    $postgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

$env:PGPASSWORD = $postgresPassword
Write-Host "Usando: $psql" -ForegroundColor Cyan

$sqlCreateUser = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mr_tatoo_user') THEN
    CREATE USER mr_tatoo_user WITH PASSWORD '$dbPassword';
  ELSE
    ALTER USER mr_tatoo_user WITH PASSWORD '$dbPassword';
  END IF;
END
`$`$;
"@

& $psql -U postgres -h localhost -d postgres -c $sqlCreateUser
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$dbExists = & $psql -U postgres -h localhost -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'mr_tatoo_db'"
if ($dbExists.Trim() -ne "1") {
    & $psql -U postgres -h localhost -d postgres -c "CREATE DATABASE mr_tatoo_db OWNER mr_tatoo_user"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "Base mr_tatoo_db ya existe." -ForegroundColor Yellow
}

$initSql = Join-Path $PSScriptRoot "init-mr-tatoo-postgres.sql"
$env:PGPASSWORD = $dbPassword

Write-Host "Creando tablas en mr_tatoo_db..." -ForegroundColor Cyan
& $psql -U mr_tatoo_user -h localhost -d mr_tatoo_db -f $initSql
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Base de datos local lista." -ForegroundColor Green
Write-Host "Siguiente:" -ForegroundColor Cyan
Write-Host "  cd backend"
Write-Host "  npm run seed"
Write-Host "  npm run dev"
Write-Host ""
