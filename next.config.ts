import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next guess the wrong workspace
  // root; pin it to this project.
  turbopack: { root: __dirname },
};

export default nextConfig;
