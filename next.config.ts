import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next guess the wrong workspace
  // root; pin it to this project.
  turbopack: { root: __dirname },

  async headers() {
    // Safari caches aggressively over a LAN address, which is how this app gets
    // opened on a phone during development (http://192.168.x.x:3000). It was
    // serving a stylesheet from before the latest edit, so newly added utility
    // classes were simply absent — elements rendered unstyled and looked broken
    // in ways the code no longer explained. Never applied to production, where
    // the hashed asset names make caching correct and worth having.
    if (!isDev) return [];

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
