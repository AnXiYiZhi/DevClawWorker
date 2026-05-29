import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export const verifyKeySchema = z.object({
  licenseKey: z
    .string()
    .regex(/^CCS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Invalid key format"),
  deviceId: z.string().min(1).max(200),
});

export const generateKeySchema = z.object({
  count: z.number().int().min(1).max(100).default(1),
  expiresInDays: z.number().int().min(1).max(3650).optional(),
});

export const updateKeySchema = z.object({
  status: z.enum(["active", "disabled"]).optional(),
  expiresAt: z.string().datetime().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["active", "disabled", "expired", "all"]).default("all"),
});
