import { Hono } from "hono";
import { type ApiResponse, type DashboardStats } from "@devclawworker/shared";
import { createDb } from "../db";
import { licenseKeys, activationLogs, downloads } from "../db/schema";
import { eq, count, desc } from "drizzle-orm";
import type { Env } from "../types";

const dashboard = new Hono<Env>();

dashboard.get("/stats", async (c) => {
  const db = createDb(c.env.DB);

  const allKeys = await db.select().from(licenseKeys);
  const totalKeys = allKeys.length;
  const activeKeys = allKeys.filter((k) => k.status === "active").length;
  const disabledKeys = allKeys.filter((k) => k.status === "disabled").length;
  const expiredKeys = allKeys.filter(
    (k) =>
      k.status === "expired" ||
      (k.expiresAt && new Date(k.expiresAt) < new Date())
  ).length;

  const recentActivations = await db
    .select()
    .from(activationLogs)
    .orderBy(desc(activationLogs.createdAt))
    .limit(10);

  const recentDownloads = await db
    .select()
    .from(downloads)
    .orderBy(desc(downloads.createdAt))
    .limit(10);

  const totalActivations = await db
    .select({ count: count() })
    .from(activationLogs);

  const totalDownloadsResult = await db
    .select({ count: count() })
    .from(downloads);

  return c.json<ApiResponse<DashboardStats>>({
    success: true,
    data: {
      totalKeys,
      activeKeys,
      disabledKeys,
      expiredKeys,
      totalActivations: totalActivations[0]?.count ?? 0,
      totalDownloads: totalDownloadsResult[0]?.count ?? 0,
      recentActivations,
      recentDownloads,
    },
  });
});

export { dashboard };
