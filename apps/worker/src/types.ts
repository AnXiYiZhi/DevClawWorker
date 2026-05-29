import type { JWTPayload } from "@devclawworker/shared";

export interface Env {
  Bindings: {
    DB: D1Database;
    R2: R2Bucket;
    JWT_SECRET: string;
    ADMIN_USERNAME: string;
    ADMIN_PASSWORD: string;
    CORS_ORIGIN: string;
    CI_UPLOAD_TOKEN: string;
  };
  Variables: {
    jwtPayload: JWTPayload;
  };
}
