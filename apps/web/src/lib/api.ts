import type { ApiResponse } from "@devclawworker/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request("/api/logout", { method: "POST" }),

  me: () => request("/api/me"),

  // Keys
  getKeys: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/api/keys${qs}`);
  },

  getKey: (id: number) => request(`/api/keys/${id}`),

  generateKeys: (count: number, expiresInDays?: number) =>
    request("/api/keys/generate", {
      method: "POST",
      body: JSON.stringify({ count, expiresInDays }),
    }),

  updateKey: (id: number, updates: Record<string, unknown>) =>
    request(`/api/keys/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),

  deleteKey: (id: number) =>
    request(`/api/keys/${id}`, { method: "DELETE" }),

  resetDevice: (id: number) =>
    request(`/api/keys/${id}/reset-device`, { method: "POST" }),

  // Dashboard
  getDashboardStats: () => request("/api/dashboard/stats"),

  // Downloads
  getDownloadInfo: () => request("/api/downloads/info"),
};
