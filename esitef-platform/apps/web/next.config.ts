import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import presencialRedirects from "./src/data/presencial-redirects.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const legacyRedirects = Object.entries(
  presencialRedirects as Record<string, string>
).map(([from, to]) => ({
  source: `/${from}`,
  destination: `/${to}`,
  permanent: true,
}));

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
