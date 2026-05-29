"use client";

import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Apple, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

const highlights = [
  "支持 7 款 AI 编程工具",
  "内置 50+ 服务商预设",
  "本地代理，自动故障转移",
  "费用追踪与 Token 统计",
  "100% 离线可用",
];

export default function DownloadPage() {
  const handleDownload = (platform: string) => {
    window.open(`${API_BASE}/api/downloads/${platform}`, "_blank");
  };

  return (
    <>
      <Nav />
      <main className="min-h-screen px-4 pt-24">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>

          <div className="mb-12 text-center">
            <img src="/icon.jpg" alt="DevClaw" className="mx-auto mb-6 h-24 w-24 rounded-2xl object-cover shadow-lg" />
            <h1 className="text-4xl font-bold tracking-tight">下载 DevClaw</h1>
            <p className="mt-4 text-zinc-400">
              Tauri 2 (Rust) 构建，轻量极速，数据全部本地存储
            </p>
          </div>

          {/* Highlights */}
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Windows */}
            <Card className="group cursor-pointer hover:border-brand-600/50 transition-all duration-200 hover:glow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400">
                    <Monitor className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Windows</CardTitle>
                    <p className="text-sm text-zinc-500">x64 安装包 (.exe)</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-zinc-400">
                  兼容 Windows 10/11，支持自动更新。
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleDownload("windows")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载 Windows 版
                </Button>
              </CardContent>
            </Card>

            {/* macOS */}
            <Card className="group cursor-pointer hover:border-brand-600/50 transition-all duration-200 hover:glow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-600/10 text-zinc-300">
                    <Apple className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>macOS</CardTitle>
                    <p className="text-sm text-zinc-500">
                      Apple Silicon (.dmg)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-zinc-400">
                  原生 ARM64 构建，适配 M1/M2/M3/M4 芯片。
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleDownload("macos")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载 macOS 版
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Installation guide */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>安装指南</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-medium">Windows</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-400">
                    <li>下载安装包（.exe）</li>
                    <li>运行安装程序，按提示完成安装</li>
                    <li>从开始菜单或桌面快捷方式启动 DevClaw</li>
                    <li>首次启动会自动配置 AI 工具环境</li>
                  </ol>
                </div>
                <div>
                  <h4 className="mb-2 font-medium">macOS</h4>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-400">
                    <li>下载磁盘映像（.dmg）</li>
                    <li>打开 .dmg 文件，将 DevClaw 拖入应用程序</li>
                    <li>从启动台或 Spotlight 启动</li>
                    <li>首次启动会自动配置 AI 工具环境</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
