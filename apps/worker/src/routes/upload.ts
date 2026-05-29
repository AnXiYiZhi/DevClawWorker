import { Hono } from "hono";
import type { ApiResponse } from "@devclawworker/shared";
import { verifyJwt } from "../lib/jwt";
import { AppError } from "../middleware/error";
import type { Env } from "../types";

const upload = new Hono<Env>();

// 上传安装包到 R2（需要管理员权限或 CI Token）
upload.post("/:platform", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }
  const token = authHeader.slice(7);

  const ciToken = c.env.CI_UPLOAD_TOKEN;
  if (ciToken && token === ciToken) {
    // CI token 匹配，放行
  } else {
    const jwtSecret = c.env.JWT_SECRET;
    const payload = await verifyJwt(token, jwtSecret);
    if (!payload || payload.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }
  }

  const platform = c.req.param("platform");
  const version = c.req.query("version") || "1.0.0";

  if (platform !== "windows" && platform !== "macos") {
    return c.json<ApiResponse>({ success: false, error: "Invalid platform. Use 'windows' or 'macos'." }, 400);
  }

  const body = await c.req.arrayBuffer();
  if (!body || body.byteLength === 0) {
    return c.json<ApiResponse>({ success: false, error: "Empty file" }, 400);
  }

  const ext = platform === "windows" ? "zip" : "dmg";
  const arch = platform === "windows" ? "win-x64" : "mac-arm64";
  const filename = `DevClawWorker-${version}-${arch}.${ext}`;

  const r2: R2Bucket = c.env.R2;
  await r2.put(filename, body, {
    httpMetadata: {
      contentType: platform === "windows"
        ? "application/zip"
        : "application/x-apple-diskimage",
    },
  });

  // 更新 latest-version 指针
  await r2.put("latest-version", version);

  return c.json<ApiResponse>({
    success: true,
    data: { filename, size: body.byteLength },
    message: "File uploaded successfully",
  });
});

export { upload };
