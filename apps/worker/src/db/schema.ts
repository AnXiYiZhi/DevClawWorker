import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const licenseKeys = sqliteTable("license_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  status: text("status", { enum: ["active", "disabled", "expired"] })
    .notNull()
    .default("active"),
  deviceId: text("device_id"),
  activatedAt: text("activated_at"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  createdBy: integer("created_by").references(() => users.id),
});

export const activationLogs = sqliteTable("activation_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  keyId: integer("key_id")
    .notNull()
    .references(() => licenseKeys.id),
  deviceId: text("device_id").notNull(),
  action: text("action", { enum: ["activate", "verify", "deactivate"] }).notNull(),
  ip: text("ip"),
  success: integer("success", { mode: "boolean" }).notNull(),
  message: text("message"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export const downloads = sqliteTable("downloads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("platform", { enum: ["windows", "macos"] }).notNull(),
  version: text("version").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
