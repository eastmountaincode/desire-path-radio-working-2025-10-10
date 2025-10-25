import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-1cc8674ae89442b0bc438d6b8cbf5ad3.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-45a2aff249e6472b8e76d3d9ed5c62b9.r2.dev',
      },
    ],
  },
};

export default nextConfig;
