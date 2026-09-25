# Sirve MkDocs en http://127.0.0.1:8000 (HU-065)
# Uso (raíz CoreX): .\scripts\docs-serve.ps1

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

Write-Host "mkdocs serve → http://127.0.0.1:8000"
& $venvPython -m mkdocs serve -a 127.0.0.1:8000
