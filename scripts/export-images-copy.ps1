# CoreX - exportar copia espejo de imagenes al Escritorio
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\export-images-copy.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\export-images-copy.ps1 -DestName "CoreX-imagenes-originales"

param(
    [string]$DestName = "CoreX-imagenes-originales",
    [string]$ProjectRoot = ""
)

$ErrorActionPreference = "Stop"

if (-not $ProjectRoot) {
    $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

$destRoot = Join-Path ([Environment]::GetFolderPath("Desktop")) $DestName
$extensions = @(".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico", ".bmp")
$excludeDirNames = @(
    "node_modules",
    ".git",
    "dist",
    "build",
    "coverage",
    ".vite",
    ".venv",
    "deploy-vitrina"
)

function Test-IsExcludedPath {
    param([string]$RelativePath)
    $parts = $RelativePath -split "[\\/]"
    foreach ($p in $parts) {
        if ($excludeDirNames -contains $p) { return $true }
    }
    return $false
}

if (Test-Path -LiteralPath $destRoot) {
    Remove-Item -LiteralPath $destRoot -Recurse -Force
}
New-Item -ItemType Directory -Path $destRoot | Out-Null

$files = Get-ChildItem -LiteralPath $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $ext = $_.Extension.ToLower()
    if ($extensions -notcontains $ext) { return $false }
    $rel = $_.FullName.Substring($ProjectRoot.Length + 1)
    if (Test-IsExcludedPath $rel) { return $false }
    return $true
}

$manifest = @()
$totalBytes = [long]0

foreach ($f in $files) {
    $rel = $f.FullName.Substring($ProjectRoot.Length + 1)
    $target = Join-Path $destRoot $rel
    $targetDir = Split-Path $target -Parent
    if (-not (Test-Path -LiteralPath $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $f.FullName -Destination $target -Force
    $totalBytes += $f.Length
    $manifest += [PSCustomObject]@{
        ruta_relativa_proyecto = $rel.Replace("\", "/")
        nombre_archivo         = $f.Name
        extension              = $f.Extension.ToLower()
        bytes                  = $f.Length
        carpeta_destino_copia  = $rel.Replace("\", "/")
    }
}

$manifestPath = Join-Path $destRoot "INVENTARIO.csv"
$manifest | Sort-Object ruta_relativa_proyecto | Export-Csv -LiteralPath $manifestPath -NoTypeInformation -Encoding UTF8

$byTopLines = New-Object System.Collections.Generic.List[string]
$manifest | Group-Object { ($_.ruta_relativa_proyecto -split "/")[0] } | Sort-Object Name | ForEach-Object {
    [void]$byTopLines.Add(("- {0}/ - {1} archivo(s)" -f $_.Name, $_.Count))
}

$sizeMb = [math]::Round($totalBytes / 1MB, 2)
$generatedAt = Get-Date -Format "yyyy-MM-dd HH:mm"

$readmeLines = @(
    "# CoreX - copia de imagenes para optimizar",
    "",
    "Generado: $generatedAt",
    "Proyecto: $ProjectRoot",
    "",
    "## Que contiene esta carpeta",
    "Copia espejo de todas las imagenes del repo (excepto node_modules, .git, dist, build, coverage, .vite, .venv).",
    "",
    "## Como devolverlas",
    "1. Sustituye cada archivo en la **misma ruta relativa** dentro de esta carpeta.",
    "2. Mantener el **mismo nombre base** (puedes cambiar extension si conviertes a WebP/JPG).",
    "3. Avisame y yo las vuelvo a colocar en el proyecto segun INVENTARIO.csv.",
    "4. Si cambias extension (ej. .png a .webp), hay que actualizar referencias en codigo (imports Vite, CSS, HTML) y rutas publicas.",
    "",
    "## Archivos",
    "Total: $($manifest.Count) imagenes",
    "Tamano total: $sizeMb MB",
    "",
    "## Carpetas principales"
)
$readmeLines += $byTopLines
$readmeLines += @(
    "",
    "## Regenerar esta copia",
    "Desde la raiz de CoreX:",
    "  powershell -ExecutionPolicy Bypass -File scripts\export-images-copy.ps1"
)

$readmePath = Join-Path $destRoot "LEEME.md"
[System.IO.File]::WriteAllLines($readmePath, $readmeLines, [System.Text.UTF8Encoding]::new($false))

Write-Output "PROJECT=$ProjectRoot"
Write-Output "DEST=$destRoot"
Write-Output "COUNT=$($manifest.Count)"
Write-Output "SIZE_MB=$sizeMb"
Write-Output "---"
$manifest | Group-Object { ($_.ruta_relativa_proyecto -split "/")[0] } | Sort-Object Name | ForEach-Object {
    Write-Output ("{0}: {1}" -f $_.Name, $_.Count)
}