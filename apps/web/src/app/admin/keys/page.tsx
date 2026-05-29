"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Plus,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  RotateCcw,
  Copy,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface LicenseKey {
  id: number;
  key: string;
  status: string;
  deviceId: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusLabels: Record<string, string> = {
  all: "全部",
  active: "正常",
  disabled: "已禁用",
  expired: "已过期",
};

export default function KeysPage() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [generateExpiry, setGenerateExpiry] = useState("");
  const [showGenerate, setShowGenerate] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
      status: statusFilter,
    });
    if (search) params.set("search", search);

    try {
      const res = await fetch(`${API_BASE}/api/keys?${params}`, {
        credentials: "include",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setKeys(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const body: Record<string, number> = { count: generateCount };
      if (generateExpiry) body.expiresInDays = parseInt(generateExpiry);

      const res = await fetch(`${API_BASE}/api/keys/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowGenerate(false);
        fetchKeys();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    await fetch(`${API_BASE}/api/keys/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchKeys();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要永久删除此授权码吗？")) return;
    await fetch(`${API_BASE}/api/keys/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: authHeaders(),
    });
    fetchKeys();
  };

  const handleResetDevice = async (id: number) => {
    await fetch(`${API_BASE}/api/keys/${id}/reset-device`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
    });
    fetchKeys();
  };

  const copyKey = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "disabled":
        return "destructive";
      case "expired":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">授权管理</h1>
          <p className="text-sm text-zinc-500">
            管理和分发软件授权码
          </p>
        </div>
        <Button onClick={() => setShowGenerate(!showGenerate)}>
          <Plus className="mr-2 h-4 w-4" />
          生成授权码
        </Button>
      </div>

      {/* Generate form */}
      {showGenerate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">生成新授权码</CardTitle>
              <button onClick={() => setShowGenerate(false)}>
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">数量</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                  className="w-32"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  有效期（天，可选）
                </label>
                <Input
                  type="number"
                  min={1}
                  placeholder="永久"
                  value={generateExpiry}
                  onChange={(e) => setGenerateExpiry(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                生成
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="搜索授权码..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "active", "disabled", "expired"].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {statusLabels[s]}
            </Button>
          ))}
        </div>
      </div>

      {/* Keys table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : keys.length === 0 ? (
            <div className="py-20 text-center text-zinc-500">
              暂无授权码
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      授权码
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                      状态
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 md:table-cell">
                      设备
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 lg:table-cell">
                      过期时间
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:table-cell">
                      创建时间
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {keys.map((k) => (
                    <tr
                      key={k.id}
                      className="hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">{k.key}</code>
                          <button
                            onClick={() => copyKey(k.id, k.key)}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors"
                          >
                            {copiedId === k.id ? (
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(k.status) as any}>
                          {statusLabels[k.status] || k.status}
                        </Badge>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="text-sm text-zinc-400">
                          {k.deviceId
                            ? `${k.deviceId.slice(0, 12)}...`
                            : "—"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
                        <span className="text-sm text-zinc-400">
                          {k.expiresAt
                            ? new Date(k.expiresAt).toLocaleDateString()
                            : "永久"}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="text-sm text-zinc-400">
                          {new Date(k.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(k.id, k.status)}
                            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                            title={
                              k.status === "active" ? "禁用" : "启用"
                            }
                          >
                            {k.status === "active" ? (
                              <Ban className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {k.deviceId && (
                            <button
                              onClick={() => handleResetDevice(k.id)}
                              className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
                              title="重置设备绑定"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(k.id)}
                            className="rounded-md p-1.5 text-zinc-500 hover:bg-red-950 hover:text-red-400 transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            显示 {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)}{" "}
            / 共 {pagination.total} 条
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-zinc-400">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
