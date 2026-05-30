import { Hono } from "hono";
import type { ApiResponse } from "@devclawworker/shared";
import { verifyJwt } from "../lib/jwt";
import { AppError } from "../middleware/error";
import type { Env } from "../types";

const upload = new Hono<Env>();

function parseVersion(v: string): number[] {
  return v.split(".").map(Number);
}

function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

// 清理 R2 中比 keepVersion 更老的安装包
async function cleanupOldVersions(r2: R2Bucket, keepVersion: string) {
  const listed = await r2.list({ prefix: "DevClawWorker-" });
  const toDelete: string[] = [];

  for (const obj of listed.objects) {
    const match = obj.key.match(/^DevClawWorker-([^-]+)-/);
    if (!match) continue;
    const fileVersion = match[1];
    if (compareVersions(fileVersion, keepVersion) < 0) {
      toDelete.push(obj.key);
    }
  }

  if (toDelete.length > 0) {
    await r2.delete(toDelete);
  }

  return toDelete;
}

// 上传安装包到 R2（需要管理员权限或 CI Token）
upload.post("/:platform", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }
  const token = authHeader.slice(7);

  const ciToken = c.env.CI_UPLOAD_TOKEN;
  if (ciToken && token === ciToken) {
    // CI token 匹配，放行
  } else {
    const jwtSecret = c.env.JWT_SECRET;
    const payload = await verifyJwt(token, jwtSecret);
    if (!payload || payload.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }
  }

  const platform = c.req.param("platform");
  const version = c.req.query("version") || "1.0.0";

  if (platform !== "windows" && platform !== "macos") {
    return c.json<ApiResponse>({ success: false, error: "Invalid platform. Use 'windows' or 'macos'." }, 400);
  }

  const body = await c.req.arrayBuffer();
  if (!body || body.byteLength === 0) {
    return c.json<ApiResponse>({ success: false, error: "Empty file" }, 400);
  }

  const ext = platform === "windows" ? "zip" : "dmg";
  const arch = platform === "windows" ? "win-x64" : "mac-arm64";
  const filename = `DevClawWorker-${version}-${arch}.${ext}`;

  const r2: R2Bucket = c.env.R2;

  // 读取当前版本，用于后续清理
  let previousVersion: string | null = null;
  const latestObj = await r2.get("latest-version");
  if (latestObj) {
    previousVersion = (await latestObj.text()).trim();
  }

  await r2.put(filename, body, {
    httpMetadata: {
      contentType: platform === "windows"
        ? "application/zip"
        : "application/x-apple-diskimage",
    },
  });

  // 更新 latest-version 指针
  await r2.put("latest-version", version);

  // 保留上一个版本，清理更老的版本
  const deleted: string[] = [];
  if (previousVersion && compareVersions(previousVersion, version) < 0) {
    const cleaned = await cleanupOldVersions(r2, previousVersion);
    deleted.push(...cleaned);
  }

  return c.json<ApiResponse>({
    success: true,
    data: { filename, size: body.byteLength, deletedOldVersions: deleted },
    message: "File uploaded successfully",
  });
});

export { upload };
