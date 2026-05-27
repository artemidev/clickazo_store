#!/bin/sh
# Production entrypoint for the Medusa backend.
# Runs from /app (the installed `medusa build` output) inside backend.Dockerfile.
set -e

echo "Running database migrations..."
npm run predeploy

echo "Starting Medusa server..."
npm run start
