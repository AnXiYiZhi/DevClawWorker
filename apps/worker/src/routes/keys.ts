import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  generateKeySchema,
  updateKeySchema,
  paginationSchema,
  type ApiResponse,
} from "@devclawworker/shared";
import { createDb } from "../db";
import { licenseKeys, activationLogs } from "../db/schema";
import { eq, like, sql, desc, and, count, asc } from "drizzle-orm";
import { generateLicenseKey } from "../lib/key";
import { AppError } from "../middleware/error";
import type { Env } from "../types";

const keys = new Hono<Env>();

// List keys with pagination
keys.get("/", zValidator("query", paginationSchema, (result, c) => {
  if (!result.success) {
    return c.json<ApiResponse>({ success: false, error: result.error.issues[0].message }, 400);
  }
}), async (c) => {
  const { page, limit, search, status } = c.req.valid("query");
  const db = createDb(c.env.DB);
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(like(licenseKeys.key, `%${search}%`));
  if (status !== "all") conditions.push(eq(licenseKeys.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ value: count() })
    .from(licenseKeys)
    .where(where);

  const data = await db
    .select()
    .from(licenseKeys)
    .where(where)
    .orderBy(
      sql`CASE WHEN ${licenseKeys.deviceId} IS NULL THEN 0 ELSE 1 END`,
      desc(licenseKeys.createdAt)
    )
    .limit(limit)
    .offset(offset);

  return c.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total: totalResult.value,
      totalPages: Math.ceil(totalResult.value / limit),
    },
  });
});

// Generate keys
keys.post(
  "/generate",
  zValidator("json", generateKeySchema, (result, c) => {
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: result.error.issues[0].message }, 400);
    }
  }),
  async (c) => {
    const { count: keyCount, expiresInDays } = c.req.valid("json");
    const db = createDb(c.env.DB);
    const payload = c.get("jwtPayload");

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
      : null;

    const generatedKeys = [];
    for (let i = 0; i < keyCount; i++) {
      const keyValue = generateLicenseKey();
      const [newKey] = await db
        .insert(licenseKeys)
        .values({
          key: keyValue,
          expiresAt,
          createdBy: payload?.sub ?? null,
        })
        .returning();
      generatedKeys.push(newKey);
    }

    return c.json<ApiResponse>({
      success: true,
      data: generatedKeys,
      message: `Generated ${keyCount} key(s)`,
    });
  }
);

// Get single key
keys.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = createDb(c.env.DB);

  const [key] = await db
    .select()
    .from(licenseKeys)
    .where(eq(licenseKeys.id, id))
    .limit(1);

  if (!key) throw new AppError("Key not found", 404);

  // Get activation logs for this key
  const logs = await db
    .select()
    .from(activationLogs)
    .where(eq(activationLogs.keyId, id))
    .orderBy(desc(activationLogs.createdAt))
    .limit(50);

  return c.json<ApiResponse>({ success: true, data: { ...key, logs } });
});

// Update key
keys.patch(
  "/:id",
  zValidator("json", updateKeySchema, (result, c) => {
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: result.error.issues[0].message }, 400);
    }
  }),
  async (c) => {
    const id = parseInt(c.req.param("id"));
    const updates = c.req.valid("json");
    const db = createDb(c.env.DB);

    const [existing] = await db
      .select()
      .from(licenseKeys)
      .where(eq(licenseKeys.id, id))
      .limit(1);

    if (!existing) throw new AppError("Key not found", 404);

    const [updated] = await db
      .update(licenseKeys)
      .set(updates)
      .where(eq(licenseKeys.id, id))
      .returning();

    return c.json<ApiResponse>({ success: true, data: updated });
  }
);

// Delete key
keys.delete("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = createDb(c.env.DB);

  const [existing] = await db
    .select()
    .from(licenseKeys)
    .where(eq(licenseKeys.id, id))
    .limit(1);

  if (!existing) throw new AppError("Key not found", 404);

  // Delete associated logs first
  await db.delete(activationLogs).where(eq(activationLogs.keyId, id));
  await db.delete(licenseKeys).where(eq(licenseKeys.id, id));

  return c.json<ApiResponse>({ success: true, message: "Key deleted" });
});

// Reset device binding
keys.post("/:id/reset-device", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = createDb(c.env.DB);

  const [existing] = await db
    .select()
    .from(licenseKeys)
    .where(eq(licenseKeys.id, id))
    .limit(1);

  if (!existing) throw new AppError("Key not found", 404);

  const [updated] = await db
    .update(licenseKeys)
    .set({ deviceId: null, activatedAt: null })
    .where(eq(licenseKeys.id, id))
    .returning();

  return c.json<ApiResponse>({ success: true, data: updated });
});

export { keys };
