/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@devclawworker/shared", "@devclawworker/ui"],
};

export default nextConfig;
