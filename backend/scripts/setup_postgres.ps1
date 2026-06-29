# Run from project root in PowerShell:
#   .\backend\scripts\setup_postgres.ps1
#
# Creates the pixelforge user and database to match .env defaults.

$ErrorActionPreference = "Stop"

$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
if (-not (Test-Path $psql)) {
    $found = Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "psql.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
    if ($found) { $psql = $found } else { throw "psql.exe not found. Install PostgreSQL first." }
}

$sqlFile = Join-Path $PSScriptRoot "setup_postgres.sql"

Write-Host "Enter the password for PostgreSQL superuser 'postgres':" -ForegroundColor Cyan
$secure = Read-Host -AsSecureString
$plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
)
$env:PGPASSWORD = $plain

& $psql -U postgres -h localhost -d postgres -v ON_ERROR_STOP=1 -f $sqlFile

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Done. Verify with:" -ForegroundColor Green
Write-Host "  cd backend" -ForegroundColor Gray
Write-Host "  alembic upgrade head" -ForegroundColor Gray
