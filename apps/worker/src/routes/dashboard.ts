import { Hono } from "hono";
import { type ApiResponse, type DashboardStats } from "@devclawworker/shared";
import { createDb } from "../db";
import { licenseKeys, activationLogs, downloads } from "../db/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import type { Env } from "../types";

const dashboard = new Hono<Env>();

dashboard.get("/stats", async (c) => {
  c.header("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
  const db = createDb(c.env.DB);

  const [
    totalResult,
    boundResult,
    recentActivations,
    recentDownloads,
    totalActivations,
    totalDownloadsResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(licenseKeys),
    db.select({ value: count() }).from(licenseKeys).where(sql`${licenseKeys.deviceId} IS NOT NULL`),
    db.select().from(activationLogs).orderBy(desc(activationLogs.createdAt)).limit(10),
    db.select().from(downloads).orderBy(desc(downloads.createdAt)).limit(10),
    db.select({ value: count() }).from(activationLogs),
    db.select({ value: count() }).from(downloads),
  ]);

  return c.json<ApiResponse<DashboardStats>>({
    success: true,
    data: {
      totalKeys: totalResult[0]?.value ?? 0,
      activeKeys: boundResult[0]?.value ?? 0,
      disabledKeys: 0,
      expiredKeys: 0,
      totalActivations: totalActivations[0]?.value ?? 0,
      totalDownloads: totalDownloadsResult[0]?.value ?? 0,
      recentActivations,
      recentDownloads,
    },
  });
});

export { dashboard };
