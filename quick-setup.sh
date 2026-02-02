#!/bin/bash
# Quick setup script that logs to a file

LOG_FILE="setup.log"
cd /Users/macboookpro/Documents/Projects/WANDURA

echo "Starting setup at $(date)" > $LOG_FILE

# Start PostgreSQL if not running
echo "Checking Docker..." >> $LOG_FILE
docker ps -a >> $LOG_FILE 2>&1

if ! docker ps | grep -q wandura-postgres; then
    echo "Starting PostgreSQL container..." >> $LOG_FILE
    docker run -d --name wandura-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=wandura -p 5432:5432 postgres:16-alpine >> $LOG_FILE 2>&1
    sleep 10
fi

# Push schema
echo "Pushing database schema..." >> $LOG_FILE
npx prisma db push --skip-generate >> $LOG_FILE 2>&1

# Seed database
echo "Seeding database..." >> $LOG_FILE
npm run prisma:seed >> $LOG_FILE 2>&1

echo "Setup completed at $(date)" >> $LOG_FILE
echo "Check setup.log for details"
cat $LOG_FILE
