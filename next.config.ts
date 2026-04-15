import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Bypass Next.js image optimization pipeline entirely.
    // Images are served directly from /public — no _next/image caching layer.
    // Combined with Cache-Control: no-store headers below, updated agent
    // photos always appear immediately without any cache invalidation needed.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Agent avatar images — always fetch fresh, never cache
        source: '/agents/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
          { key: 'Pragma',        value: 'no-cache' },
        ],
      },
    ];
  },
};

export default nextConfig;
