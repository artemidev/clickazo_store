#!/bin/sh
set -e

cd /server/apps/storefront

if [ "$NODE_ENV" = "production" ]; then
  echo "Starting Next.js production server..."
  pnpm start
else
  echo "Starting Next.js development server..."
  pnpm dev
fi
