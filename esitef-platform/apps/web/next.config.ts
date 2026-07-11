import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Evita que Next resuelva el lockfile de /workspaces como raíz del monorepo.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@esitef/db"],
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
