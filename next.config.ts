import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next.js from inferring a higher-level workspace root
  // when multiple lockfiles exist on this machine.
  // import.meta.dirname (Node 22+) instead of the CommonJS __dirname global,
  // which is unavailable under "type": "module" (required by vinext/Vite).
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
