#!/bin/bash
# DevClawWorker — One-click deploy script
set -e

echo "=== DevClawWorker Deploy ==="
echo ""

# Check wrangler auth
if ! npx wrangler whoami > /dev/null 2>&1; then
  echo "Please login first: wrangler login"
  exit 1
fi

# Build shared packages
echo "[1/5] Building shared packages..."
pnpm build:shared

# Deploy Worker
echo "[2/5] Deploying Worker API..."
pnpm deploy:worker
WORKER_URL=$(npx wrangler deployments list --name devclawworker-api 2>/dev/null | head -2 | tail -1 | awk '{print $NF}' || echo "")
if [ -z "$WORKER_URL" ]; then
  echo "  Enter your Worker URL (e.g. https://devclawworker-api.xxx.workers.dev):"
  read -r WORKER_URL
fi
echo "  Worker URL: $WORKER_URL"

# Build frontend
echo "[3/5] Building frontend..."
NEXT_PUBLIC_API_URL="$WORKER_URL" pnpm build

# Deploy to Pages
echo "[4/5] Deploying to Cloudflare Pages..."
npx wrangler pages deploy apps/web/out --project-name=devclawworker-web

# Update CORS
echo "[5/5] Done!"
echo ""
echo "=== Deploy Complete ==="
echo "Worker:  $WORKER_URL"
echo "Web:     https://devclawworker-web.pages.dev"
echo ""
echo "Next steps:"
echo "  1. Create admin: curl -X POST $WORKER_URL/api/setup -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"YOUR_PASSWORD\"}'"
echo "  2. Update CORS in wrangler.toml to your actual Pages domain"
echo "  3. Upload installers to R2 via the admin dashboard"
