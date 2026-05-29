export const KEY_PREFIX = "CCS";
export const KEY_SEGMENT_LENGTH = 4;
export const KEY_SEGMENT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const COOKIE_NAME = "devclaw_session";
export const JWT_EXPIRY = "24h";

export const RATE_LIMITS = {
  login: { requests: 5, window: 300 },
  verifyKey: { requests: 10, window: 60 },
  download: { requests: 10, window: 60 },
  api: { requests: 100, window: 60 },
} as const;

export const PLATFORMS = ["windows", "macos"] as const;
export type Platform = (typeof PLATFORMS)[number];
