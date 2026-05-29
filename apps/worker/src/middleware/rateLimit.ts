import type { Context, Next } from "hono";

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(requests: number, windowSeconds: number) {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For") ||
      "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    const entry = store.get(key);
    if (entry && entry.resetAt > now) {
      if (entry.count >= requests) {
        return c.json(
          { success: false, error: "Too many requests" },
          429
        );
      }
      entry.count++;
    } else {
      store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    }

    await next();
  };
}
