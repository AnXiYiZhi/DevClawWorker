import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Download,
  Github,
  ArrowRight,
  Settings,
  RefreshCw,
  Server,
  Puzzle,
  DollarSign,
  MessageSquare,
  BookOpen,
  FileText,
  LayoutGrid,
  Link2,
  Monitor,
  Apple,
  Wifi,
  WifiOff,
} from "lucide-react";
import Link from "next/link";

const tools = [
  "Claude Code",
  "Claude Desktop",
  "Codex",
  "Gemini CLI",
  "OpenCode",
  "OpenClaw",
  "Hermes Agent",
];

const features = [
  {
    icon: Settings,
    title: "一键环境配置",
    description:
      "自动配置 7 款 AI 编程工具所需的运行环境，告别繁琐的手动设置。",
  },
  {
    icon: RefreshCw,
    title: "服务商切换",
    description:
      "内置 50+ 服务商预设（官方 API、AWS Bedrock、各大中转平台等），一键切换，支持拖拽排序和健康监测。",
  },
  {
    icon: Server,
    title: "本地代理",
    description:
      "内置反向代理服务器，支持 Anthropic/OpenAI 格式互转、自动故障转移、熔断保护，切换服务商无需重启工具。",
  },
  {
    icon: Puzzle,
    title: "MCP 管理",
    description:
      "统一管理 4 款应用的 MCP 服务器配置，双向同步，可视化向导。",
  },
  {
    icon: DollarSign,
    title: "费用追踪",
    description:
      "按模型、服务商统计花费和 Token 用量，支持自定义定价，图表可视化。",
  },
  {
    icon: MessageSquare,
    title: "会话管理",
    description:
      "跨应用浏览、搜索、恢复对话历史，不再丢失重要上下文。",
  },
  {
    icon: BookOpen,
    title: "Skills 管理",
    description:
      "从 GitHub 一键安装 Skills，支持自定义仓库，扩展工具能力。",
  },
  {
    icon: FileText,
    title: "Prompts 管理",
    description:
      "编辑和同步 CLAUDE.md / AGENTS.md / GEMINI.md，支持预设模板。",
  },
  {
    icon: LayoutGrid,
    title: "系统托盘快切",
    description:
      "不打开主界面，从托盘菜单直接切换服务商，高效不中断工作流。",
  },
  {
    icon: Link2,
    title: "Deep Link",
    description:
      "通过 devclaw:// 链接一键导入服务商、MCP、Prompt 配置。",
  },
];

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 pt-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
          <div className="absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-brand-600/5 blur-3xl" />

          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-4 py-1.5 text-sm text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              支持 Windows 和 macOS
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              AI 编程工具
              <br />
              <span className="gradient-text">统一管理客户端</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
              一站式管理 Claude Code、Claude Desktop、Codex、Gemini CLI、
              OpenCode、OpenClaw、Hermes Agent 共 7 款 AI 编程工具。
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/download">
                <Button size="lg" className="group">
                  <Download className="mr-2 h-5 w-5" />
                  免费下载
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg">
                  <Github className="mr-2 h-5 w-5" />
                  查看源码
                </Button>
              </a>
            </div>

            {/* Tool logos */}
            <div className="mx-auto mt-16 max-w-2xl">
              <p className="mb-4 text-xs uppercase tracking-wider text-zinc-600">
                支持的 AI 编程工具
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {tools.map((tool) => (
                  <div
                    key={tool}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400"
                  >
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-zinc-800/50 bg-zinc-950 px-4 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                10 大核心能力
              </h2>
              <p className="mt-4 text-zinc-400">
                从环境配置到费用追踪，覆盖 AI 编程工作流的每一个环节
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Card
                  key={feature.title}
                  className="group border-zinc-800/50 hover:border-zinc-700 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600/10">
                      <feature.icon className="h-5 w-5 text-brand-400" />
                    </div>
                    <h3 className="mb-2 font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t border-zinc-800/50 px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                技术架构
              </h2>
              <p className="mt-4 text-zinc-400">
                数据全部本地存储，100% 离线可用
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Tauri 2", desc: "Rust 内核，极致性能" },
                { label: "React", desc: "现代化前端界面" },
                { label: "TypeScript", desc: "类型安全开发" },
                { label: "本地存储", desc: "数据不离开你的设备" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 text-center"
                >
                  <p className="text-lg font-bold">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
              <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-3">
                <WifiOff className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-zinc-300">
                  100% 离线可用，无需联网
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-3">
                <Monitor className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-zinc-300">Windows</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-3">
                <Apple className="h-5 w-5 text-zinc-300" />
                <span className="text-sm text-zinc-300">macOS</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-zinc-800/50 bg-zinc-950 px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              开始使用 DevClaw
            </h2>
            <p className="mt-4 text-zinc-400">
              免费下载，即刻体验统一管理 AI 编程工具的高效方式
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/download">
                <Button size="lg">
                  <Download className="mr-2 h-5 w-5" />
                  下载 DevClaw
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
