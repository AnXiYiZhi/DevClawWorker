import { Hono } from "hono";
import { type ApiResponse, type Platform } from "@devclawworker/shared";
import { createDb } from "../db";
import { downloads } from "../db/schema";
import { AppError } from "../middleware/error";
import { rateLimit } from "../middleware/rateLimit";
import type { Env } from "../types";

const downloadRoutes = new Hono<Env>();

const EXT: Record<Platform, string> = {
  windows: "zip",
  macos: "dmg",
};

async function getLatestVersion(r2: R2Bucket): Promise<string> {
  const obj = await r2.get("latest-version");
  if (!obj) throw new AppError("No release available yet", 404);
  return (await obj.text()).trim();
}

function buildFilename(platform: Platform, version: string): string {
  const arch = platform === "windows" ? "win-x64" : "mac-arm64";
  return `DevClawWorker-${version}-${arch}.${EXT[platform]}`;
}

// 获取下载信息
downloadRoutes.get("/info", async (c) => {
  const r2: R2Bucket = c.env.R2;
  const version = await getLatestVersion(r2);

  return c.json<ApiResponse>({
    success: true,
    data: {
      version,
      platforms: {
        windows: { filename: buildFilename("windows", version), available: true },
        macos: { filename: buildFilename("macos", version), available: true },
      },
    },
  });
});

// 从 R2 下载文件
downloadRoutes.get("/:platform", rateLimit(10, 60), async (c) => {
  const platform = c.req.param("platform") as Platform;

  if (!EXT[platform]) {
    throw new AppError("Invalid platform", 400);
  }

  const r2: R2Bucket = c.env.R2;
  const version = await getLatestVersion(r2);
  const filename = buildFilename(platform, version);

  const object = await r2.get(filename);
  if (!object) {
    throw new AppError("File not found. Please upload the installer first.", 404);
  }

  // 记录下载
  const db = createDb(c.env.DB);
  const ip = c.req.header("CF-Connecting-IP") || null;
  const userAgent = c.req.header("User-Agent") || null;

  await db.insert(downloads).values({
    platform,
    version,
    ip,
    userAgent,
  });

  c.header("Content-Type", platform === "windows" ? "application/zip" : "application/x-apple-diskimage");
  c.header("Content-Disposition", `attachment; filename="${filename}"`);
  c.header("Cache-Control", "no-store");

  return c.body(object.body);
});

// 下载统计
downloadRoutes.get("/stats/summary", async (c) => {
  const db = createDb(c.env.DB);

  const total = await db.select({ count: downloads.id }).from(downloads);

  return c.json<ApiResponse>({
    success: true,
    data: {
      total: total.length,
    },
  });
});

export { downloadRoutes };
