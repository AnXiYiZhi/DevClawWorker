import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { verifyKeySchema, type ApiResponse, type VerifyKeyResponse } from "@devclawworker/shared";
import { createDb } from "../db";
import { licenseKeys, activationLogs } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/error";
import { rateLimit } from "../middleware/rateLimit";
import type { Env } from "../types";

const verify = new Hono<Env>();

verify.post(
  "/verify-key",
  rateLimit(10, 60),
  zValidator("json", verifyKeySchema, (result, c) => {
    if (!result.success) {
      return c.json<ApiResponse>({ success: false, error: result.error.issues[0].message }, 400);
    }
  }),
  async (c) => {
    const { licenseKey, deviceId } = c.req.valid("json");
    const db = createDb(c.env.DB);
    const ip = c.req.header("CF-Connecting-IP") || null;

    const [key] = await db
      .select()
      .from(licenseKeys)
      .where(eq(licenseKeys.key, licenseKey))
      .limit(1);

    // Key not found
    if (!key) {
      await db.insert(activationLogs).values({
        keyId: 0,
        deviceId,
        action: "verify",
        ip,
        success: false,
        message: "Key not found",
      });
      return c.json<VerifyKeyResponse>(
        { success: false, message: "Invalid license key" },
        404
      );
    }

    // Key disabled
    if (key.status === "disabled") {
      await db.insert(activationLogs).values({
        keyId: key.id,
        deviceId,
        action: "verify",
        ip,
        success: false,
        message: "Key disabled",
      });
      return c.json<VerifyKeyResponse>(
        { success: false, message: "License key is disabled" },
        403
      );
    }

    // Key expired
    if (key.status === "expired" || (key.expiresAt && new Date(key.expiresAt) < new Date())) {
      if (key.status !== "expired") {
        await db.update(licenseKeys).set({ status: "expired" }).where(eq(licenseKeys.id, key.id));
      }
      await db.insert(activationLogs).values({
        keyId: key.id,
        deviceId,
        action: "verify",
        ip,
        success: false,
        message: "Key expired",
      });
      return c.json<VerifyKeyResponse>(
        { success: false, message: "License key has expired" },
        403
      );
    }

    // First activation — bind device
    if (!key.deviceId) {
      await db
        .update(licenseKeys)
        .set({
          deviceId,
          activatedAt: new Date().toISOString(),
        })
        .where(eq(licenseKeys.id, key.id));

      await db.insert(activationLogs).values({
        keyId: key.id,
        deviceId,
        action: "activate",
        ip,
        success: true,
        message: "First activation",
      });

      return c.json<VerifyKeyResponse>({ success: true, message: "Activated" });
    }

    // Device mismatch
    if (key.deviceId !== deviceId) {
      await db.insert(activationLogs).values({
        keyId: key.id,
        deviceId,
        action: "verify",
        ip,
        success: false,
        message: "Device mismatch",
      });
      return c.json<VerifyKeyResponse>(
        { success: false, message: "License key is bound to another device" },
        403
      );
    }

    // Valid re-activation
    await db.insert(activationLogs).values({
      keyId: key.id,
      deviceId,
      action: "verify",
      ip,
      success: true,
      message: "Verified",
    });

    return c.json<VerifyKeyResponse>({ success: true, message: "Activated" });
  }
);

export { verify };
