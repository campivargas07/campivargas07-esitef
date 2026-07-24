import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import presencialRedirects from "./src/data/presencial-redirects.json";
import wpRedirects from "./src/data/wp-redirects.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Prefer apps/web (Vercel --no-workspaces); fall back to monorepo hoist (local). */
function resolveDep(name: string) {
  const local = path.join(__dirname, "node_modules", name);
  if (fs.existsSync(local)) return local;
  return path.join(__dirname, "../..", "node_modules", name);
}

function toRedirectEntries(map: Record<string, string>) {
  return Object.entries(map).map(([from, to]) => {
    const destination =
      to.startsWith("http://") || to.startsWith("https://") ? to : `/${to}`;
    return {
      source: `/${from}`,
      destination,
      permanent: true,
    };
  });
}

/** Rutas legacy bajo /online (subdirectorio WordPress en producción) */
const onlinePrefixRedirects = [
  { source: "/online", destination: "/formaciones", permanent: true },
  { source: "/online/", destination: "/formaciones", permanent: true },
];

const legacyRedirects = [
  ...onlinePrefixRedirects,
  ...toRedirectEntries(presencialRedirects as Record<string, string>),
  ...toRedirectEntries(wpRedirects as Record<string, string>),
];

const nextConfig: NextConfig = {
  // Evita que Turbopack tome /workspaces como root (lockfile ajeno al monorepo).
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  // No outputFileTracingRoot: con --no-workspaces next está en apps/web/node_modules;
  // apuntar al monorepo hacía que Vercel buscara next en el padre (noop.js error).
  transpilePackages: ["@esitef/db"],
  // Local tunnels (ngrok / localtunnel) hit Next from a different origin in dev.
  allowedDevOrigins: [
    "*.ngrok-free.dev",
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.loca.lt",
  ],
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/next/**/*",
      "../../packages/db/**/*",
    ],
    "/api/**/*": [
      "./node_modules/next/**/*",
      "../../packages/db/**/*",
    ],
  },
  // ponytail: file: + transpilePackages pierde algunos tipos en CI Vercel; runtime OK
  typescript: {
    ignoreBuildErrors: process.env.VERCEL === "1",
  },
  webpack: (config) => {
    // Deduped copies when monorepo hoist + nested install coexist locally.
    config.resolve.alias = {
      ...config.resolve.alias,
      "drizzle-orm": resolveDep("drizzle-orm"),
      postgres: resolveDep("postgres"),
    };
    return config;
  },
  redirects: async () => legacyRedirects,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Accept-CH",
            value: "Sec-CH-Prefers-Color-Scheme",
          },
          {
            key: "Critical-CH",
            value: "Sec-CH-Prefers-Color-Scheme",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "esitef",
  project: process.env.SENTRY_PROJECT || "esitef-web",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  tunnelRoute: "/sentry-tunnel",
  widenClientFileUpload: true,
});
