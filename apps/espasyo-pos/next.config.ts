import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["core-lib"],
  basePath: "",
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
      {
        source: "/authentication-api/:path*",
        destination: `${API_URL}/authentication-api/:path*`,
      },
    ];
  },
};

export default nextConfig;
