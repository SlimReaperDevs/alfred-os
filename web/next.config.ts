import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The shared engines live in ../src (one source of truth with the mobile app),
  // so the Turbopack root is the monorepo root, not /web.
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
