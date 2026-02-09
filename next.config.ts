import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'awsimgsrc.dmm.co.jp',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pics.dmm.co.jp',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'p.dmm.co.jp',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
