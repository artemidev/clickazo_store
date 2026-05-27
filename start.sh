#!/bin/sh
set -e

cd /server/apps/backend

echo "Running database migrations..."
pnpm medusa db:migrate

if [ "$NODE_ENV" = "production" ]; then
  echo "Starting Medusa production server..."
  pnpm start
else
  echo "Seeding database..."
  pnpm seed || echo "Seeding failed, continuing..."

  echo "Starting Medusa development server..."
  pnpm dev
fi
