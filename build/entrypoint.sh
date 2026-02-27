#!/bin/sh
set -e

echo "Running database migrations..."
goose -dir /app/migrations postgres "$DATABASE_URL" up

echo "Starting Dimewise server..."
exec /app/dimewise
