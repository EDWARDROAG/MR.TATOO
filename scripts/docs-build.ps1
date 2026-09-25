# Build sitio MkDocs → frontend/public/docs (HU-065)
# Uso (raíz CoreX): .\scripts\docs-build.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

$venvPython = Join-Path $Root ".venv-docs\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
  Write-Host "Creando .venv-docs ..."
  python -m venv .venv-docs
  & $venvPython -m pip install -U pip
  & $venvPython -m pip install -r requirements-docs.txt
}

Write-Host "mkdocs build → frontend/public/docs"
& $venvPython -m mkdocs build --clean
Write-Host "OK. Con frontend en dev/preview: http://localhost:5506/docs/"
