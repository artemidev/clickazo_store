#!/bin/sh
# Development entrypoint for the Next.js storefront (used by docker-compose).
set -e

cd /server/apps/storefront

echo "Starting Next.js development server..."
pnpm dev
