import { Hono } from "hono";
import { createCors } from "./middleware/cors";
import { errorMiddleware } from "./middleware/error";
import { authMiddleware, adminMiddleware } from "./middleware/auth";
import type { Env } from "./types";
import { auth } from "./routes/auth";
import { verify } from "./routes/verify";
import { keys } from "./routes/keys";
import { downloadRoutes } from "./routes/downloads";
import { dashboard } from "./routes/dashboard";
import { upload } from "./routes/upload";

const app = new Hono<Env>();

// Global middleware
app.use("*", errorMiddleware);
app.use("*", (c, next) => createCors(c.env.CORS_ORIGIN || "*")(c, next));

// Health check
app.get("/api/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Public routes
app.route("/api", auth);
app.route("/api", verify);
app.route("/api/downloads", downloadRoutes);

// Protected routes — apply auth at sub-router level
const protectedKeys = new Hono<Env>();
protectedKeys.use("*", authMiddleware);
protectedKeys.route("/", keys);
app.route("/api/keys", protectedKeys);

const protectedDashboard = new Hono<Env>();
protectedDashboard.use("*", authMiddleware);
protectedDashboard.route("/", dashboard);
app.route("/api/dashboard", protectedDashboard);

const protectedUpload = new Hono<Env>();
protectedUpload.use("*", authMiddleware, adminMiddleware);
protectedUpload.route("/", upload);
app.route("/api/upload", protectedUpload);

// 404
app.notFound((c) =>
  c.json({ success: false, error: "Not found" }, 404)
);

export default app;
