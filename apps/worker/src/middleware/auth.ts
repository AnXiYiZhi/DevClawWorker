import type { Context, Next } from "hono";
import { verifyJwt } from "../lib/jwt";
import { COOKIE_NAME } from "@devclawworker/shared";
import { AppError } from "./error";

export async function authMiddleware(c: Context, next: Next) {
  const cookieHeader = c.req.header("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").filter(Boolean).map((c) => {
      const [key, ...val] = c.split("=");
      return [key, val.join("=")];
    })
  );

  let token = cookies[COOKIE_NAME];

  if (!token) {
    const authHeader = c.req.header("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  const jwtSecret = c.env.JWT_SECRET as string;
  const payload = await verifyJwt(token, jwtSecret);

  if (!payload) {
    throw new AppError("Invalid or expired token", 401);
  }

  c.set("jwtPayload", payload);
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const payload = c.get("jwtPayload");
  if (!payload || payload.role !== "admin") {
    throw new AppError("Admin access required", 403);
  }
  await next();
}
