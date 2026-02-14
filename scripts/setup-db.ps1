# Drizzle ORM Setup Script for PostgreSQL (Windows PowerShell)
# This script automates the entire database setup process

param(
    [string]$PostgreSQLPath = "C:\Program Files\PostgreSQL\17\bin",
    [string]$DbName = "capgemini_db",
    [string]$DbUser = "capgemini_user",
    [string]$DbPassword = "capgemini_secure_password_2024",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432"
)

function Write-Section {
    param([string]$Message)
    Write-Host ""
    Write-Host "[*] $Message" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "[i] $Message" -ForegroundColor White
}

# Main setup
Write-Host ""
Write-Host "=== Drizzle ORM PostgreSQL Setup ===" -ForegroundColor Green
Write-Host ""

# Check if psql exists
Write-Section "Checking PostgreSQL Installation"

$psqlPath = Join-Path $PostgreSQLPath "psql.exe"
if (-not (Test-Path $psqlPath)) {
    Write-ErrorMsg "psql not found at: $psqlPath"
    Write-Info "Please ensure PostgreSQL is installed at: $PostgreSQLPath"
    Write-Info "Or provide the correct path using: -PostgreSQLPath 'C:\Your\PostgreSQL\Path\bin'"
    exit 1
}

Write-Success "PostgreSQL found at: $psqlPath"

# Get PostgreSQL version
$version = & $psqlPath -V
Write-Success "Version: $version"

# Create .env.local
Write-Section "Creating Environment Configuration"

$envContent = "DATABASE_URL=postgresql://$DbUser`:$DbPassword@$DbHost`:$DbPort/$DbName`nGITHUB_CLIENT_ID=`nGITHUB_CLIENT_SECRET=`nGOOGLE_CLIENT_ID=`nGOOGLE_CLIENT_SECRET=`nNEXT_PUBLIC_APP_URL=http://localhost:3000"

$envPath = ".env.local"
if (Test-Path $envPath) {
    Write-Info ".env.local already exists"
    if (-not (Select-String -Path $envPath -Pattern "DATABASE_URL" -Quiet)) {
        Add-Content -Path $envPath -Value "`n$envContent"
        Write-Success "Added DATABASE_URL to existing .env.local"
    }
} else {
    Set-Content -Path $envPath -Value $envContent
    Write-Success "Created .env.local"
}

# Setup PostgreSQL Database
Write-Section "Setting Up PostgreSQL Database"

# Use environment variable for postgres password (you may need to set this)
$env:PGPASSWORD = ""  # Leave empty if postgres user has no password or uses trust auth

Write-Info "Attempting to create database '$DbName'..."
try {
    & $psqlPath -U postgres -c "CREATE DATABASE `"$DbName`";" 2>&1 | Out-Null
    Write-Success "Database '$DbName' ready (created or already exists)"
} catch {
    Write-Info "Database creation info: $_"
}

Write-Info "Attempting to create user '$DbUser'..."
try {
    & $psqlPath -U postgres -c "CREATE USER `"$DbUser`" WITH PASSWORD '$DbPassword' CREATEDB;" 2>&1 | Out-Null
    Write-Success "User '$DbUser' ready (created or already exists)"
} catch {
    Write-Info "User creation info: $_"
}

Write-Info "Granting privileges..."
try {
    & $psqlPath -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE `"$DbName`" TO `"$DbUser`";" 2>&1 | Out-Null
    & $psqlPath -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON SCHEMA public TO `"$DbUser`";" 2>&1 | Out-Null
    & $psqlPath -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO `"$DbUser`";" 2>&1 | Out-Null
    & $psqlPath -U postgres -d $DbName -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO `"$DbUser`";" 2>&1 | Out-Null
    Write-Success "All privileges granted successfully"
} catch {
    Write-ErrorMsg "Error granting privileges: $_"
}

# Generate and run migrations
Write-Section "Setting Up Database Schema"

Write-Info "Generating migrations..."
try {
    $output = & bun run db:generate 2>&1
    Write-Success "Migrations generated"
} catch {
    Write-Error "Error generating migrations: $($_.Exception.Message)"
}

Write-Info "Running migrations..."
try {
    $output = & bun run db:migrate 2>&1
    Write-Success "Migrations applied successfully"
} catch {
    Write-Error "Error running migrations: $($_.Exception.Message)"
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "Database Information:" -ForegroundColor Cyan
Write-Host "  Host:     $DbHost"
Write-Host "  Port:     $DbPort"
Write-Host "  Database: $DbName"
Write-Host "  User:     $DbUser"
Write-Host "  Password: $DbPassword"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Verify .env.local was created"
Write-Host "  2. Run: bun run db:studio  (to view your database)"
Write-Host "  3. Run: bun run dev        (to start development)"
Write-Host ""

Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "  - bun run db:studio       Open database UI"
Write-Host "  - bun run db:generate     Generate new migrations"
Write-Host "  - bun run db:migrate      Run pending migrations"
Write-Host "  - bun run dev             Start development server"
Write-Host "  - bun run build           Build for production"
Write-Host ""

Write-Host "Database Files:" -ForegroundColor Cyan
Write-Host "  - db/config.ts            Database connection config"
Write-Host "  - db/schema/users.ts      Users table schema"
Write-Host "  - db/schema/posts.ts      Posts table schema"
Write-Host "  - db/utils.ts             Database utility functions"
Write-Host ""

Write-Host "All set! Happy coding!" -ForegroundColor Green
