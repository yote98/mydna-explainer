import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next.js from inferring a higher-level workspace root
  // when multiple lockfiles exist on this machine.
  outputFileTracingRoot: path.resolve(__dirname),
};

export default nextConfig;
