"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Activity,
  Download,
  TrendingUp,
  Clock,
  Monitor,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

interface Stats {
  totalKeys: number;
  activeKeys: number;
  disabledKeys: number;
  expiredKeys: number;
  totalActivations: number;
  totalDownloads: number;
  recentActivations: Array<{
    id: number;
    deviceId: string;
    action: string;
    success: boolean;
    message: string;
    createdAt: string;
  }>;
  recentDownloads: Array<{
    id: number;
    platform: string;
    version: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_BASE}/api/dashboard/stats`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center text-zinc-500">
        加载数据失败
      </div>
    );
  }

  const statCards = [
    {
      label: "总授权数",
      value: stats.totalKeys,
      icon: Key,
      color: "text-brand-400",
      bg: "bg-brand-400/10",
    },
    {
      label: "已激活",
      value: stats.activeKeys,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      label: "激活次数",
      value: stats.totalActivations,
      icon: Activity,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "下载次数",
      value: stats.totalDownloads,
      icon: Download,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold">{stat.value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent activations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-zinc-400" />
              最近激活
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivations.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                暂无激活记录
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivations.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="h-4 w-4 text-zinc-500" />
                      <div>
                        <p className="text-sm font-mono">
                          {log.deviceId.slice(0, 16)}...
                        </p>
                        <p className="text-xs text-zinc-500">{log.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={log.success ? "success" : "destructive"}
                      >
                        {log.action === "activate" ? "激活" : log.action === "verify" ? "验证" : log.action}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent downloads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-zinc-400" />
              最近下载
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentDownloads.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                暂无下载记录
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentDownloads.map((dl) => (
                  <div
                    key={dl.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="h-4 w-4 text-zinc-500" />
                      <div>
                        <p className="text-sm font-medium">
                          {dl.platform === "windows" ? "Windows" : "macOS"}
                        </p>
                        <p className="text-xs text-zinc-500">v{dl.version}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="h-3 w-3" />
                      {new Date(dl.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
