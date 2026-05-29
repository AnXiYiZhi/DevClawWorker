import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevClaw — AI 编程工具统一管理客户端",
  description:
    "一站式管理 Claude Code、Claude Desktop、Codex、Gemini CLI、OpenCode、OpenClaw、Hermes Agent 共 7 款 AI 编程工具。",
  icons: {
    icon: "/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
