"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Monitor, Apple, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";
const GITEE_REPO = "anxi-yizhi/dev-claw";
const GITHUB_REPO = "AnXiYiZhi/DevCLaw";

const highlights = [
  "支持 7 款 AI 编程工具",
  "内置 50+ 服务商预设",
  "本地代理，自动故障转移",
  "费用追踪与 Token 统计",
  "100% 离线可用",
];

export default function DownloadPage() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/downloads/info`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVersion(d.data.version);
      })
      .catch(() => {});
  }, []);

  const ghDownload = (file: string) => {
    if (!version) return;
    window.location.href = `https://github.com/${GITHUB_REPO}/releases/download/v${version}/${file}`;
  };

  const giteeDownload = async (file: string) => {
    if (!version) return;
    try {
      const res = await fetch(
        `https://gitee.com/api/v5/repos/${GITEE_REPO}/releases?page=1&per_page=5`
      );
      const releases = await res.json();
      for (const rel of releases) {
        if (rel.prerelease || rel.draft) continue;
        const asset = rel.assets?.find(
          (a: { name: string }) => a.name === file
        );
        if (asset?.browser_download_url) {
          window.location.href = asset.browser_download_url;
          return;
        }
      }
      // fallback: try tag-based URL
      window.location.href = `https://gitee.com/${GITEE_REPO}/releases/download/v${version}/${file}`;
    } catch {
      window.location.href = `https://gitee.com/${GITEE_REPO}/releases/download/v${version}/${file}`;
    }
  };

  const r2Download = (platform: string) => {
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
            {version && (
              <p className="mt-2 text-sm text-zinc-600">当前版本：v{version}</p>
            )}
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
                    <p className="text-sm text-zinc-500">x64 安装包 (.zip)</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-zinc-400">
                  兼容 Windows 10/11，解压即用。
                </p>
                <Button
                  className="w-full"
                  disabled={!version}
                  onClick={() => giteeDownload(`DevClaw-v${version}-Windows-Portable.zip`)}
                >
                  {version ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      下载 Windows 版
                    </>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </Button>
                <div className="mt-2 flex justify-center gap-3 text-xs text-zinc-500">
                  <button onClick={() => ghDownload(`DevClaw-v${version}-Windows-Portable.zip`)} className="hover:text-zinc-300 transition-colors">
                    备用下载1 GitHub
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button onClick={() => r2Download("windows")} className="hover:text-zinc-300 transition-colors">
                    备用下载2 R2
                  </button>
                </div>
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
                      Apple Silicon & Intel (.dmg)
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-zinc-400">
                  原生 ARM64/x64 构建，适配 M/Intel 系列芯片。
                </p>
                <Button
                  className="w-full"
                  disabled={!version}
                  onClick={() => giteeDownload(`DevClaw-v${version}-macOS.dmg`)}
                >
                  {version ? (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      下载 macOS 版
                    </>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </Button>
                <div className="mt-2 flex justify-center gap-3 text-xs text-zinc-500">
                  <button onClick={() => ghDownload(`DevClaw-v${version}-macOS.dmg`)} className="hover:text-zinc-300 transition-colors">
                    备用下载1 GitHub
                  </button>
                  <span className="text-zinc-700">|</span>
                  <button onClick={() => r2Download("macos")} className="hover:text-zinc-300 transition-colors">
                    备用下载2 R2
                  </button>
                </div>
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
                    <li>下载安装包（.zip）</li>
                    <li>解压后运行 devclaw.exe</li>
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
