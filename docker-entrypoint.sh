#!/bin/sh
set -e

# Fetch fresh data on startup
echo "Fetching initial data..."
cd /app && python3 fetch-all.py || echo "Warning: initial data fetch failed"

# Start cron daemon
cron

# Start nginx in foreground
exec nginx -g "daemon off;"
