import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.GITHUB_ACTIONS ? "/sizesnap" : "",
  images: { unoptimized: true },
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
