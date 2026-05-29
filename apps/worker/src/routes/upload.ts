import { Hono } from "hono";
import type { ApiResponse } from "@devclawworker/shared";
import type { Env } from "../types";

const upload = new Hono<Env>();

// 上传安装包到 R2（需要管理员权限）
upload.post("/:platform", async (c) => {
  const platform = c.req.param("platform");
  const version = c.req.query("version") || "1.0.0";

  if (platform !== "windows" && platform !== "macos") {
    return c.json<ApiResponse>({ success: false, error: "Invalid platform. Use 'windows' or 'macos'." }, 400);
  }

  const body = await c.req.arrayBuffer();
  if (!body || body.byteLength === 0) {
    return c.json<ApiResponse>({ success: false, error: "Empty file" }, 400);
  }

  const ext = platform === "windows" ? "exe" : "dmg";
  const arch = platform === "windows" ? "win-x64" : "mac-arm64";
  const filename = `DevClawWorker-${version}-${arch}.${ext}`;

  const r2: R2Bucket = c.env.R2;
  await r2.put(filename, body, {
    httpMetadata: {
      contentType: platform === "windows"
        ? "application/octet-stream"
        : "application/x-apple-diskimage",
    },
  });

  return c.json<ApiResponse>({
    success: true,
    data: { filename, size: body.byteLength },
    message: "File uploaded successfully",
  });
});

export { upload };
