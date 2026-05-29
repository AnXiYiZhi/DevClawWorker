export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface User {
  id: number;
  username: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface LicenseKey {
  id: number;
  key: string;
  status: "active" | "disabled" | "expired";
  deviceId: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdBy: number | null;
}

export interface ActivationLog {
  id: number;
  keyId: number;
  deviceId: string;
  action: "activate" | "verify" | "deactivate";
  ip: string | null;
  success: boolean;
  message: string | null;
  createdAt: string;
}

export interface DownloadRecord {
  id: number;
  platform: "windows" | "macos";
  version: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface JWTPayload {
  sub: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export interface VerifyKeyRequest {
  licenseKey: string;
  deviceId: string;
}

export interface VerifyKeyResponse {
  success: boolean;
  message: string;
}

export interface GenerateKeyRequest {
  count?: number;
  expiresInDays?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DashboardStats {
  totalKeys: number;
  activeKeys: number;
  disabledKeys: number;
  expiredKeys: number;
  totalActivations: number;
  totalDownloads: number;
  recentActivations: ActivationLog[];
  recentDownloads: DownloadRecord[];
}
