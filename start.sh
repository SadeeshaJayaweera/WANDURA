#!/bin/bash

# Wandura - Complete Setup and Start Script
# This script will set up the database and start the application

set -e

echo "🚀 Wandura - Starting Setup..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if Docker is running
echo ""
print_info "Checking Docker..."
if ! docker ps &> /dev/null; then
    print_warning "Docker is not running or not installed"
    print_info "Please start Docker Desktop or install PostgreSQL manually"
    print_info "See SETUP_GUIDE.md for instructions"
    exit 1
fi
print_success "Docker is running"

# Check if PostgreSQL container exists
echo ""
print_info "Checking PostgreSQL container..."
if docker ps -a | grep -q wandura-postgres; then
    if docker ps | grep -q wandura-postgres; then
        print_success "PostgreSQL container is already running"
    else
        print_info "Starting existing PostgreSQL container..."
        docker start wandura-postgres
        sleep 3
        print_success "PostgreSQL container started"
    fi
else
    print_info "Creating new PostgreSQL container..."
    docker run -d \
        --name wandura-postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=wandura \
        -p 5432:5432 \
        postgres:16-alpine

    print_info "Waiting for PostgreSQL to be ready..."
    sleep 10
    print_success "PostgreSQL container created and started"
fi

# Generate Prisma Client
echo ""
print_info "Generating Prisma Client..."
npx prisma generate
print_success "Prisma Client generated"

# Push database schema
echo ""
print_info "Setting up database schema..."
npx prisma db push --accept-data-loss
print_success "Database schema created"

# Check if database has data
echo ""
print_info "Checking if database needs seeding..."
HAS_DATA=$(docker exec wandura-postgres psql -U postgres -d wandura -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null || echo "0")
HAS_DATA=$(echo $HAS_DATA | tr -d '[:space:]')

if [ "$HAS_DATA" = "0" ] || [ -z "$HAS_DATA" ]; then
    print_info "Seeding database with sample data..."
    npm run prisma:seed
    print_success "Database seeded successfully"

    echo ""
    print_success "Sample login credentials:"
    echo "  👤 Admin: admin@wandura.com / password123"
    echo "  👤 Customer: john.doe@example.com / password123"
    echo "  👤 Worker: mike.mason@example.com / password123"
    echo "  👤 Hardware Store: contact@buildersmart.com / password123"
else
    print_success "Database already contains data"
fi

echo ""
echo "================================"
print_success "Setup completed successfully!"
echo ""
print_info "Starting development server..."
echo ""
echo "🌐 Application will be available at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start the development server
npm run dev
