import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
