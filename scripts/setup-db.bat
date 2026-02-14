@echo off
REM Drizzle ORM Setup Script for PostgreSQL (Windows)
REM This script automates the entire database setup process

setlocal enabledelayedexpansion

echo.
echo 🚀 Drizzle ORM PostgreSQL Setup
echo ====================================
echo.

REM Configuration
set DB_NAME=capgemini_db
set DB_USER=capgemini_user
set DB_PASSWORD=capgemini_secure_password_2024
set DB_HOST=localhost
set DB_PORT=5432

echo [*] Step 1: Checking PostgreSQL installation...
where psql >nul 2>nul
if errorlevel 1 (
    echo [!] PostgreSQL is not installed or psql is not in PATH
    echo [!] Please install PostgreSQL and add it to your PATH
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('psql --version 2^>nul') do set POSTGRES_VERSION=%%i
echo [+] Found: %POSTGRES_VERSION%
echo.

echo [*] Step 2: Creating .env.local file...
if not exist .env.local (
    (
        echo # Database Configuration - Drizzle ORM
        echo DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%
        echo.
        echo # Better Auth Configuration
        echo GITHUB_CLIENT_ID=
        echo GITHUB_CLIENT_SECRET=
        echo GOOGLE_CLIENT_ID=
        echo GOOGLE_CLIENT_SECRET=
        echo.
        echo # App URL
        echo NEXT_PUBLIC_APP_URL=http://localhost:3000
        echo.
        echo # Email Configuration (optional - if using email features^)
        echo # RESEND_API_KEY=
    ) > .env.local
    echo [+] Created .env.local
) else (
    echo [*] .env.local already exists
    findstr /M "DATABASE_URL" .env.local >nul
    if errorlevel 1 (
        echo.
        echo # Database Configuration - Drizzle ORM >> .env.local
        echo DATABASE_URL=postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME% >> .env.local
        echo [+] Added DATABASE_URL to .env.local
    )
)
echo.

echo [*] Step 3: Setting up PostgreSQL database...

REM Create database
psql -U postgres -c "CREATE DATABASE \"%DB_NAME%\";" >nul 2>&1
if errorlevel 0 (
    echo [+] Database '%DB_NAME%' created or already exists
) else (
    echo [*] Database already existed
)
echo.

REM Create user
psql -U postgres -c "CREATE USER \"%DB_USER%\" WITH PASSWORD '%DB_PASSWORD%' CREATEDB;" >nul 2>&1
if errorlevel 0 (
    echo [+] User '%DB_USER%' created or already exists
) else (
    echo [*] User already existed
)
echo.

REM Grant privileges
echo [*] Granting privileges...
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"%DB_NAME%\" TO \"%DB_USER%\";" >nul 2>&1
psql -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON SCHEMA public TO \"%DB_USER%\";" >nul 2>&1
psql -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"%DB_USER%\";" >nul 2>&1
psql -U postgres -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"%DB_USER%\";" >nul 2>&1
echo [+] Privileges granted
echo.

echo [*] Step 4: Generating migrations...
call bun run db:generate >nul 2>&1
echo [+] Migrations generated
echo.

echo [*] Step 5: Running migrations...
call bun run db:migrate >nul 2>&1
echo [+] Migrations applied
echo.

echo ====================================
echo [+] Setup Complete!
echo ====================================
echo.

echo [INFO] Database Information:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Password: %DB_PASSWORD%
echo.

echo [INFO] Next steps:
echo   1. Verify .env.local was created
echo   2. Run "bun run db:studio" to view your database
echo   3. Start development: "bun run dev"
echo.

echo [TIPS] Useful commands:
echo   bun run db:studio    - Open database UI
echo   bun run db:generate  - Generate new migrations
echo   bun run db:migrate   - Run pending migrations
echo   bun run dev          - Start development server
echo.

pause
