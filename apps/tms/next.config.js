/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["core-lib"],
  basePath: "",
  productionBrowserSourceMaps: process.env.NODE_ENV === "development",
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    processEnv: {
      ...Object.fromEntries(
        Object.entries(process.env).filter(([key]) =>
          key.includes("NEXT_PRIVATE_")
        )
      ),
      TRUSTED_ORIGINS: [
        process.env.NEXT_PRIVATE_API_URL,
        process.env.NODE_ENV === "development" && "http://localhost:3000",
      ].filter(Boolean),
    },
  },
  images: {
    domains: ["storage.googleapis.com"],
  },
  turbopack: {},
};
