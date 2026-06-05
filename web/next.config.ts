import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to /web — the parent alfred-os repo also has a
  // lockfile (the mobile app), which would otherwise confuse root inference.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
