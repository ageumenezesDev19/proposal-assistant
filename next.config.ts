import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Every non-internal IPv4 this machine answers on, so opening the dev server
 * from a phone on the same Wi-Fi works without editing this file. Hard-coding
 * the address breaks the next time the router hands out a different lease.
 */
function localNetworkAddresses(): string[] {
  return Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

const nextConfig: NextConfig = {
  // A stray lockfile in the home directory makes Next guess the wrong workspace
  // root; pin it to this project.
  turbopack: { root: __dirname },

  // Without this, Next blocks the phone's HMR socket as a cross-origin dev
  // request, so the device silently stops receiving updates and keeps showing
  // whatever it loaded first.
  allowedDevOrigins: localNetworkAddresses(),

  async headers() {
    // Safari caches aggressively over a LAN address, which is how this app gets
    // opened on a phone during development (http://192.168.x.x:3000). It was
    // serving a stylesheet from before the latest edit, so newly added utility
    // classes were simply absent — elements rendered unstyled and looked broken
    // in ways the code no longer explained. The exposure is real because
    // Turbopack's dev CSS chunk name is a path hash, not a content hash: the
    // file changes, the URL doesn't, so one stale cached copy shadows every
    // later edit. Never applied to production, where the hashed asset names
    // make caching correct and worth having.
    //
    // Scope: this lands on /_next/static assets — the part that was actually
    // going stale. HTML documents are the one place Next overrides it (it
    // forces `no-cache, must-revalidate` in dev, verified on the wire; setting
    // the header from the proxy loses too), which still obliges the browser to
    // revalidate the page itself.
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
