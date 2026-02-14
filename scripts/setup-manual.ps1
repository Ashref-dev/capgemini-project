# Manual PostgreSQL Setup Script - Only prompts for postgres password once
param(
    [string]$PostgreSQLPath = "C:\Program Files\PostgreSQL\17\bin",
    [string]$PostgresPassword = ""
)

$psqlPath = Join-Path $PostgreSQLPath "psql.exe"

# Prompt for postgres password if not provided
if ([string]::IsNullOrEmpty($PostgresPassword)) {
    Write-Host ""
    Write-Host "=== PostgreSQL Setup ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please enter your PostgreSQL 'postgres' superuser password:" -ForegroundColor Yellow
    $securePassword = Read-Host -AsSecureString "Password"
    $PostgresPassword = [System.Net.NetworkCredential]::new("", $securePassword).Password
    Write-Host ""
}

# Verify PostgreSQL
if (-not (Test-Path $psqlPath)) {
    Write-Host "[ERROR] PostgreSQL not found at: $psqlPath" -ForegroundColor Red
    exit 1
}

$env:PGPASSWORD = $PostgresPassword

Write-Host "[OK] Creating database and user..." -ForegroundColor Green

# Create database
& $psqlPath -U postgres -h localhost -c "CREATE DATABASE capgemini_db;" 2>&1 | Out-Null

# Create user
& $psqlPath -U postgres -h localhost -c "CREATE USER capgemini_user WITH PASSWORD 'capgemini_secure_password_2024' CREATEDB;" 2>&1 | Out-Null

# Grant privileges
& $psqlPath -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE capgemini_db TO capgemini_user;" 2>&1 | Out-Null
& $psqlPath -U postgres -d capgemini_db -h localhost -c "GRANT ALL PRIVILEGES ON SCHEMA public TO capgemini_user;" 2>&1 | Out-Null
& $psqlPath -U postgres -d capgemini_db -h localhost -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO capgemini_user;" 2>&1 | Out-Null
& $psqlPath -U postgres -d capgemini_db -h localhost -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO capgemini_user;" 2>&1 | Out-Null

$env:PGPASSWORD = ""

Write-Host ""
Write-Host "[OK] Database created successfully!" -ForegroundColor Green
Write-Host ""

# Run migrations
Write-Host "[*] Generating and running migrations..." -ForegroundColor Cyan
bun run db:generate
bun run db:migrate

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: bun run db:studio    (view database)" -ForegroundColor Cyan
Write-Host "Next: bun run dev          (start dev server)" -ForegroundColor Cyan
Write-Host ""
