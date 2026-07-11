import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
