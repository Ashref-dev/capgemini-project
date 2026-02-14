#!/bin/bash

# Drizzle ORM Setup Script for PostgreSQL
# This script automates the entire database setup process

set -e

echo "🚀 Drizzle ORM PostgreSQL Setup"
echo "=================================="
echo ""

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="capgemini_db"
DB_USER="capgemini_user"
DB_PASSWORD="capgemini_secure_password_2024"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${BLUE}Step 1: Checking PostgreSQL installation...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed or psql is not in PATH${NC}"
    exit 1
fi

POSTGRES_VERSION=$(psql --version)
echo -e "${GREEN}✓ Found: $POSTGRES_VERSION${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating database and user...${NC}"

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << EOF
# Database Configuration (Drizzle ORM)
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

# Better Auth Configuration
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (optional - if using email features)
# RESEND_API_KEY=
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
else
    echo -e "${YELLOW}✓ .env.local already exists${NC}"
    
    # Update DATABASE_URL if not already set
    if ! grep -q "DATABASE_URL" .env.local; then
        echo "" >> .env.local
        echo "# Database Configuration (Drizzle ORM)" >> .env.local
        echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}" >> .env.local
        echo -e "${GREEN}✓ Added DATABASE_URL to .env.local${NC}"
    fi
fi

echo ""

# Check if database already exists
echo -e "${BLUE}Step 3: Setting up PostgreSQL database...${NC}"

DB_EXISTS=$(psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" 2>/dev/null || echo "")

if [ "$DB_EXISTS" = "" ]; then
    echo -e "${YELLOW}Creating database '${DB_NAME}'...${NC}"
    psql -U postgres -c "CREATE DATABASE \"${DB_NAME}\";" 2>/dev/null || true
    echo -e "${GREEN}✓ Database created${NC}"
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi

echo ""

# Check if user exists
USER_EXISTS=$(psql -U postgres -tc "SELECT 1 FROM pg_user WHERE usename = '${DB_USER}'" 2>/dev/null || echo "")

if [ "$USER_EXISTS" = "" ]; then
    echo -e "${YELLOW}Creating database user '${DB_USER}'...${NC}"
    psql -U postgres -c "CREATE USER \"${DB_USER}\" WITH PASSWORD '${DB_PASSWORD}' CREATEDB;" 2>/dev/null || true
    echo -e "${GREEN}✓ User created${NC}"
else
    echo -e "${GREEN}✓ User already exists${NC}"
fi

echo ""

# Grant privileges
echo -e "${YELLOW}Granting privileges...${NC}"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"${DB_NAME}\" TO \"${DB_USER}\";" 2>/dev/null || true
psql -U postgres -d "${DB_NAME}" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO \"${DB_USER}\";" 2>/dev/null || true
psql -U postgres -d "${DB_NAME}" -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"${DB_USER}\";" 2>/dev/null || true
psql -U postgres -d "${DB_NAME}" -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"${DB_USER}\";" 2>/dev/null || true
echo -e "${GREEN}✓ Privileges granted${NC}"

echo ""
echo -e "${BLUE}Step 4: Generating migrations...${NC}"
bun run db:generate
echo -e "${GREEN}✓ Migrations generated${NC}"

echo ""
echo -e "${BLUE}Step 5: Running migrations...${NC}"
bun run db:migrate
echo -e "${GREEN}✓ Migrations applied${NC}"

echo ""
echo -e "${GREEN}=================================="
echo "✓ Setup Complete!"
echo "==================================${NC}"
echo ""
echo -e "${YELLOW}Database Information:${NC}"
echo "  Host: ${DB_HOST}"
echo "  Port: ${DB_PORT}"
echo "  Database: ${DB_NAME}"
echo "  User: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Verify .env.local was created"
echo "  2. Run 'bun run db:studio' to view your database"
echo "  3. Start development: 'bun run dev'"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  bun run db:studio    - Open database UI"
echo "  bun run db:generate  - Generate new migrations"
echo "  bun run db:migrate   - Run pending migrations"
echo "  bun run dev          - Start development server"
echo ""
