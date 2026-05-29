#!/bin/bash
# DevClawWorker — Database Setup Script

set -e

echo "=== DevClawWorker Database Setup ==="
echo ""

# Create D1 database
echo "Creating D1 database..."
DB_OUTPUT=$(npx wrangler d1 create devclawworker-db 2>&1)
echo "$DB_OUTPUT"

# Extract database ID
DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || true)
if [ -z "$DB_ID" ]; then
  echo "Could not extract database ID. Please check wrangler output and update wrangler.toml manually."
else
  echo ""
  echo "Database created! Update wrangler.toml with:"
  echo "  database_id = \"$DB_ID\""
fi

echo ""
echo "Running migrations..."
npx wrangler d1 migrations apply devclawworker-db --local
echo ""
echo "Local database ready!"
echo ""
echo "For remote database, run:"
echo "  npx wrangler d1 migrations apply devclawworker-db --remote"
