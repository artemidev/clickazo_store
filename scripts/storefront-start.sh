#!/bin/sh
# Production entrypoint for the Next.js storefront.
# Runs the standalone server from /app inside storefront.Dockerfile.
set -e

echo "Starting Next.js server on :${PORT:-8000}..."
exec node apps/storefront/server.js
