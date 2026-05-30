# DevClawWorker

[English](./README.md)

基于 Cloudflare 构建的软件许可证管理与分发平台。

## 技术栈

- **前端**：Next.js 15、TypeScript、TailwindCSS、shadcn/ui
- **后端**：Cloudflare Workers、Hono
- **数据库**：Cloudflare D1 (SQLite)
- **存储**：Cloudflare R2
- **认证**：JWT (HMAC-SHA256)

## 项目结构

```
DevClawWorker/
├── apps/
│   ├── web/          # Next.js 前端
│   └── worker/       # Cloudflare Worker API
├── packages/
│   ├── shared/       # 共享类型、Schema、常量
│   └── ui/           # 共享 UI 工具
├── scripts/          # 初始化脚本
└── .github/          # CI/CD
```

## 快速开始

### 前置条件

- Node.js 18+
- pnpm 9+
- Cloudflare 账号（用于部署）

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建共享包

```bash
pnpm build:shared
```

### 3. 初始化本地数据库

```bash
cd apps/worker
npx wrangler d1 create devclawworker-db --local
npx wrangler d1 migrations apply devclawworker-db --local
```

### 4. 配置环境变量

复制示例配置文件：

```bash
cp apps/worker/.dev.vars.example apps/worker/.dev.vars
cp apps/web/.env.local.example apps/web/.env.local
```

编辑 `apps/worker/.dev.vars`，填入 JWT 密钥和管理员凭据。

### 5. 启动开发环境

终端 1 — Worker API：
```bash
pnpm dev:worker
```

终端 2 — Web 前端：
```bash
pnpm dev
```

- 前端：http://localhost:3000
- API：http://localhost:8787

### 6. 创建管理员用户

```bash
curl -X POST http://localhost:8787/api/setup \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

## API 接口

### 公开接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/login` | 管理员登录 |
| `POST` | `/api/logout` | 登出 |
| `POST` | `/api/verify-key` | 验证/激活许可证密钥 |
| `GET` | `/api/downloads/info` | 获取下载信息 |
| `GET` | `/api/downloads/:platform` | 下载安装包 |

### 受保护接口（需要认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/me` | 获取当前用户信息 |
| `GET` | `/api/keys` | 列出密钥（分页） |
| `POST` | `/api/keys/generate` | 批量生成密钥 |
| `GET` | `/api/keys/:id` | 获取密钥详情及激活日志 |
| `PATCH` | `/api/keys/:id` | 更新密钥状态 |
| `DELETE` | `/api/keys/:id` | 删除密钥 |
| `POST` | `/api/keys/:id/reset-device` | 重置设备绑定 |
| `GET` | `/api/dashboard/stats` | 仪表盘统计数据 |

### 密钥验证（客户端集成）

```bash
curl -X POST https://your-api.workers.dev/api/verify-key \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "CCS-XXXX-XXXX-XXXX",
    "deviceId": "machine-unique-id"
  }'
```

响应：
```json
{
  "success": true,
  "message": "Activated"
}
```

## 部署

### Cloudflare 配置

1. 创建 D1 数据库：
```bash
npx wrangler d1 create devclawworker-db
```

2. 创建 R2 存储桶：
```bash
npx wrangler r2 bucket create devclawworker-files
```

3. 在 `wrangler.toml` 中填入数据库 ID。

4. 设置密钥：
```bash
cd apps/worker
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD
```

5. 执行数据库迁移：
```bash
npx wrangler d1 migrations apply devclawworker-db --remote
```

6. 部署：
```bash
pnpm deploy
```

### GitHub Actions

设置仓库 Secrets：
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

设置仓库 Variables：
- `NEXT_PUBLIC_API_URL` — Worker URL（如 `https://api.your-domain.com`）

### 上传安装包

将 `.zip` 和 `.dmg` 文件上传到 R2：

```bash
# 通过 API（需认证）
curl -X POST https://your-api.workers.dev/api/upload/windows?version=1.0.0 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --data-binary @installer.zip

# 或通过 Wrangler
npx wrangler r2 object put devclawworker-files/DevClawWorker-1.0.0-win-x64.zip --file=installer.zip
npx wrangler r2 object put devclawworker-files/DevClawWorker-1.0.0-mac-arm64.dmg --file=installer.dmg
```

## 许可证密钥格式

```
CCS-XXXX-XXXX-XXXX
```

- 前缀：`CCS`
- 3 段，每段 4 位字母数字（A-Z、0-9）
- 示例：`CCS-A1B2-C3D4-E5F6`

## 密钥生命周期

1. **已生成** — 密钥已创建，未绑定设备
2. **已激活** — 密钥有效，可选绑定设备
3. **已禁用** — 管理员手动禁用
4. **已过期** — 超过有效期

设备绑定在首次激活时完成，后续激活必须使用相同的设备 ID。
