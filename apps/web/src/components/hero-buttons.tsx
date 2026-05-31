"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  Download,
  Github,
  ArrowRight,
  MessageCircle,
  BookOpen,
} from "lucide-react";

export function HeroButtons() {
  const [showQR, setShowQR] = useState(false);

  return (
    <>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link href="/download">
          <Button size="lg" className="group">
            <Download className="mr-2 h-5 w-5" />
            免费下载
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="lg"
          className="text-zinc-400 hover:text-emerald-400"
          onClick={() => setShowQR(true)}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          添加作者咨询
        </Button>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <a
          href="https://github.com/AnXiYiZhi/DevCLaw"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" size="lg">
            <Github className="mr-2 h-5 w-5" />
            查看源码
          </Button>
        </a>
        <a
          href="https://my.feishu.cn/wiki/HQowwNYYviqL17k0x3Rc6cbUnJf?fromScene=spaceOverview"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="ghost"
            size="lg"
            className="text-zinc-400 hover:text-blue-400"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            教程文档
          </Button>
        </a>
      </div>

      <Dialog open={showQR} onClose={() => setShowQR(false)} title="添加作者咨询">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/author-qr.jpg"
            alt="作者联系方式"
            className="max-w-full rounded-lg"
          />
          <p className="text-sm text-zinc-400">扫码关注作者小红书进行咨询</p>
        </div>
      </Dialog>
    </>
  );
}
