import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, COOKIE_NAME, JWT_EXPIRY, type ApiResponse, type LoginRequest } from "@devclawworker/shared";
import { signJwt } from "../lib/jwt";
import { verifyPassword, hashPassword } from "../lib/key";
import { createDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../middleware/error";
import { rateLimit } from "../middleware/rateLimit";
import { authMiddleware } from "../middleware/auth";
import type { Env } from "../types";

const auth = new Hono<Env>();

auth.post("/login", rateLimit(5, 300), zValidator("json", loginSchema, (result, c) => {
  if (!result.success) {
    return c.json<ApiResponse>({ success: false, error: result.error.issues[0].message }, 400);
  }
}), async (c) => {
  const { username, password } = c.req.valid("json") as LoginRequest;
  const db = createDb(c.env.DB);

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = await signJwt(
    { sub: user.id, username: user.username, role: user.role },
    c.env.JWT_SECRET,
    JWT_EXPIRY
  );

  c.header(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400`
  );

  return c.json<ApiResponse>({
    success: true,
    data: { token, user: { id: user.id, username: user.username, role: user.role } },
  });
});

auth.post("/logout", (c) => {
  c.header(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
  return c.json<ApiResponse>({ success: true, message: "Logged out" });
});

auth.get("/me", authMiddleware, async (c) => {
  const payload = c.get("jwtPayload");
  if (!payload) {
    throw new AppError("Not authenticated", 401);
  }
  return c.json<ApiResponse>({
    success: true,
    data: { id: payload.sub, username: payload.username, role: payload.role },
  });
});

// Setup endpoint — create admin user if none exists
auth.post("/setup", async (c) => {
  const db = createDb(c.env.DB);
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    throw new AppError("Admin already configured", 400);
  }

  const body = await c.req.json<{ username: string; password: string }>();
  const passwordHash = await hashPassword(body.password);

  const [user] = await db
    .insert(users)
    .values({
      username: body.username,
      passwordHash,
      role: "admin",
    })
    .returning();

  return c.json<ApiResponse>({
    success: true,
    data: { id: user.id, username: user.username },
  });
});

export { auth };
