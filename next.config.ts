import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-1cc8674ae89442b0bc438d6b8cbf5ad3.r2.dev',
      },
    ],
  },
};

export default nextConfig;
