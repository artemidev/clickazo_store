#!/bin/sh
# Production entrypoint for the Medusa backend.
# Runs from /app (the installed `medusa build` output) inside backend.Dockerfile.
set -e

# echo "Running database migrations..."
# pnpm run predeploy

echo "Starting Medusa server..."
pnpm run start
