
#!/bin/sh
set -e

echo "Running database migrations..."
cd /server/apps/backend/.medusa/server
pnpm run predeploy

echo "Starting Medusa production server..."
pnpm run start
