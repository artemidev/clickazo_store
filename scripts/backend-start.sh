#!/bin/sh
# Production entrypoint for the Medusa backend.
# Runs from /app (the installed `medusa build` output) inside backend.Dockerfile.
#
# The same image powers both production instances; the role is set at runtime via
# MEDUSA_WORKER_MODE ("server" | "worker" | "shared"). Database migrations must run
# exactly once, so only the server/shared instance runs them — never the worker.
set -e

if [ "$MEDUSA_WORKER_MODE" = "worker" ]; then
  echo "Worker mode: skipping database migrations (handled by the server instance)."
else
  echo "Running database migrations..."
  pnpm run predeploy
fi

echo "Starting Medusa (worker mode: ${MEDUSA_WORKER_MODE:-shared})..."
pnpm run start
