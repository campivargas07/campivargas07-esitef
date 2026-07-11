import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import presencialRedirects from "./src/data/presencial-redirects.json";
import wpRedirects from "./src/data/wp-redirects.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  // Evita que Next resuelva el lockfile de /workspaces como raíz del monorepo.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@esitef/db"],
  redirects: async () => legacyRedirects,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "esitef.com",
        pathname: "/online/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
