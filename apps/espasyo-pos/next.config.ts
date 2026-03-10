import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["core-lib"],
  basePath: "",
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
  poweredByHeader: false,
  images: {
    // Replace domains with remotePatterns
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "**",
      },
      // Add other domains if needed
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   pathname: '**',
      // },
    ],
  },
};

export default nextConfig;
