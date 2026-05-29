"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/icon.jpg" alt="DevClaw" className="h-8 w-8 rounded-lg object-cover" />
          <span className="text-lg font-bold tracking-tight">DevClaw</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            功能
          </a>
          <Link
            href="/download"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            下载
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <Link href="/admin">
            <Button size="sm">
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              管理后台
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-zinc-400 md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <a
              href="#features"
              className="text-sm text-zinc-400 hover:text-white"
              onClick={() => setOpen(false)}
            >
              功能
            </a>
            <Link
              href="/download"
              className="text-sm text-zinc-400 hover:text-white"
              onClick={() => setOpen(false)}
            >
              下载
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link href="/admin" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                管理后台
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
