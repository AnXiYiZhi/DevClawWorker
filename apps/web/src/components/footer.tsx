export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} DevClawWorker. 保留所有权利。
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              隐私政策
            </a>
            <a
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              服务条款
            </a>
            <a
              href="#"
              className="text-sm text-zinc-500 hover:text-zinc-300"
            >
              联系我们
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
