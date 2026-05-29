# DevClawWorker

Software license management and distribution platform built on Cloudflare.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Cloudflare Workers, Hono
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Auth**: JWT (HMAC-SHA256)

## Project Structure

```
DevClawWorker/
├── apps/
│   ├── web/          # Next.js frontend
│   └── worker/       # Cloudflare Worker API
├── packages/
│   ├── shared/       # Shared types, schemas, constants
│   └── ui/           # Shared UI utilities
├── scripts/          # Setup scripts
└── .github/          # CI/CD
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- Cloudflare account (for deployment)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Build shared packages

```bash
pnpm build:shared
```

### 3. Set up local database

```bash
cd apps/worker
npx wrangler d1 create devclawworker-db --local
npx wrangler d1 migrations apply devclawworker-db --local
```

### 4. Configure environment

Copy the example env files:

```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/worker/.dev.vars` with your JWT secret and admin credentials.

### 5. Start development

Terminal 1 — Worker API:
```bash
pnpm dev:worker
```

Terminal 2 — Web frontend:
```bash
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:8787

### 6. Create admin user

```bash
curl -X POST http://localhost:8787/api/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/login` | Admin login |
| `POST` | `/api/logout` | Logout |
| `POST` | `/api/verify-key` | Verify/activate license key |
| `GET` | `/api/downloads/info` | Get download info |
| `GET` | `/api/downloads/:platform` | Download installer |

### Protected (requires auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me` | Get current user |
| `GET` | `/api/keys` | List keys (paginated) |
| `POST` | `/api/keys/generate` | Generate new keys |
| `GET` | `/api/keys/:id` | Get key details + logs |
| `PATCH` | `/api/keys/:id` | Update key status |
| `DELETE` | `/api/keys/:id` | Delete key |
| `POST` | `/api/keys/:id/reset-device` | Reset device binding |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |

### Key Verification (client integration)

```bash
curl -X POST https://your-api.workers.dev/api/verify-key \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "CCS-XXXX-XXXX-XXXX",
    "deviceId": "machine-unique-id"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Activated"
}
```

## Deployment

### Cloudflare Setup

1. Create D1 database:
```bash
npx wrangler d1 create devclawworker-db
```

2. Create R2 bucket:
```bash
npx wrangler r2 bucket create devclawworker-files
```

3. Update `wrangler.toml` with your database ID.

4. Set secrets:
```bash
cd apps/worker
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD
```

5. Run migrations:
```bash
npx wrangler d1 migrations apply devclawworker-db --remote
```

6. Deploy:
```bash
pnpm deploy
```

### GitHub Actions

Set these repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Set these repository variables:
- `NEXT_PUBLIC_API_URL` — your Worker URL (e.g. `https://api.your-domain.com`)

### Upload Installers

Upload your `.exe` and `.dmg` files to R2:

```bash
# Via API (authenticated)
curl -X POST https://your-api.workers.dev/api/upload/windows?version=1.0.0 \
  -H "Cookie: devclaw_session=YOUR_TOKEN" \
  --data-binary @installer.exe

# Or via Wrangler
npx wrangler r2 object put devclawworker-files/DevClawWorker-1.0.0-win-x64.exe --file=installer.exe
npx wrangler r2 object put devclawworker-files/DevClawWorker-1.0.0-mac-arm64.dmg --file=installer.dmg
```

## License Key Format

```
CCS-XXXX-XXXX-XXXX
```

- Prefix: `CCS`
- 3 segments of 4 alphanumeric characters (A-Z, 0-9)
- Example: `CCS-A1B2-C3D4-E5F6`

## Key Lifecycle

1. **Generated** — Key created, no device bound
2. **Active** — Key valid, optionally bound to device
3. **Disabled** — Manually disabled by admin
4. **Expired** — Past expiration date

Device binding happens on first activation. Subsequent activations must use the same device ID.
