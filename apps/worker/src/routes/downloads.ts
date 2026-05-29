import { Hono } from "hono";
import { type ApiResponse, type Platform } from "@devclawworker/shared";
import { createDb } from "../db";
import { downloads } from "../db/schema";
import { AppError } from "../middleware/error";
import { rateLimit } from "../middleware/rateLimit";
import type { Env } from "../types";

const downloadRoutes = new Hono<Env>();

const VERSION = "1.0.0";
const FILES: Record<Platform, string> = {
  windows: `DevClawWorker-${VERSION}-win-x64.exe`,
  macos: `DevClawWorker-${VERSION}-mac-arm64.dmg`,
};

// 获取下载信息
downloadRoutes.get("/info", (c) => {
  return c.json<ApiResponse>({
    success: true,
    data: {
      version: VERSION,
      platforms: {
        windows: { filename: FILES.windows, available: true },
        macos: { filename: FILES.macos, available: true },
      },
    },
  });
});

// 从 R2 下载文件
downloadRoutes.get("/:platform", rateLimit(10, 60), async (c) => {
  const platform = c.req.param("platform") as Platform;

  if (!FILES[platform]) {
    throw new AppError("Invalid platform", 400);
  }

  const filename = FILES[platform];
  const r2: R2Bucket = c.env.R2;

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
    version: VERSION,
    ip,
    userAgent,
  });

  // 返回文件流
  c.header("Content-Type", platform === "windows" ? "application/octet-stream" : "application/x-apple-diskimage");
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
