import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  basePath: '',
  productionBrowserSourceMaps: process.env.NODE_ENV === 'development',
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    processEnv : {
      ...Object.fromEntries(
        Object.entries(process.env).filter(
          ([key]) => key.includes('NEXT_PRIVATE')
        ),
      ),
    }
  },

  webpack: config => {
    config.module.rules.unshift({
      test: /pdf\.worker\.(min\.)?js/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[contenthash].[ext]',
            publicPath: '_next/static/worker',
            outputPath: 'static/worker'
          }
        }
      ]
    })
  }
};

export default nextConfig;
