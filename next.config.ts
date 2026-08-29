import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent Next.js from inferring a higher-level workspace root
  // when multiple lockfiles exist on this machine.
  // import.meta.dirname (Node 22+) instead of the CommonJS __dirname global,
  // which is unavailable under "type": "module" (required by vinext/Vite).
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  webpack: (config) => {
    // Serve `import md from '...*.md?raw'` as the file's string content,
    // matching Vite's built-in ?raw behavior (used by vinext/Cloudflare).
    config.module.rules.push({
      test: /\.md$/,
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
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
