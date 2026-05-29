import type { Context, Next } from "hono";
import type { ApiResponse } from "@devclawworker/shared";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export async function errorMiddleware(c: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      return c.json<ApiResponse>(
        { success: false, error: err.message },
        err.statusCode as any
      );
    }

    console.error("Unhandled error:", err);
    return c.json<ApiResponse>(
      { success: false, error: "Internal server error" },
      500
    );
  }
}
